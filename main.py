#!/usr/bin/env python
import json
import os
import sys

sys.path.append(os.path.dirname(__file__))
# sys.path.append(os.path.join(os.path.dirname(__file__), "py_backend"))

from py_backend.instanceManager import InstanceManager
from py_backend.jsInterop import JsInteropManager
from settings import SettingsManager
from py_backend.logger import log

Initialized = False

class Plugin:
  pluginUser = os.environ["DECKY_USER"]
  pluginSettingsDir = os.environ["DECKY_PLUGIN_SETTINGS_DIR"]
  
  oldShortcutsPath = f"/home/{pluginUser}/.config/bash-shortcuts/shortcuts.json"

  shortcutsRunnerPath = f"\"/home/{pluginUser}/homebrew/plugins/bash-shortcuts/shortcutsRunner.sh\""

  jsInteropManager = JsInteropManager("", 8000)
  instanceManager = InstanceManager(0.25, jsInteropManager)
  settingsManager = SettingsManager(name='bash-shortcuts', settings_directory=pluginSettingsDir)

  # Normal methods: can be called from JavaScript using call_plugin_function("signature", argument)
  async def getShortcuts(self):
    return self.settingsManager.getSetting("shortcuts", {})
      
  async def addShortcut(self, shortcut):
    self._addShortcut(self, shortcut)
    return self.settingsManager.getSetting("shortcuts", {})

  async def setShortcuts(self, shortcuts):
    self._setShortcuts(self, shortcuts)
    return self.settingsManager.getSetting("shortcuts", {})

  async def modShortcut(self, shortcut):
    self._modShortcut(self, shortcut)
    return self.settingsManager.getSetting("shortcuts", {})

  async def remShortcut(self, shortcut):
    self._remShortcut(self, shortcut)
    return self.settingsManager.getSetting("shortcuts", {})

  async def runNonAppShortcut(self, shortcutId):
    self._runNonAppShortcut(self, shortcutId)

  async def killNonAppShortcut(self, shortcutId):
    self._killNonAppShortcut(self, shortcutId)

  async def getHomeDir(self):
    return self.pluginUser

  async def logMessage(self, message):
    log(message)

  # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
  async def _main(self):
    global Initialized
    if Initialized:
      return
    
    Initialized = True

    log("Initializing Shorcuts Plugin")

    self.settingsManager.read()
    
    if "shortcuts" not in self.settingsManager.settings:
      log("No shortcuts detected in settings.")
      if (os.path.exists(self.oldShortcutsPath)):
        log("Converting old shortcuts.")
        try:
          with open(self.oldShortcutsPath, "r") as file:
            shortcutsDict = json.load(file)
            log(f"Got shortcuts from old shortcuts.json. Shortcuts: {json.dumps(shortcutsDict)}")
            self.settingsManager.setSetting("shortcuts", shortcutsDict)
            
        except Exception as e:
          log(f"Exception while parsing shortcuts: {e}") # error reading json
      else:
        log("Adding default shortcut.")
        self.settingsManager.setSetting("shortcuts", { "fcba1cb4-4601-45d8-b919-515d152c56ef": { "id": "fcba1cb4-4601-45d8-b919-515d152c56ef", "name": "Konsole", "cmd": "konsole", "position": 1, "isApp": True } })
    else:
      log(f"Shortcuts loaded from settings. Shortcuts: {json.dumps(self.settingsManager.getSetting('shortcuts', {}))}")

    #* start websocket server
    self.jsInteropManager.startServer()

  async def _unload(self):
    self.jsInteropManager.stopServer()
    log("Plugin unloaded")
    pass

  def _addShortcut(self, shortcut):
    if (shortcut["id"] not in self.shortcuts):
      log(f"Adding shortcut {shortcut['name']}")
      shortcutsDict = self.settingsManager.getSetting("shortcuts", {})
      shortcutsDict[shortcut["id"]] = shortcut

      self.settingsManager.setSetting("shortcuts", shortcutsDict)
    else:
      log(f"Shortcut {shortcut['name']} already exists")

    pass

  def _setShortcuts(self, shortcuts):
    log(f"Setting shortcuts...")
    self.settingsManager.setSetting("shortcuts", shortcuts)

    pass

  def _modShortcut(self, shortcut):
    if (shortcut["id"] in self.shortcuts):
      log(f"Modifying shortcut {shortcut['name']}")
      shortcutsDict = self.settingsManager.getSetting("shortcuts", {})
      shortcutsDict[shortcut["id"]] = shortcut
      
      self.settingsManager.setSetting("shortcuts", shortcutsDict)
    else:
      log(f"Shortcut {shortcut['name']} does not exist")

    pass

  def _remShortcut(self, shortcut):
    if (shortcut["id"] in self.shortcuts):
      log(f"Removing shortcut {shortcut['name']}")
      shortcutsDict = self.settingsManager.getSetting("shortcuts", {})
      del shortcutsDict[shortcut["id"]]
      
      self.settingsManager.setSetting("shortcuts", shortcutsDict)
    else:
      log(f"Shortcut {shortcut['name']} does not exist")

    pass

  def _runNonAppShortcut(self, shortcutId):
    log(f"Running createInstance for shortcut with Id: {shortcutId}")
    self.instanceManager.createInstance(self.settingsManager.getSetting("shortcuts", {})[shortcutId])
  
  def _killNonAppShortcut(self, shortcutId):
    log(f"Running killInstance for shortcut with Id: {shortcutId}")
    self.instanceManager.killInstance(self.settingsManager.getSetting("shortcuts", {})[shortcutId])

