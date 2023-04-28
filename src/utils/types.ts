export type ModelSettings = {
  customApiKey: string;
  customModelName: string;
  customTemperature: number;
  customMaxLoops: number;
  customLanguage: string;
  customEndPoint?: string;
  customMaxTokens?: number;
  customGuestKey?: string;
};

export type GuestSettings = {
  isValidGuest: boolean;
  isGuestMode: boolean;
};
