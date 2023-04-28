import { useState, useEffect } from "react";
import { env } from "../env/client.mjs";

export function useGuestMode(customGuestKey = "") {
  const [isValidGuest, setIsValidGuest] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    const publicGuestKey = env.NEXT_PUBLIC_GUEST_KEY ?? "";
    const keys = publicGuestKey.split(",").filter((key) => !!key);
    const isGuestMode = keys.length > 0;
    const isMatchedGuestKey = !!keys.find((key) => key === customGuestKey);
    const isValidGuest = isMatchedGuestKey;
    setIsValidGuest(isValidGuest);
    setIsGuestMode(isGuestMode);
  }, [customGuestKey]);

  return {
    isValidGuest,
    isGuestMode,
  };
}
