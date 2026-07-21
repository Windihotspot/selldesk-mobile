// src/core/services/JwtService.ts (Ionic / Capacitor version)
// Install: npm i @capacitor/preferences

import { Preferences } from "@capacitor/preferences";

const ID_TOKEN_KEY = "id_token" as string;
export const USER_KEY = "user" as string;

/**
 * @description get token from Capacitor Preferences
 */
export const getToken = async (): Promise<string | null> => {
  const { value } = await Preferences.get({ key: ID_TOKEN_KEY });
  return value;
};

/**
 * @description save token into Capacitor Preferences
 * @param token: string
 */
export const saveToken = async (token: string): Promise<void> => {
  if (token) {
    await Preferences.set({ key: ID_TOKEN_KEY, value: token });
  }
};

/**
 * @description get/set/remove the cached user object
 */
export const doUser = async (
  user: any,
  action: "setItem" | "getItem" | "removeItem"
): Promise<any> => {
  if (action === "getItem") {
    const { value } = await Preferences.get({ key: USER_KEY });
    return value ? JSON.parse(value) : null;
  }
  if (action === "removeItem") {
    await Preferences.remove({ key: USER_KEY });
    return;
  }
  return Preferences.set({ key: USER_KEY, value: JSON.stringify(user) });
};

/**
 * @description remove token from Capacitor Preferences
 */
export const destroyToken = async (): Promise<void> => {
  await Preferences.remove({ key: ID_TOKEN_KEY });
};

export default { getToken, saveToken, destroyToken, doUser };