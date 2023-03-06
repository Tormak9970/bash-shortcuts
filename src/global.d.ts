type Unregisterer = {
  unregister: () => void;
}

type ShortcutsDictionary = {
  [key: string]: Shortcut
}

type GuidePages = {
  [key: string]: string
}