export type ModelSettings = {
  customApiKey?: string;
  customModelName?: string;
  customTemperature?: number;
  customMaxLoops?: number;
  customEndPoint?: string;
  customMaxTokens?: number;
  customGuestKey?: string;
};

export type GuestSettings = {
  isValidGuest: boolean;
  isGuestMode: boolean;
};

export type SettingModel = {
  settings: ModelSettings;
  saveSettings: (settings: ModelSettings) => void;
  resetSettings: () => void;
};
