from genericpath import exists
import json
import logging

logging.basicConfig(filename="/tmp/shortcuts.log",
                    format='[Shortcuts] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger=logging.getLogger()
logger.setLevel(logging.INFO) # can be changed to logging.DEBUG for debugging issues

def Log(txt):
    logger.info(f"[SHorcuts] {txt}")

class Shortcut:
    def __init__(self, dict):
        self.name = dict.name
        self.icon = dict.icon
        self.path = dict.path
        self.id = dict.id


class Plugin:
    # A normal method. It can be called from JavaScript using call_plugin_function("method_1", argument1, argument2)
    async def add(self, left, right):
        return left + right

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        logger.info("Hello World!")
        self._load()
        pass

    async def _load(self):
        self.shortcuts = []
        shortcutsPath = "/home/deck/homebrew/plugins/Shortcuts/shortcuts.json"
        shortcutsDevPath = "/home/deck/homebrew/plugins/Shortcuts/defaults/shortcuts.json"

        await self._parseShortcuts(shortcutsPath, shortcutsDevPath)

        pass


    async def _parseShortcuts(self, path, devPath):
        Log("Analyzing Shortcuts JSON")
            
        if (exists(path)):
            try:
                with open(path, "r") as fp:
                    shortcutsDict = json.load(fp)
                    
                for itm in shortcutsDict.items():
                    if (itm.id not in [x.name for x in self.shortcuts]):
                        self.shortcuts.append(Shortcut(itm))
                        Log(f"Adding shortcut {itm.name}")

            except Exception as e:
                Log(f"Exception while parsing shortcuts: {e}") # error reading json
        elif (exists(devPath)):
            try:
                with open(devPath, "r") as fp:
                    shortcutsDict = json.load(fp)
                    
                for itm in shortcutsDict.items():
                    if (itm.id not in [x.name for x in self.shortcuts]):
                        self.shortcuts.append(Shortcut(itm))
                        Log(f"Adding shortcut {itm.name}")

            except Exception as e:
                Log(f"Exception while parsing dev shortcuts: {e}") # error reading json


        pass
