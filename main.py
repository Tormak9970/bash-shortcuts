import logging
import json
# from os import path, system
# from glob import glob
# from posixpath import isabs
from genericpath import exists
# from configparser import ConfigParser

# import gi
# gi.require_version('Gtk', '3.0')
# from gi.repository import Gtk

logging.basicConfig(filename="/home/deck/Desktop/dev-plugins/Shortcuts/shortcuts.log", format='[Shortcuts] %(asctime)s %(levelname)s %(message)s', filemode='w+', force=True)
logger=logging.getLogger()
logger.setLevel(logging.INFO) # can be changed to logging.DEBUG for debugging issues

def log(txt):
    logger.info(f"[Shorcuts] {txt}")

Initialized = False

class Shortcut:
    def __init__(self, dict):
        self.name = dict.name
        self.icon = dict.icon
        self.path = dict.path
        self.id = dict.id

# class Application:
#     def __init__(self, path):
#         Config = ConfigParser()
#         Config.read(path)

#         self.type = Config.get("Desktop Entry", "Type")
#         self.name = Config.get("Desktop Entry", "Name")

#         icon = Config.get("Desktop Entry", "Icon")
#         if (isabs(icon)):
#             self.icon = icon
#         else:
#             theme = Gtk.IconTheme.get_default()
#             icn = theme.lookup_icon(icon, 64, 0)
#             if (icn):
#                 self.icon = icn.get_filename()
#             else:
#                 self.type = "No Icon"

#         self.path = path

class Plugin:
    shortcuts = {}
    shortcutsPath = "/home/deck/homebrew/plugins/Shortcuts/shortcuts.json"

    # Normal methods: can be called from JavaScript using call_plugin_function("signature", argument)
    async def getShortcuts(self):
        self._load(self)
        return self.shortcuts
        
    # async def addShortcut(self, shortcut):
    #     await self._addShortcut(self, self.shortcutsPath, shortcut)
    #     return self.shortcuts

    # async def modShortcut(self, shortcut):
    #     await self._modShortcut(self, self.shortcutsPath, shortcut)
    #     return self.shortcuts

    # async def remShortcut(self, shortcut):
    #     await self._remShortcut(self, self.shortcutsPath, shortcut)
    #     return self.shortcuts

    # async def launchApp(self, name, path):
    #     log(f"Launching {name}")
        
    #     system(path)


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

    # async def addManualShortcut(self, path):
    #     await self._addManualShortcut(self, path)
    #     return self.shortcuts

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

                    for itm in shortcutsDict.items():
                        self.shortcuts[itm.id] = Shortcut(itm)
                        log(f"Adding shortcut {itm.name}")

            except Exception as e:
                log(f"Exception while parsing shortcuts: {e}") # error reading json
        else:
            exception = Exception("Unabled to locate shortcuts.json: file does not exist")
            raise exception

        pass


    # async def _updateShortcuts(self, path, data):
    #     jDat = json.dumps(data, indent=4)

    #     for itm in data.items():
    #         if (itm.id not in [x.id for x in self.shortcuts]):
    #             self.shortcuts[itm.id] = Shortcut(itm)
    #             log(f"Adding shortcut {itm.name}")
        
    #     with open(path, "w") as outfile:
    #         outfile.write(jDat)


    # async def _addShortcut(self, path, shortcut):
    #     if (shortcut.id not in [x.id for x in self.shortcuts]):
    #         self.shortcuts[shortcut.id] = shortcut
    #         log(f"Adding shortcut {shortcut.name}")
    #         jDat = json.dumps(self.shortcuts, indent=4)

    #         with open(path, "w") as outfile:
    #             outfile.write(jDat)
    #     else:
    #         log(f"Shortcut {shortcut.name} already exists")


    # async def _addManualShortcut(self, path):
    #     # generate uuid6
    #     # get icon from .desktop file
    #     # create shortcut
    #     # add to self.shortcuts


    # async def _modShortcut(self, path, shortcut):
    #     if (shortcut.id in [x.id for x in self.shortcuts]):
    #         self.shortcuts[shortcut.id] = shortcut
    #         log(f"Modifying shortcut {shortcut.name}")
    #         jDat = json.dumps(self.shortcuts, indent=4)

    #         with open(path, "w") as outfile:
    #             outfile.write(jDat)
    #     else:
    #         log(f"Shortcut {shortcut.name} does not exist")


    # async def _remShortcut(self, path, shortcut):
    #     if (shortcut.id in [x.id for x in self.shortcuts]):
    #         del self.shortcuts[shortcut.id]
    #         log(f"removing shortcut {shortcut.name}")
    #         jDat = json.dumps(self.shortcuts, indent=4)

    #         with open(path, "w") as outfile:
    #             outfile.write(jDat)
    #     else:
    #         log(f"Shortcut {shortcut.name} does not exist")

