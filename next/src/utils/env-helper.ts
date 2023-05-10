import { env } from "../env/client.mjs";

export const authEnabled = env.NEXT_PUBLIC_FF_AUTH_ENABLED;

export const publicGuestKey = env.NEXT_PUBLIC_GUEST_KEY ?? "";

export const isGuestMode = () => {
  const keys = publicGuestKey.split(",").filter((key) => !!key);
  const isGuestMode = keys.length > 0;
  return isGuestMode;
};
