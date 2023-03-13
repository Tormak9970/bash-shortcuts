type Apps = {
  RegisterForAchievementChanges: (callback: () => void) => Unregisterer,
  RunGame: (gameId: string, unk1: string, unk2: number, unk3: number) => void,
  RemoveShortcut: (appId: number) => void,
  RegisterForAppDetails: (appId: number, callback: (details: SteamAppDetails) => void) => Unregisterer,
  TerminateApp: (gameId: string, unk1: boolean) => void,
  SetAppLaunchOptions: (appId: number, options: string) => void,
  SetShortcutStartDir: (appId: number, startDir: string) => void,
  SetShortcutExe: (appId: number, exePath: string) => void,
  AddShortcut: (appName: string, exePath: string) => number,

  RegisterForGameActionEnd: (callback: (unk1: number) => void) => Unregisterer,
  RegisterForGameActionStart: (callback: (unk1: number, appId: string, action: string) => void) => Unregisterer,
  RegisterForGameActionTaskChange: (callback: (data: any) => void) => Unregisterer,
  RegisterForGameActionUserRequest: (callback: (unk1: number, appId: string, action: string, requestedAction: string, appId_2: string) => void) => Unregisterer,
}

type InstallWizardInfo = {
  bCanChangeInstallFolder: boolean,
  bIsRetailInstall: boolean,
  currentAppID: number,
  eAppError: number,
  eInstallState: number, //probably a LUT for install status
  errorDetail: string,
  iInstallFolder: number, //LUT for install folders
  iUnmountedFolder: number,
  nDiskSpaceAvailable: number,
  nDiskSpaceRequired: number,
  rgAppIDs: number[],
}

type Installs ={
  RegisterForShowInstallWizard: (callback: (data: InstallWizardInfo) => void) => Unregisterer,
}

type UpdateTypeInfo = {
  completed_update: boolean,
  downloaded_bytes: number,
  has_update: boolean,
  total_bytes: number
}

type DownloadItem = {
  active: boolean,
  appid: number,
  buildid: number,
  completed: boolean,
  completed_time: number,
  deferred_time: number,
  downloaded_bytes: number,
  launch_on_completion: boolean,
  paused: boolean,
  queue_index: number,
  target_buildid: number,
  total_bytes: number,
  update_error: string,
  update_result: number,
  update_type_info: UpdateTypeInfo[]
}

type DownloadOverview = {
  lan_peer_hostname: string,
  paused: boolean,
  throttling_suspended: boolean,
  update_appid: number,
  update_bytes_downloaded: number,
  update_bytes_processed: number,
  update_bytes_staged: number,
  update_bytes_to_download: number,
  update_bytes_to_process: number,
  update_bytes_to_stage: number,
  update_disc_bytes_per_second: number,
  update_is_install: boolean,
  update_is_prefetch_estimate: boolean,
  update_is_shader: boolean,
  update_is_upload: boolean,
  update_is_workshop: boolean,
  update_network_bytes_per_second: number,
  update_peak_network_bytes_per_second: number,
  update_seconds_remaining: number,
  update_start_time: number,
  update_state: string
}

type Downloads = {
  RegisterForDownloadItems: (callback: (isDownloading: boolean, downloadItems: DownloadItem[]) => void) => Unregisterer,
  RegisterForDownloadOverview: (callback: (data: DownloadOverview) => void) => Unregisterer,
}

type GameSession = {
  RegisterForAchievementNotification: (callback: (data: any) => void) => Unregisterer,
  RegisterForAppLifetimeNotifications: (callback: (data: LifetimeNotification) => void) => Unregisterer,
  RegisterForScreenshotNotification: (callback: (data: any) => void) => Unregisterer,
}

type Messaging = {
  PostMessage: () => void,
  RegisterForMessages: (accountName: string, callback: (data: any) => void) => Unregisterer
}

type Notifications = {
  RegisterForNotifications: (callback: (unk1: number, unk2: number, unk3: ArrayBuffer) => void) => Unregisterer
}

type Screenshot = any;

type Screenshots = {
  GetLastScreenshotTake: () => Screenshot,
}

type System = {
  RegisterForOnSuspendRequest: (callback: (data: any) => void) => Unregisterer,
}

type Updates = {
  RegisterForUpdateStateChanges: (callback: (data: any) => void) => Unregisterer
  GetCurrentOSBranch: () => any
}

type User = {
  RegisterForCurrentUserChanges: (callback: (data: any) => void) => Unregisterer,
  RegisterForLoginStateChange: (callback: (username: string) => void) => Unregisterer,
  RegisterForPrepareForSystemSuspendProgress: (callback: (data: any) => void) => Unregisterer,
  RegisterForShutdownStart: (callback: () => void) => Unregisterer,
  RegisterForShutdownDone: (callback: () => void) => Unregisterer,
  StartRestart: () => void
}

interface SteamClient {
  Apps: Apps,
  Browser: any,
  BrowserView: any,
  ClientNotifications: any,
  Cloud: any,
  Console: any,
  Downloads: Downloads,
  FamilySharing: any,
  FriendSettings: any,
  Friends: any,
  GameSessions: GameSession,
  Input: any,
  InstallFolder: any,
  Installs: Installs,
  MachineStorage: any,
  Messaging: Messaging,
  Notifications: Notifications,
  OpenVR: any,
  Overlay: any,
  Parental: any,
  RegisterIFrameNavigatedCallback: any,
  RemotePlay: any,
  RoamingStorage: any,
  Screenshots: Screenshots,
  Settings: any,
  SharedConnection: any,
  Stats: any,
  Storage: any,
  Streaming: any,
  System: System,
  UI: any,
  URL: any,
  Updates: Updates,
  User: User,
  WebChat: any,
  Window: Window
}

type SteamShortcut = {
  appid: number,
  data: {
    bIsApplication:boolean,
    strAppName: string,
    strExePath: string,
    strArguments:string,
    strShortcutPath:string,
    strSortAs:string
  }
}

type LifetimeNotification = {
  unAppID: number;
  nInstanceID: number;
  bRunning: boolean;
}

type SteamAppAchievements = {
  nAchieved:number
  nTotal:number
  vecAchievedHidden:any[]
  vecHighlight:any[]
  vecUnachieved:any[]
}

type SteamAppLanguages = {
  strDisplayName:string,
  strShortName:string
}

type SteamAppDetails = {
  achievements: SteamAppAchievements,
  bCanMoveInstallFolder:boolean,
  bCloudAvailable:boolean,
  bCloudEnabledForAccount:boolean,
  bCloudEnabledForApp:boolean,
  bCloudSyncOnSuspendAvailable:boolean,
  bCloudSyncOnSuspendEnabled:boolean,
  bCommunityMarketPresence:boolean,
  bEnableAllowDesktopConfiguration:boolean,
  bFreeRemovableLicense:boolean,
  bHasAllLegacyCDKeys:boolean,
  bHasAnyLocalContent:boolean,
  bHasLockedPrivateBetas:boolean,
  bIsExcludedFromSharing:boolean,
  bIsSubscribedTo:boolean,
  bOverlayEnabled:boolean,
  bOverrideInternalResolution:boolean,
  bRequiresLegacyCDKey:boolean,
  bShortcutIsVR:boolean,
  bShowCDKeyInMenus:boolean,
  bShowControllerConfig:boolean,
  bSupportsCDKeyCopyToClipboard:boolean,
  bVRGameTheatreEnabled:boolean,
  bWorkshopVisible:boolean,
  eAppOwnershipFlags:number,
  eAutoUpdateValue:number,
  eBackgroundDownloads:number,
  eCloudSync:number,
  eControllerRumblePreference:number,
  eDisplayStatus:number,
  eEnableThirdPartyControllerConfiguration:number,
  eSteamInputControllerMask:number,
  iInstallFolder:number,
  lDiskUsageBytes:number,
  lDlcUsageBytes:number,
  nBuildID:number,
  nCompatToolPriority:number,
  nPlaytimeForever:number,
  nScreenshots:number,
  rtLastTimePlayed:number,
  rtLastUpdated:number,
  rtPurchased:number,
  selectedLanguage:{
      strDisplayName:string,
      strShortName:string
  }
  strCloudBytesAvailable:string,
  strCloudBytesUsed:string,
  strCompatToolDisplayName:string,
  strCompatToolName:string,
  strDeveloperName:string,
  strDeveloperURL:string,
  strDisplayName:string,
  strExternalSubscriptionURL:string,
  strFlatpakAppID:string,
  strHomepageURL:string,
  strLaunchOptions: string,
  strManualURL:string,
  strOwnerSteamID:string,
  strResolutionOverride:string,
  strSelectedBeta:string,
  strShortcutExe:string,
  strShortcutLaunchOptions:string,
  strShortcutStartDir:string,
  strSteamDeckBlogURL:string,
  unAppID:number,
  vecBetas:any[],
  vecDLC:any[],
  vecDeckCompatTestResults:any[],
  vecLanguages:SteamAppLanguages[],
  vecLegacyCDKeys:any[],
  vecMusicAlbums:any[],
  vecPlatforms:string[],
  vecScreenShots:any[],
}

type SteamGameClientData = {
  bytes_downloaded: string,
  bytes_total: string,
  client_name: string,
  clientid: string,
  cloud_status: number,
  display_status: number,
  is_available_on_current_platform: boolean,
  status_percentage: number
}

type SteamAppOverview = {
  app_type: number,
  gameid: string,
  appid: number,
  display_name: string,
  steam_deck_compat_category: number,
  size_on_disk: string | undefined, // can use the type of this to determine if an app is installed!
  association: { type: number, name: string }[],
  canonicalAppType: number,
  controller_support: number,
  header_filename: string | undefined,
  icon_data: string | undefined,
  icon_data_format: string | undefined,
  icon_hash: string,
  library_capsule_filename: string | undefined,
  library_id: number | string | undefined,
  local_per_client_data: SteamGameClientData,
  m_gameid: number | string | undefined,
  m_setStoreCategories: Set<number>,
  m_setStoreTags: Set<number>,
  mastersub_appid: number | string | undefined,
  mastersub_includedwith_logo: string | undefined,
  metacritic_score: number,
  minutes_playtime_forever: number,
  minutes_playtime_last_two_weeks: number,
  most_available_clientid: string,
  most_available_per_client_data: SteamGameClientData,
  mru_index: number | undefined,
  optional_parent_app_id: number | string | undefined,
  owner_account_id: number | string | undefined,
  per_client_data: SteamGameClientData[],
  review_percentage_with_bombs: number,
  review_percentage_without_bombs: number,
  review_score_with_bombs: number,
  review_score_without_bombs: number,
  rt_custom_image_mtime: string | undefined,
  rt_last_time_locally_played: number | undefined,
  rt_last_time_played: number,
  rt_last_time_played_or_installed: number,
  rt_original_release_date: number,
  rt_purchased_time: number,
  rt_recent_activity_time: number,
  rt_steam_release_date: number,
  rt_store_asset_mtime: number,
  selected_clientid: string,
  selected_per_client_data: SteamGameClientData,
  shortcut_override_appid: undefined,
  site_license_site_name: string | undefined,
  sort_as: string,
  third_party_mod: number | string | undefined,
  visible_in_game_list: boolean,
  vr_only: boolean | undefined,
  vr_supported: boolean | undefined,
  BHasStoreTag: () => any,
  active_beta: number | string | undefined,
  display_status: number,
  installed: boolean,
  is_available_on_current_platform: boolean,
  is_invalid_os_type: boolean | undefined,
  review_percentage: number,
  review_score: number,
  status_percentage: number,
  store_category: number[],
  store_tag: number[],
}

type SteamTab = {
  title: string,
  id: string,
  content: ReactElement,
  footer: {
      onOptrionActionsDescription: string,
      onOptionsButtion: () => any,
      onSecondaryActionDescription: ReactElement,
      onSecondaryButton: () => any
  }
}

type SteamCollection = {
  AsDeletableCollection: ()=>null
  AsDragDropCollection: ()=>null
  AsEditableCollection: ()=>null
  GetAppCountWithToolsFilter: (t:any) => any
  allApps: SteamAppOverview[]
  apps: Map<number, SteamAppOverview>
  bAllowsDragAndDrop: boolean
  bIsDeletable: boolean
  bIsDynamic: boolean
  bIsEditable: boolean
  displayName: string
  id: string,
  visibleApps: SteamAppOverview[]
}

type CollectionStore = {
  deckDesktopApps: Collection;
  userCollections: Collection[];
  localGamesCollection: LocalCollection;
  BIsHidden: (appId: number) => boolean;
  SetAppsAsHidden: (appIds: number[], hide: boolean) => void;
}

type LocalCollection = {
  AsDeletableCollection: () => null,
  AsDragDropCollection: () => null,
  AsEditableCollection: () => null,
  GetAppCountWithToolsFilter: (t) => any,
  allApps: SteamAppOverview[],
  apps: Map<number, SteamAppOverview>,
  bAllowsDragAndDrop: boolean,
  bIsDeletable: boolean,
  bIsDynamic: boolean,
  bIsEditable: boolean,
  displayName: string,
  id: string,
  visibleApps: SteamAppOverview[]
}

type Collection = {
  AsDragDropCollection: () => {
    RemoveApps: (overviews: SteamAppOverview[]) => void;
  };
  apps: {
    keys: () => IterableIterator<number>;
    has: (appId: number) => boolean;
  };
  bAllowsDragAndDrop: boolean;
}

type LoginStore = {
  m_strAccountName: string
}