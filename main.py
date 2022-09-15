import logging
import json
# from os import path, system
# from glob import glob
# from posixpath import isabs
from genericpath import exists
from configparser import ConfigParser

logging.basicConfig(filename="/home/deck/Desktop/dev-plugins/Shortcuts/shortcuts.log", format='[Shortcuts] %(asctime)s %(levelname)s %(message)s', filemode='w+', force=True)
logger=logging.getLogger()
logger.setLevel(logging.INFO) # can be changed to logging.DEBUG for debugging issues

def log(txt):
    logger.info(f"[Shorcuts] {txt}")

Initialized = False

class Shortcut:
    def __init__(self, dict):
        print(dict)
        self.name = dict['name']
        self.path = dict['path']
        self.id = dict['id']
    
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)

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

    # Normal methods: can be called from JavaScript using call_plugin_function("signature", argument)
    async def getShortcuts(self):
        self._load(self)
        return self.shortcuts
        
    async def addManualShortcut(self, id, path):
        await self._addManualShortcut(self, id, path)
        return self.shortcuts
        
    async def addShortcut(self, shortcut):
        self._addShortcut(self, self.shortcutsPath, shortcut)
        return self.shortcuts

    async def modShortcut(self, shortcut):
        self._modShortcut(self, self.shortcutsPath, shortcut)
        return self.shortcuts

    async def remShortcut(self, shortcut):
        self._remShortcut(self, self.shortcutsPath, shortcut)
        return self.shortcuts

    # async def launchApp(self, name, path):
    #     log(f"Launching {name}")
        
    #     system(path)
    #     pass

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

                    for key in shortcutsDict.keys():
                        itm = shortcutsDict[key]
                        log(f"Adding shortcut {itm['name']}")
                        self.shortcuts[itm['id']] = Shortcut(itm)

            except Exception as e:
                log(f"Exception while parsing shortcuts: {e}") # error reading json
        else:
            exception = Exception("Unabled to locate shortcuts.json: file does not exist")
            raise exception

        pass

    async def _addManualShortcut(self, id, path):
        Config = ConfigParser()
        Config.read(path)

        nShortDict = {
            "id": id,
            "name": Config.get("Desktop Entry", "Name"),
            "path": path
        }
        nShort = Shortcut(nShortDict)

        self.shortcuts[id] = nShort

        pass

    def _addShortcut(self, path, shortcut):
        if (shortcut['id'] not in [x.id for x in self.shortcuts]):
            self.shortcuts[shortcut['id']] = shortcut
            log(f"Adding shortcut {shortcut['name']}")
            jDat = json.dumps(self.shortcuts, indent=4)

            with open(path, "w") as outfile:
                outfile.write(jDat)
        else:
            log(f"Shortcut {shortcut['name']} already exists")

        pass

    def _modShortcut(self, path, shortcut):
        if (shortcut['id'] in [x.id for x in self.shortcuts]):
            self.shortcuts[shortcut['id']] = shortcut
            log(f"Modifying shortcut {shortcut['name']}")
            jDat = json.dumps(self.shortcuts, indent=4)

            with open(path, "w") as outfile:
                outfile.write(jDat)
        else:
            log(f"Shortcut {shortcut['name']} does not exist")
        pass

    def _remShortcut(self, path, shortcut):
        if (shortcut['id'] in [x.id for x in self.shortcuts]):
            del self.shortcuts[shortcut['id']]
            log(f"removing shortcut {shortcut['name']}")
            jDat = json.dumps(self.shortcuts, indent=4)

            with open(path, "w") as outfile:
                outfile.write(jDat)
        else:
            log(f"Shortcut {shortcut['name']} does not exist")
        pass
