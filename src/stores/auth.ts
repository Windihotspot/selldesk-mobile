// src/stores/auth.ts
import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// ── INTERFACES (matching merchant-app) ───────────────────────────────────────
export interface IAppUser {
  accountid: string;
  quidlyuserid: string;
  fname: string;
  lname: string;
  email: string;
  merchantids: string[];
  bvn: string;
  nin: string;
  kyc_status: number;
  verifyentrydt: string;
  id_status: number;
  proofofaddress_status: number;
  isadmin: number;
}

export interface IMerchantUser {
  merchantid: string;
  accountid: string;
  quidlyuserid: string;
}

export interface IMerchant {
  accountid: string;
  merchantname: string;
  companyregno: string;
  companytypeid: string;
  entrydt: string;
  quidlyuserid: string;
  status: number;
  merchantid: string;
}

// ── STORE ─────────────────────────────────────────────────────────────────────
export const useAuth = defineStore(
  "auth",
  () => {
    const user         = ref<IAppUser>({} as IAppUser);
    const merchantUser = ref<IMerchantUser>({} as IMerchantUser);
    const merchants    = ref<IMerchant[]>([]);
    const isAuthenticating = ref(false);
    const initialized  = ref(false);

    // ── COMPUTED ───────────────────────────────────────────────────────────────
    const isLoggedIn = computed(() => !!user.value?.quidlyuserid);

    const email = computed(() => user.value?.email || "");

    const activeMerchant = computed<IMerchant | null>(
      () =>
        merchants.value.find(
          (m) => m.merchantid === merchantUser.value.merchantid
        ) || null
    );

    const merchantId   = computed(() => merchantUser.value.merchantid || "");
    const merchantName = computed(() => activeMerchant.value?.merchantname || "");
    const accountId    = computed(() => user.value?.accountid || "");
    const userId       = computed(() => user.value?.quidlyuserid || "");

    const hasMultipleMerchants = computed(() => merchants.value.length > 1);

    // ── ACTIONS ────────────────────────────────────────────────────────────────

    /**
     * Mirrors merchant-app verifyAuth() pattern exactly.
     * window.keycloak is set by keycloak-js init in src/auth/keycloak.ts.
     *
     * Flow:
     *  1. Decode KC token → email
     *  2. POST GetUserDetailsByEmailExtended → user + merchantids[]
     *  3. POST get_MerchantDetails for each id → merchants[]
     *  4. Auto-select first merchant (respects persisted choice on reload)
     */
    async function verifyAuth() {
      console.log("selldesk: starting verifyAuth");
      isAuthenticating.value = true;

      const kc = (window as any).keycloak;

      if (!kc || !kc.authenticated) {
        console.warn("selldesk: Keycloak not authenticated");
        purgeAuth();
        isAuthenticating.value = false;
        return;
      }

      try {
        // Refresh token if close to expiry
        try {
          await kc.updateToken(30);
        } catch {
          console.warn("Token refresh failed — using existing token");
        }

        // ── Step 1: email from token ──────────────────────────────────────────
        const decoded: any = jwtDecode(kc.token!);
        const userEmail: string = decoded.email;

        if (!userEmail) {
          console.error("No email in Keycloak token");
          purgeAuth();
          return;
        }

        console.log("selldesk: email from token →", userEmail);

        const base    = import.meta.env.VITE_API_URL as string;
        const headers = { Authorization: `Bearer ${kc.token}` };

        // ── Step 2: GetUserDetailsByEmailExtended ─────────────────────────────
        console.log("selldesk: calling GetUserDetailsByEmailExtended");
        const userRes = await axios.post(
          `${base}mdb/procedure/GetUserDetailsByEmailExtended`,
          { p_email: userEmail },
          { headers }
        );

        console.log("GetUserDetailsByEmailExtended →", userRes.data);

        if (userRes.data?.status !== 1 || !userRes.data?.jsresult?.length) {
          console.error("GetUserDetailsByEmailExtended: no data");
          purgeAuth();
          return;
        }

        user.value = userRes.data.jsresult[0] as IAppUser;

        // Baseline merchantUser (mirrors merchant-app)
        merchantUser.value.accountid    = user.value.accountid;
        merchantUser.value.quidlyuserid = user.value.quidlyuserid;

        const ids: string[] = user.value.merchantids || [];
        console.log("selldesk: merchantids →", ids);

        if (ids.length === 0) {
          console.warn("selldesk: user has no merchants");
          merchantUser.value.merchantid = "";
          initialized.value = true;
          return;
        }

        // Auto-select persisted or first merchantid
        if (!merchantUser.value.merchantid || !ids.includes(merchantUser.value.merchantid)) {
          merchantUser.value.merchantid = ids[0]!;
        }

        // ── Step 3: Fetch full merchant details for each id
        const results = await Promise.all(
          ids.map((mid) =>
            axios
              .post(
                `${base}mdb/procedure/GetMerchantDetails`,
                { p_merchantid: mid },
                { headers }
              )
              .then((r) => {
                if (r.data?.status === 1 && r.data?.jsresult?.length) {
                  return r.data.jsresult[0] as IMerchant;
                }
                return null;
              })
              .catch((err) => {
                console.error(`GetMerchantDetails failed for ${mid}`, err);
                return null;
              })
          )
        );

        merchants.value = results.filter(Boolean) as IMerchant[];
        console.log("selldesk: merchants →", merchants.value);

        // Validate persisted merchantid is still in the list
        const stillValid = merchants.value.some(
          (m) => m.merchantid === merchantUser.value.merchantid
        );
        if (!stillValid && merchants.value.length > 0) {
          merchantUser.value.merchantid = merchants.value[0]!.merchantid;
        }
      } catch (err) {
        console.error("selldesk: verifyAuth error", err);
        purgeAuth();
      } finally {
        isAuthenticating.value = false;
        initialized.value = true;
      }
    }

    /** Switch the active merchant — called by the dropdown */
    function selectMerchant(merchantid: string) {
      if (merchants.value.some((m) => m.merchantid === merchantid)) {
        merchantUser.value.merchantid = merchantid;
        console.log("selldesk: switched to merchant →", merchantid);
      }
    }

    function purgeAuth() {
      user.value         = {} as IAppUser;
      merchantUser.value = {} as IMerchantUser;
      merchants.value    = [];
      initialized.value  = false;
    }

    function logout() {
      purgeAuth();
    }

    return {
      // state
      user,
      merchantUser,
      merchants,
      isAuthenticating,
      initialized,
      // computed
      isLoggedIn,
      email,
      activeMerchant,
      merchantId,
      merchantName,
      accountId,
      userId,
      hasMultipleMerchants,
      // actions
      verifyAuth,
      selectMerchant,
      purgeAuth,
      logout,
    };
  },
  { persist: true }
);