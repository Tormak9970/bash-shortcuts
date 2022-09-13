from configparser import ConfigParser
from genericpath import exists
from glob import glob
import json
import logging
from os import path, system
from posixpath import isabs

import gi
gi.require_version('Gtk', '3.0')
from gi.repository import Gtk

logging.basicConfig(filename="/tmp/shortcuts.log",
                    format='[Shortcuts] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger=logging.getLogger()
logger.setLevel(logging.INFO) # can be changed to logging.DEBUG for debugging issues

def Log(txt):
    logger.info(f"[Shorcuts] {txt}")

class Shortcut:
    def __init__(self, dict):
        self.name = dict.name
        self.icon = dict.icon
        self.path = dict.path
        self.id = dict.id

class Application:
    def __init__(self, path):
        Config = ConfigParser()
        Config.read(path)

        self.type = Config.get("Desktop Entry", "Type")
        self.name = Config.get("Desktop Entry", "Name")

        icon = Config.get("Desktop Entry", "Icon")
        if (isabs(icon)):
            self.icon = icon
        else:
            theme = Gtk.IconTheme.get_default()
            icn = theme.lookup_icon(icon, 64, 0)
            if (icn):
                self.icon = icn.get_filename()
            else:
                self.type = "No Icon"

        self.path = Config.get("Desktop Entry", "Exec")

class Plugin:
    # Normal methods: can be called from JavaScript using call_plugin_function("signature", argument)
    async def getShortcuts(self):
        return self.shortcuts
        
    async def setShortcuts(self, data):
        await self._updateShortcuts(self, self.shortcutsPath, data)
        return self.shortcuts
    
    async def addShortcut(self, shortcut):
        await self._addShortcut(self, self.shortcutsPath, shortcut)
        return self.shortcuts

    async def modShortcut(self, shortcut):
        await self._modShortcut(self, self.shortcutsPath, shortcut)
        return self.shortcuts

    async def remShortcut(self, shortcut):
        await self._remShortcut(self, self.shortcutsPath, shortcut)
        return self.shortcuts

    async def launchApp(self, name, path):
        Log(f"Launching {name}")
        
        system(path)

        pass

    async def getInstalledApps(self):
        apps = []
        appsDir = path.join(path.expanduser('~'), "share/applications")
        locAppsDir = path.join(path.expanduser('~'), "local/share/applications")
        desktopDir = path.join(path.expanduser('~'), "Desktop")

        aDirApps = glob(f"{appsDir}/*.desktop")
        locADirApps = glob(f"{locAppsDir}/*.desktop")
        deskDirApps = glob(f"{desktopDir}/*.desktop")

        for file in aDirApps:
            app = Application(file)
            if (app.type == "Application"):
                apps.append(app)
        
        for file in locADirApps:
            app = Application(file)
            if (app.type == "Application"):
                apps.append(app)
        
        for file in deskDirApps:
            app = Application(file)
            if (app.type == "Application"):
                apps.append(app)

        return apps

    async def addManualShortcut(self, path):
        await self._addManualShortcut(self, path)
        return self.shortcuts

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        logger.info("Hello World!")
        
        self.shortcuts = {}
        self.shortcutsDevPath = path.join(path.expanduser('~'), "homebrew/plugins/Shortcuts/defaults/shortcuts.json")
        self.shortcutsPath = self.shortcutsDevPath # path.join(path.expanduser('~'), "homebrew/plugins/Shortcuts/shortcuts.json")

        await self._load(self)

        pass

    async def _load(self):
        await self._parseShortcuts(self, self.shortcutsPath)

        pass

    async def _parseShortcuts(self, path):
        Log("Analyzing Shortcuts JSON")
            
        if (exists(path)):
            try:
                with open(path, "r") as file:
                    shortcutsDict = json.load(file)
                    
                for itm in shortcutsDict.items():
                    if (itm.id not in [x.id for x in self.shortcuts.items()]):
                        self.shortcuts.append(Shortcut(itm))
                        Log(f"Adding shortcut {itm.name}")

            except Exception as e:
                Log(f"Exception while parsing shortcuts: {e}") # error reading json

        pass

    async def _updateShortcuts(self, path, data):
        jDat = json.dumps(data, indent=4)

        for itm in data.items():
            if (itm.id not in [x.id for x in self.shortcuts]):
                self.shortcuts[itm.id] = Shortcut(itm)
                Log(f"Adding shortcut {itm.name}")
        
        with open(path, "w") as outfile:
            outfile.write(jDat)
        
        pass

    async def _addShortcut(self, path, shortcut):
        if (shortcut.id not in [x.id for x in self.shortcuts]):
            self.shortcuts[shortcut.id] = shortcut
            Log(f"Adding shortcut {shortcut.name}")
            jDat = json.dumps(self.shortcuts, indent=4)

            with open(path, "w") as outfile:
                outfile.write(jDat)
        else:
            Log(f"Shortcut {shortcut.name} already exists")
        
        pass

    async def _addManualShortcut(self, path):
        # generate uuid6
        # get icon from .desktop file
        # create shortcut
        # add to self.shortcuts
        
        pass

    async def _modShortcut(self, path, shortcut):
        if (shortcut.id in [x.id for x in self.shortcuts]):
            self.shortcuts[shortcut.id] = shortcut
            Log(f"Modifying shortcut {shortcut.name}")
            jDat = json.dumps(self.shortcuts, indent=4)

            with open(path, "w") as outfile:
                outfile.write(jDat)
        else:
            Log(f"Shortcut {shortcut.name} does not exist")
        
        pass

    async def _remShortcut(self, path, shortcut):
        if (shortcut.id in [x.id for x in self.shortcuts]):
            del self.shortcuts[shortcut.id]
            Log(f"removing shortcut {shortcut.name}")
            jDat = json.dumps(self.shortcuts, indent=4)

            with open(path, "w") as outfile:
                outfile.write(jDat)
        else:
            Log(f"Shortcut {shortcut.name} does not exist")
        
        pass
