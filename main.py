import logging
import json
from os import path, system
from glob import glob
from posixpath import isabs
from genericpath import exists
from configparser import ConfigParser

logging.basicConfig(filename="/home/deck/Desktop/dev-plugins/Shortcuts/shortcuts.log", format='[Shortcuts] %(asctime)s %(levelname)s %(message)s', filemode='w+', force=True)
logger=logging.getLogger()
logger.setLevel(logging.INFO) # can be changed to logging.DEBUG for debugging issues

def log(txt):
    logger.info(txt)

Initialized = False

class Shortcut:
    def __init__(self, dict):
        self.name = dict['name']
        self.cmd = dict['cmd']
        self.id = dict['id']
    
    def toJSON(self):
        return json.dumps({ "id": self.id, "name": self.name, "cmd": self.cmd }, sort_keys=True, indent=4)

class Application:
    def __init__(self, path):
        Config = ConfigParser()
        Config.read(path)

        self.type = Config.get("Desktop Entry", "Type")
        self.name = Config.get("Desktop Entry", "Name")

        self.path = path

class Plugin:
    shortcuts = {}
    shortcutsPath = "/home/deck/homebrew/plugins/Shortcuts/shortcuts.json"

    def serializeShortcuts(self):
        res = {}

        for k,v in self.shortcuts.items():
            res[k] = { "id": v.id, "name": v.name, "cmd": v.cmd }

        return res

    # Normal methods: can be called from JavaScript using call_plugin_function("signature", argument)
    async def getShortcuts(self):
        self._load(self)
        return self.serializeShortcuts(self)
        
    async def addShortcut(self, shortcut):
        log("addShortcut triggered")
        self._addShortcut(self, self.shortcutsPath, shortcut)
        return self.serializeShortcuts(self)

    async def modShortcut(self, shortcut):
        self._modShortcut(self, self.shortcutsPath, shortcut)
        return self.serializeShortcuts(self)

    async def remShortcut(self, shortcut):
        self._remShortcut(self, self.shortcutsPath, shortcut)
        return self.serializeShortcuts(self)

    async def launchApp(self, name, cmd):
        log(f"Launching {name}")
        
        system(cmd)
        pass

    # async def getInstalledApps(self):
    #     apps = []
    #     appsDir = path.join(path.expanduser('~'), "share/applications")
    #     locAppsDir = path.join(path.expanduser('~'), "local/share/applications")
    #     desktopDir = path.join(path.expanduser('~'), "Desktop")

    #     aDirApps = glob(f"{appsDir}/*.desktop")
    #     locADirApps = glob(f"{locAppsDir}/*.desktop")
    #     deskDirApps = glob(f"{desktopDir}/*.desktop")

    #     if (exists(aDirApps)):
    #         for file in aDirApps:
    #             app = Application(file)
    #             if (app.type == "Application"):
    #                 apps.append(app)
        
    #     if (exists(locADirApps)):
    #         for file in locADirApps:
    #             app = Application(file)
    #             if (app.type == "Application"):
    #                 apps.append(app)
        
    #     if (exists(deskDirApps)):
    #         for file in deskDirApps:
    #             app = Application(file)
    #             if (app.type == "Application"):
    #                 apps.append(app)

    #     return apps

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        global Initialized
        if Initialized:
            return
        
        Initialized = True

        log("Initializing Shorcuts Plugin")

        pass

    def _load(self):
        log("Analyzing Shortcuts JSON")
            
        if (exists(self.shortcutsPath)):
            try:
                with open(self.shortcutsPath, "r") as file:
                    shortcutsDict = json.load(file)

                    for k,v in shortcutsDict.items():
                        log(f"Adding shortcut {v['name']}")
                        self.shortcuts[v['id']] = Shortcut(v)
                        log(f"Added shortcut {v['name']}")

            except Exception as e:
                log(f"Exception while parsing shortcuts: {e}") # error reading json
        else:
            exception = Exception("Unabled to locate shortcuts.json: file does not exist")
            raise exception

        pass

    def _addShortcut(self, path, shortcut):
        log("_addShortcut triggered")
        if (shortcut['id'] not in self.shortcuts):
            self.shortcuts[shortcut['id']] = Shortcut(shortcut)
            log(f"Adding shortcut {shortcut['name']}")
            res = self.serializeShortcuts(self)
            jDat = json.dumps(res, indent=4)

            with open(path, "w") as outfile:
                outfile.write(jDat)
        else:
            log(f"Shortcut {shortcut['name']} already exists")

        pass

    def _modShortcut(self, path, shortcut):
        if (shortcut['id'] in self.shortcuts):
            self.shortcuts[shortcut['id']] = Shortcut(shortcut)
            res = self.serializeShortcuts(self)
            jDat = json.dumps(res, indent=4)

            with open(path, "w") as outfile:
                outfile.write(jDat)
        else:
            log(f"Shortcut {shortcut['name']} does not exist")

        pass

    def _remShortcut(self, path, shortcut):
        if (shortcut['id'] in self.shortcuts):
            del self.shortcuts[shortcut['id']]
            log(f"removing shortcut {shortcut['name']}")
            res = self.serializeShortcuts(self)
            jDat = json.dumps(res, indent=4)

            with open(path, "w") as outfile:
                outfile.write(jDat)
        else:
            log(f"Shortcut {shortcut['name']} does not exist")

        pass
