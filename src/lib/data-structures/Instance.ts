/**
 * Class representing an Instance of Bash Shortcuts.
 */
export class Instance {
  unAppID: number | null; // null if the instance is not an app.
  steamShortcutName: string;
  shortcutId: string;
  shortcutIsApp: boolean;

  /**
   * Creates a new Instance.
   * @param unAppID The id of the app to create an instance for.
   * @param steamShortcutName The name of this instance.
   * @param shortcutId The id of the shortcut associated with this instance.
   * @param shortcutIsApp Whether the shortcut is an app.
   */
  constructor(
    unAppID: number | null,
    steamShortcutName: string,
    shortcutId: string,
    shortcutIsApp: boolean,
  ) {
    this.unAppID = unAppID;
    this.steamShortcutName = steamShortcutName;
    this.shortcutId = shortcutId;
    this.shortcutIsApp = shortcutIsApp;
  }
}
