import json
import os
from genericpath import exists
import sys

sys.path.append(os.path.dirname(__file__))

import instanceManager
from logger import log

Initialized = False

class Shortcut:
  def __init__(self, dict):
    self.name = dict["name"]
    self.cmd = dict["cmd"]
    self.id = dict["id"]
    self.position = dict["position"]
    self.isApp = dict["isApp"] if "isApp" in dict else True
    
  def toJSON(self):
    return json.dumps(self.toDict(), sort_keys=True, indent=4)
  
  def toDict(self):
    return { "id": self.id, "name": self.name, "cmd": self.cmd, "position": self.position, "isApp": self.isApp }

class Plugin:
  plugin_user = os.environ["DECKY_USER"]
  shortcuts = {}
  shortcutsPath = f"/home/{plugin_user}/.config/bash-shortcuts/shortcuts.json"
  shortcutsRunnerPath = f"\"/home/{plugin_user}/homebrew/plugins/bash-shortcuts/shortcutsRunner.sh\""
  instanceManager = instanceManager.InstanceManager(250)

  def serializeShortcuts(self):
    res = {}

    for k,v in self.shortcuts.items():
      res[k] = { "id": v.id, "name": v.name, "cmd": v.cmd, "position": v.position, "isApp": v.isApp }

    return res

  # Normal methods: can be called from JavaScript using call_plugin_function("signature", argument)
  async def getShortcuts(self):
    self._load(self)
    return self.serializeShortcuts(self)
      
  async def addShortcut(self, shortcut):
    self._addShortcut(self, self.shortcutsPath, shortcut)
    return self.serializeShortcuts(self)

  async def setShortcuts(self, shortcuts):
    self._setShortcuts(self, self.shortcutsPath, shortcuts)
    return self.serializeShortcuts(self)

  async def modShortcut(self, shortcut):
    self._modShortcut(self, self.shortcutsPath, shortcut)
    return self.serializeShortcuts(self)

  async def remShortcut(self, shortcut):
    self._remShortcut(self, self.shortcutsPath, shortcut)
    return self.serializeShortcuts(self)

  async def runNonAppShortcut(self, shortcutId):
    self._runNonAppShortcut(self, shortcutId)

  async def killNonAppShortcut(self, shortcutId):
    self._killNonAppShortcut(self, shortcutId)

  async def getHomeDir(self):
    return self.plugin_user

  async def logMessage(self, message):
    log(message)

  # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
  async def _main(self):
    global Initialized
    if Initialized:
      return
    
    Initialized = True

    log("Initializing Shorcuts Plugin")

    if not os.path.exists(self.shortcutsPath):
      if not os.path.exists(os.path.dirname(self.shortcutsPath)):
        os.mkdir(os.path.dirname(self.shortcutsPath))
      
      data = {
        "fcba1cb4-4601-45d8-b919-515d152c56ef": {
          "id": "fcba1cb4-4601-45d8-b919-515d152c56ef",
          "name": "Konsole",
          "cmd": "konsole",
          "position": 1,
          "isApp": True
        }
      }

      with open(self.shortcutsPath, "w") as file:
        json.dump(data, file, indent=4)

    self.instanceManager.listenForThreadEvents()

    pass

  async def _unload(self):
    log("Plugin unloaded")
    pass

  def _load(self):
    log("Analyzing Shortcuts JSON")
        
    if (exists(self.shortcutsPath)):
      try:
        with open(self.shortcutsPath, "r") as file:
          shortcutsDict = json.load(file)

          for k,v in shortcutsDict.items():
            log(f"Adding shortcut {v['name']}")
            self.shortcuts[v["id"]] = Shortcut(v)
            log(f"Added shortcut {v['name']}")

      except Exception as e:
        log(f"Exception while parsing shortcuts: {e}") # error reading json
    else:
      exception = Exception("Unabled to locate shortcuts.json: file does not exist")
      raise exception

    pass

  def _addShortcut(self, path, shortcut):
    if (shortcut["id"] not in self.shortcuts):
      self.shortcuts[shortcut["id"]] = Shortcut(shortcut)
      log(f"Adding shortcut {shortcut['name']}")
      res = self.serializeShortcuts(self)
      jDat = json.dumps(res, indent=4)

      with open(path, "w") as outfile:
        outfile.write(jDat)
    else:
      log(f"Shortcut {shortcut['name']} already exists")

    pass

  def _setShortcuts(self, path, shortcuts):
    for shortcut in shortcuts:
      if (shortcut["id"] in self.shortcuts):
        self.shortcuts[shortcut["id"]] = Shortcut(shortcut)
      else:
        log(f"Shortcut {shortcut['name']} does not exist")
        
    res = self.serializeShortcuts(self)
    jDat = json.dumps(res, indent=4)

    with open(path, "w") as outfile:
      outfile.write(jDat)

    pass

  def _modShortcut(self, path, shortcut):
    if (shortcut["id"] in self.shortcuts):
      self.shortcuts[shortcut["id"]] = Shortcut(shortcut)
      res = self.serializeShortcuts(self)
      jDat = json.dumps(res, indent=4)

      with open(path, "w") as outfile:
        outfile.write(jDat)
    else:
      log(f"Shortcut {shortcut['name']} does not exist")

    pass

  def _remShortcut(self, path, shortcut):
    if (shortcut["id"] in self.shortcuts):
      del self.shortcuts[shortcut["id"]]
      log(f"removing shortcut {shortcut['name']}")
      res = self.serializeShortcuts(self)
      jDat = json.dumps(res, indent=4)

      with open(path, "w") as outfile:
        outfile.write(jDat)
    else:
      log(f"Shortcut {shortcut['name']} does not exist")

    pass

  def _runNonAppShortcut(self, shortcutId):
    self.instanceManager.createInstance(self.shortcuts[shortcutId].toDict())
  
  def _killNonAppShortcut(self, shortcutId):
    self.instanceManager.killInstance(self.shortcuts[shortcutId].toDict())

