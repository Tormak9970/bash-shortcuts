// Types for the collectionStore global

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