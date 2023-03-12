import { Shortcut } from "../data-structures/Shortcut";
import { SteamController } from "./SteamController";

/**
 * Enum for the different hook events.
 */
export enum Hook {
  LOG_IN = "Log In",
  LOG_OUT = "Log Out",
  GAME_START = "Game Start",
  GAME_END = "Game End",
  GAME_INSTALL = "Game Install",
  GAME_UNINSTALL = "Game Uninstall",
  GAME_ACHIEVEMENT_UNLOCKED = "Game Achievement Unlocked",
  SCREENSHOT_TAKEN = "Screenshot Taken",
  MESSAGE_RECIEVED = "Message Recieved",
  STEAMOS_UPDATE_AVAILABLE = 'SteamOS Update Available',
  DECK_SHUTDOWN = "Deck Shutdown",
  DECK_SLEEP = "Deck Sleep"
}

export const hookAsOptions = Object.values(Hook).map((entry) => { return { label: entry, data: entry } });

/**
 * Controller for handling hook events.
 */
export class HookController {
  private steamController: SteamController;
  hooks = {};

  constructor(steamController: SteamController) {
    this.steamController = steamController;

    for (const value of Object.values(Hook)) {
      this.hooks[value] = {}
    }
  }

  init(shortcuts: ShortcutsDictionary): void {

  }

  updateHooks(shortcut: Shortcut) {
    
  }

  private registerHook(shortcut: Shortcut, hook: Hook): void {

  }

  removeHooks(shortcut: Shortcut) {

  }

  private unregisterHook(shortcut: Shortcut, hook: Hook): void {

  }

  listen(): void {

  }

  dismount(): void {

  }
}