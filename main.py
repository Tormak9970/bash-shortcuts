#!/usr/bin/env python
import json
import os
import sys
import shutil

sys.path.append(os.path.dirname(__file__))

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
  guidesDirPath = f"/home/{pluginUser}/homebrew/plugins/bash-shortcuts/guides"

  settingsManager = SettingsManager(name='bash-shortcuts', settings_directory=pluginSettingsDir)

  guides = {}

  # Normal methods: can be called from JavaScript using call_plugin_function("signature", argument)
  async def getShortcuts(self):
    shortcuts:dict = self.settingsManager.getSetting("shortcuts", {})

    needToSet = False

    for key in shortcuts.keys():
      if not shortcuts[key].hasKey("hooks"):
        shortcuts[key]["hooks"] = []
        needToSet = True

    if needToSet:
      self.settingsManager.setSetting("shortcuts", shortcuts)

    return shortcuts

  async def getGuides(self):
    self._getGuides(self)
    return self.guides
  
  async def getSetting(self, key, defaultVal):
    return self.settingsManager.getSetting(key, defaultVal)

  async def setSetting(self, key, newVal):
    self.settingsManager.setSetting(key, newVal)
    log(f"Set setting {key} to {newVal}")
    pass

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
        self.settingsManager.setSetting("shortcuts", {
          "fcba1cb4-4601-45d8-b919-515d152c56ef": {
            "id": "fcba1cb4-4601-45d8-b919-515d152c56ef",
            "name": "Konsole",
            "cmd": "LD_PRELOAD= QT_SCALE_FACTOR=1.25 konsole",
            "position": 1,
            "isApp": True,
            "hooks": []
          }
        })
    else:
      log(f"Shortcuts loaded from settings. Shortcuts: {json.dumps(self.settingsManager.getSetting('shortcuts', {}))}")

    if "webSocketPort" not in self.settingsManager.settings:
      log("No WebSocket port detected in settings.")
      self.settingsManager.setSetting("webSocketPort", "5000")
      log("Set WebSocket port to default; \"5000\"")
    else:
      log(f"WebSocket port loaded from settings. Port: {self.settingsManager.getSetting('webSocketPort', '')}")
      
    self.jsInteropManager = JsInteropManager("localhost", self.settingsManager.getSetting("webSocketPort", "5000"))
    self.instanceManager = InstanceManager(0.25, self.jsInteropManager)

    #* start websocket server
    self.jsInteropManager.startServer()

  async def _unload(self):
    self.jsInteropManager.stopServer()
    log("Plugin unloaded")
    pass

  def _addShortcut(self, shortcut):
    if (shortcut["id"] not in self.settingsManager.getSetting("shortcuts", {})):
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
    if (shortcut["id"] in self.settingsManager.getSetting("shortcuts", {})):
      log(f"Modifying shortcut {shortcut['name']}")
      shortcutsDict = self.settingsManager.getSetting("shortcuts", {})
      shortcutsDict[shortcut["id"]] = shortcut
      
      self.settingsManager.setSetting("shortcuts", shortcutsDict)
    else:
      log(f"Shortcut {shortcut['name']} does not exist")

    pass

  def _remShortcut(self, shortcut):
    if (shortcut["id"] in self.settingsManager.getSetting("shortcuts", {})):
      log(f"Removing shortcut {shortcut['name']}")
      shortcutsDict = self.settingsManager.getSetting("shortcuts", {})
      del shortcutsDict[shortcut["id"]]
      
      self.settingsManager.setSetting("shortcuts", shortcutsDict)
    else:
      log(f"Shortcut {shortcut['name']} does not exist")

    pass

  def _getGuides(self):
    for guideFileName in os.listdir(self.guidesDirPath):
      with open(os.path.join(self.guidesDirPath, guideFileName), 'r') as guideFile:
        guideName = guideFileName.replace("_", " ").replace(".md", "")
        self.guides[guideName] = "\n".join(guideFile.readlines())

    pass

  def _runNonAppShortcut(self, shortcutId):
    log(f"Running createInstance for shortcut with Id: {shortcutId}")
    self.instanceManager.createInstance(self.settingsManager.getSetting("shortcuts", {})[shortcutId])
  
  def _killNonAppShortcut(self, shortcutId):
    log(f"Running killInstance for shortcut with Id: {shortcutId}")
    self.instanceManager.killInstance(self.settingsManager.getSetting("shortcuts", {})[shortcutId])

