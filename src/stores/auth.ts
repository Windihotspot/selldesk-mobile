// src/stores/auth.ts (Ionic / Capacitor version)

import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { Preferences } from "@capacitor/preferences";
import ApiService from "@/services/ApiService";
import JwtService from "@/services/JwtService";
import type { IAppUser } from "@/types/quidlyInterfaces";

/*
  IAppUser (from GetUserDetailsByEmailExtended / spEmailLogin) — for reference:

  {
    accountid: string;
    quidlyuserid: string;
    fname: string;
    lname: string;
    email: string;
    isadmin: number;
    merchantids: string[];       // list of merchant IDs this user can access
    bvn: string;
    nin: string | null;
    kyc_status: number;
    verifyentrydt: string | null;
    id_status: number | null;
    proofofaddress_status: number | null;
    note: string | null;
  }

  Note: unlike the web store, there is no separate merchant-details fetch
  here — we only have raw `merchantids: string[]`, no merchant names. If you
  later add a GetMerchantDetails-style call, wire it into `merchants` below
  and `merchantName` will pick it up automatically.
*/

export interface LoginCredentials {
  email: string;
  password: string;
}

// Same shape as web's IMerchant, kept optional so the store works
// with or without a merchant-details endpoint.
export interface IMerchant {
  merchantid: string;
  merchantname?: string;
  [key: string]: any;
}

const SELECTED_MERCHANT_KEY = "selldesk_selected_merchant_id";

export const useAuthStore = defineStore("auth", () => {
  const auth = useAuthStore()
  console.log("Auth store loaded");
  console.log("auth user:", auth.user);
  const errors = ref<Record<string, any>>({});
  const user = ref<IAppUser>({} as IAppUser);
  const isAuthenticated = ref(false);
  // starts true so router guards / splash screen can wait on it
  const isAuthenticating = ref(true);

  // Populated only if/when you add a merchant-details fetch (optional —
  // see selectMerchant()/merchantName below for how it's used if present).
  const merchants = ref<IMerchant[]>([]);

  // ── MERCHANT SELECTION STATE ────────────────────────────────────────────
  const activeMerchantId = ref<string>("");

  const merchantIds = computed<string[]>(() => user.value?.merchantids || []);

  const merchantId = computed(() => activeMerchantId.value);

  const activeMerchant = computed<IMerchant | null>(
    () => merchants.value.find((m) => m.merchantid === activeMerchantId.value) || null
  );

  const merchantName = computed(
    () => activeMerchant.value?.merchantname || activeMerchantId.value || ""
  );

  const hasMultipleMerchants = computed(() => merchantIds.value.length > 1);

  // Picks a valid merchant id: the persisted one if it's still in the
  // user's list, otherwise the first available id.
  async function resolveActiveMerchant() {
    const ids = merchantIds.value;
    if (ids.length === 0) {
      activeMerchantId.value = "";
      return;
    }

    let persisted = "";
    try {
      const { value } = await Preferences.get({ key: SELECTED_MERCHANT_KEY });
      persisted = value || "";
    } catch {
      // Preferences unavailable (e.g. web fallback) — ignore, fall through.
    }

    activeMerchantId.value = persisted && ids.includes(persisted) ? persisted : ids[0]!;
  }

  /** Switch the active merchant — called by the dropdown */
  async function selectMerchant(merchantid: string) {
    if (!merchantIds.value.includes(merchantid)) {
      console.warn("selldesk: attempted to select a merchant not in merchantids", merchantid);
      return;
    }

    activeMerchantId.value = merchantid;
    console.log("selldesk: switched to merchant →", merchantid);

    try {
      await Preferences.set({ key: SELECTED_MERCHANT_KEY, value: merchantid });
    } catch (err) {
      console.warn("selldesk: failed to persist selected merchant", err);
    }
  }

  // ── INIT FROM STORAGE ────────────────────────────────────────────────────
  // IMPORTANT: must be awaited once at app bootstrap (see main.ts),
  // since Preferences is async and can't be read synchronously like
  // localStorage was in the web version.
  async function initFromStorage() {
    isAuthenticating.value = true;
    try {
      const [token, storedUser] = await Promise.all([
        JwtService.getToken(),
        JwtService.doUser(null, "getItem"),
      ]);

      if (token && storedUser) {
        user.value = storedUser;
        isAuthenticated.value = true;
        await resolveActiveMerchant();
      } else {
        isAuthenticated.value = false;
      }
    } finally {
      isAuthenticating.value = false;
    }
  }

  async function setAuth(authUser: IAppUser) {
    isAuthenticated.value = true;
    user.value = authUser;
    errors.value = {};
    console.log("auth user:", authUser);
    await resolveActiveMerchant();
  }

  function setError(error: any) {
    errors.value = { ...error };
  }

  async function purgeAuth() {
    isAuthenticated.value = false;
    user.value = {} as IAppUser;
    errors.value = {};
    merchants.value = [];
    activeMerchantId.value = "";
    await JwtService.destroyToken();
    await JwtService.doUser(null, "removeItem");
    try {
      await Preferences.remove({ key: SELECTED_MERCHANT_KEY });
    } catch {
      // ignore
    }
  }

  async function login(credentials: LoginCredentials): Promise<boolean> {
    try {
      const payload = {
        _email: credentials.email,
        _encryptpwd: credentials.password,
      };

      console.log("========== LOGIN REQUEST ==========");
      console.log("URL:", "/mdb/procedure/spEmailLogin");
      console.log("Payload:", payload);

      const { data } = await ApiService.post("/mdb/procedure/spEmailLogin", payload);

      console.log("========== LOGIN RESPONSE ==========");
      console.log(JSON.stringify(data, null, 2));
      console.log("jsresult:", data.jsresult);
      console.log("Is Array?", Array.isArray(data.jsresult));

      if (!data.jsresult || data.jsresult.length === 0) {
        setError({ error: "Invalid email or password" });
        return false;
      }

      console.log("Authenticated User:", data.jsresult[0]);

      await setAuth(data.jsresult[0]);

      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    }
  }

  async function emailLogin(credentials: LoginCredentials): Promise<boolean> {
    try {
      console.log("========== LOGIN email REQUEST ==========");
      const data = await ApiService.post("/mdb/procedure/GetUserDetailsByEmailExtended", {
        p_email: credentials.email,
      });
      console.log("========== EMAIL LOGIN RESPONSE:", data);

      // if (data.status !== 1 || !data.jsresult?.length) {
      //   setError({ error: "User not found" });
      //   return false;
      // }

      const authUser = data.jsresult[0];

      await setAuth(authUser);

      return true;
    } catch (err: any) {
      console.error(err);
      setError({ error: "Unable to login" });
      return false;
    }
  }

  async function logout() {
    await purgeAuth();
  }

  return {
    // state
    errors,
    user,
    isAuthenticated,
    isAuthenticating,
    merchants,
    // computed
    merchantIds,
    merchantId,
    activeMerchant,
    merchantName,
    hasMultipleMerchants,
    // actions
    initFromStorage,
    login,
    logout,
    emailLogin,
    selectMerchant,
  };
});