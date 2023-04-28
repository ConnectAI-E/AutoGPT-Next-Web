import { useState } from "react";
import type { ModelSettings } from "../utils/types";
import {
  DEFAULT_MAX_LOOPS_CUSTOM_API_KEY,
  DEFAULT_MAX_LOOPS_FREE,
  GPT_35_TURBO,
} from "../utils/constants";
import { useGuestMode } from "./useGuestMode";

const SETTINGS_KEY = "AGENTGPT_SETTINGS";
export const DEFAULT_SETTINGS: ModelSettings = {
  customApiKey: "",
  customModelName: GPT_35_TURBO,
  customTemperature: 0.9,
  customMaxLoops: DEFAULT_MAX_LOOPS_FREE,
  customLanguage: "",
  customEndPoint: "",
  customMaxTokens: 400,
  customGuestKey: "",
};

const loadSettings = () => {
  const defaultSettions = DEFAULT_SETTINGS;
  if (typeof window === "undefined") {
    return defaultSettions;
  }

  const data = localStorage.getItem(SETTINGS_KEY);
  if (!data) {
    return defaultSettions;
  }

  try {
    const obj = JSON.parse(data) as ModelSettings;
    Object.entries(obj).forEach(([key, value]) => {
      if (defaultSettions.hasOwnProperty(key)) {
        // @ts-ignore
        defaultSettions[key] = value;
      }
    });
  } catch (error) {}

  if (
    defaultSettions.customApiKey &&
    defaultSettions.customMaxLoops === DEFAULT_MAX_LOOPS_FREE
  ) {
    defaultSettions.customMaxLoops = DEFAULT_MAX_LOOPS_CUSTOM_API_KEY;
  }

  return defaultSettions;
};

export function useSettings({ customLanguage }: { customLanguage: string }) {
  const [settings, setSettings] = useState<ModelSettings>(loadSettings);
  const { isValidGuest } = useGuestMode(settings.customGuestKey);

  const rewriteSettings = (settings: ModelSettings) => {
    const rewriteSettings = {
      ...settings,
      customLanguage,
      isValidGuest,
    };

    return rewriteSettings;
  };

  const saveSettings = (settings: ModelSettings) => {
    setSettings(rewriteSettings(settings));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  };

  return {
    settings,
    saveSettings,
  };
}
