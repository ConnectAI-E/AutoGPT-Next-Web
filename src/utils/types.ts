export type ModelSettings = {
  customApiKey: string;
  customModelName: string;
  customTemperature: number;
  customMaxLoops: number;
  customLanguage: string;
  maxTokens?: number;
  guestKey?: string;
};

export type GuestSettings = {
  isValidGuest: boolean;
  isGuestMode: boolean;
};
