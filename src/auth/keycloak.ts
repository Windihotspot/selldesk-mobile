// src/auth/keycloak.ts
import Keycloak, {
  type KeycloakInitOptions,
} from "keycloak-js";

let kc: Keycloak | null = null;
let initPromise: Promise<boolean> | null = null;

export function keycloak(): Keycloak {
  if (!kc) {
    kc = new Keycloak("/keycloak.json");
    // ── Set on window so auth.ts verifyAuth() can access it
    // (mirrors the pattern used in the merchant app)
    (window as any).keycloak = kc;
  }
  return kc;
}

/**
 * Initialize once. check-sso so public routes work without forcing login.
 * initPromise prevents double-init when router guard fires multiple times.
 */
export function initKeycloak(): Promise<boolean> {
  if (initPromise) return initPromise;

  const options: KeycloakInitOptions = {
    onLoad: "check-sso",
    pkceMethod: "S256",
    checkLoginIframe: false,
    silentCheckSsoRedirectUri:
      window.location.origin + "/silent-check-sso.html",
  };

  initPromise = keycloak()
    .init(options)
    .then((authenticated) => {
      // Keep window.keycloak in sync after init
      (window as any).keycloak = kc;
      console.log("selldesk: Keycloak init complete, authenticated =", authenticated);
      return authenticated;
    })
    .catch((err) => {
      console.error("selldesk: Keycloak init failed", err);
      return false;
    });

  return initPromise;
}

export function isAuthed(): boolean {
  return !!keycloak().authenticated;
}

export function login(redirectPath = "/invoices") {
  return keycloak().login({
    redirectUri: window.location.origin + redirectPath,
  });
}

export function logout(redirectPath = "/login") {
  return keycloak().logout({
    redirectUri: window.location.origin + redirectPath,
  });
}

export async function getToken(minValiditySeconds = 30): Promise<string | null> {
  const k = keycloak();
  if (!k.authenticated) return null;
  try {
    await k.updateToken(minValiditySeconds);
  } catch {
    console.warn("getToken: token refresh failed");
    return null;
  }
  return k.token ?? null;
}