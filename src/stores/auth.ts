// src/stores/auth.ts (Ionic / Capacitor version)

import { ref } from "vue";
import { defineStore } from "pinia";
import ApiService from "@/services/ApiService";
import JwtService from "@/services/JwtService";
import type { IAppUser } from "@/types/quidlyInterfaces";

export interface LoginCredentials {
  email: string;
  password: string;
}

export const useAuthStore = defineStore("auth", () => {
  console.log("Auth store loaded");
  const errors = ref<Record<string, any>>({});
  const user = ref<IAppUser>({} as IAppUser);
  const isAuthenticated = ref(false);
  // starts true so router guards / splash screen can wait on it
  const isAuthenticating = ref(true);

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
    await JwtService.saveToken(authUser.quidlyuserid);
    await JwtService.doUser(authUser, "setItem");
  }

  function setError(error: any) {
    errors.value = { ...error };
  }

  async function purgeAuth() {
    isAuthenticated.value = false;
    user.value = {} as IAppUser;
    errors.value = {};
    await JwtService.destroyToken();
    await JwtService.doUser(null, "removeItem");
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

    const { data } = await ApiService.post(
      "/mdb/procedure/spEmailLogin",
      payload
    );

    // 👇 ADD THESE LOGS HERE
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
    const { data } = await ApiService.post(
      "/mdb/procedure/GetUserDetailsByEmailExtended",
      {
        p_email: credentials.email,
      }
    );
    console.log("========== EMAIL LOGIN RESPONSE ==========");
console.log(JSON.stringify(data, null, 2));
console.log("status:", data.status);
console.log("jsresult:", data.jsresult);
console.log("isArray:", Array.isArray(data.jsresult));
console.log("length:", data.jsresult?.length);

    if (data.status !== 1 || !data.jsresult?.length) {
      setError({ error: "User not found" });
      return false;
    }

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
    errors,
    user,
    isAuthenticated,
    isAuthenticating,
    initFromStorage,
    login,
    logout,
    emailLogin
  };
});