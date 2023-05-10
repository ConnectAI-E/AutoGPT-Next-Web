import { useState } from "react";
import type { ModelSettings } from "../utils/types";
import {
  GPT_35_TURBO,
  DEFAULT_MAX_LOOPS_CUSTOM_API_KEY,
  DEFAULT_MAX_LOOPS_FREE,
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE,
} from "../utils/constants";
import { isGuestMode } from "../utils/env-helper";

const SETTINGS_KEY = "AUTOGPT_SETTINGS";

export const DEFAULT_SETTINGS: ModelSettings = {
  customApiKey: "",
  customModelName: GPT_35_TURBO,
  customTemperature: DEFAULT_TEMPERATURE,
  customMaxLoops: DEFAULT_MAX_LOOPS_FREE,
  customMaxTokens: DEFAULT_MAX_TOKENS,
  customEndPoint: "",
  customGuestKey: "",
};

const loadSettings = (): ModelSettings => {
  const defaultSettings = { ...DEFAULT_SETTINGS };
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  const data = localStorage.getItem(SETTINGS_KEY);
  if (!data) {
    return defaultSettings;
  }

  try {
    const obj = JSON.parse(data) as ModelSettings;
    Object.entries(obj).forEach(([key, value]) => {
      if (key in defaultSettings) {
        defaultSettings[key] = value;
      }
    });
  } catch (error) {}

  if (!isGuestMode() && !defaultSettings.customApiKey) {
    return { ...DEFAULT_SETTINGS };
  }

  if (
    defaultSettings.customApiKey &&
    defaultSettings.customMaxLoops === DEFAULT_MAX_LOOPS_FREE
  ) {
    defaultSettings.customMaxLoops = DEFAULT_MAX_LOOPS_CUSTOM_API_KEY;
  }

  return { ...defaultSettings };
};

export function useSettings() {
  const [settings, setSettings] = useState<ModelSettings>(() => loadSettings());
  const saveSettings = (settings: ModelSettings) => {
    let newSettings = settings;
    const { customGuestKey } = settings;
    if (!settings.customApiKey && !isGuestMode()) {
      newSettings = {
        ...DEFAULT_SETTINGS,
        customGuestKey,
      };
    }
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  };

  const resetSettings = () => {
    localStorage.removeItem(SETTINGS_KEY);
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    saveSettings,
    resetSettings,
  };
}
