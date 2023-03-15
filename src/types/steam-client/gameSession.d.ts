// Types for SteamClient.GameSession

type GameSession = {
  RegisterForAchievementNotification: (callback: (data: any) => void) => Unregisterer,
  RegisterForAppLifetimeNotifications: (callback: (data: LifetimeNotification) => void) => Unregisterer,
  RegisterForScreenshotNotification: (callback: (data: ScreenshotNotification) => void) => Unregisterer,
}

type ScreenshotNotification = {
  details: {
    bSpoilers: boolean,
    bUploaded: boolean,
    ePrivacy: number,
    hHandle: number,
    nAppID: number,
    nCreated: number,
    nHeight: number,
    nWidth: number,
    strCaption: "",
    strUrl: string
  }
  hScreenshot: number,
  strOperation: string,
  unAppID: number,
}

type LifetimeNotification = {
  unAppID: number;
  nInstanceID: number;
  bRunning: boolean;
}