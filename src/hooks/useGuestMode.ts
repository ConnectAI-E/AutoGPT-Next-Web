import { useState, useEffect } from "react";
import { env } from "../env/client.mjs";

export function useGuestMode(customGuestKey = "") {
  const [guestData, setGuestData] = useState({
    isValidGuest: false,
    isGuestMode: false,
  });

  useEffect(() => {
    const publicGuestKey = env.NEXT_PUBLIC_GUEST_KEY ?? "";
    const keys = publicGuestKey.split(",").filter((key) => !!key);
    const isGuestMode = keys.length > 0;
    const isMatchedGuestKey = !!keys.find((key) => key === customGuestKey);
    const isValidGuest = isMatchedGuestKey;
    setGuestData({ isValidGuest, isGuestMode });
  }, [customGuestKey]);

  return guestData;
}
