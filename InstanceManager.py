import subprocess
from threading import Thread
from queue import Queue
from time import sleep
from copy import deepcopy

callbackQueue = Queue()
instancesShouldRun = {}

class Instance:
  def __init__(self, runnerPath, clonedShortcut, checkInterval):
    self.runnerPath = runnerPath
    self.shortcut = clonedShortcut
    self.shortcutProcess = None
    self.checkInterval = checkInterval

  def createInstance(self):
    self.shortcutProcess = subprocess.Popen([self.runnerPath, self.shortcut["cmd"]], shell=True) #, stdout=subprocess.PIPE
    return 4 if self.shortcutProcess == None else self._getProcessStatus(self.shortcut, self.shortcutProcess)
  
  def killInstance(self):
    status = self._getProcessStatus()

    if (status == 2):
      self.shortcutProcess.kill()
      return 3
    else:
      return status

  def _getProcessStatus(self):
    if (self.shortcutProcess != None):
      self.shortcutProcess.Poll()

      if (self.shortcutProcess.returnCode < 0):
        return 4
      elif (self.shortcutProcess.returnCode == 0):
        return 0
      elif (self.shortcutProcess.returnCode > 0):
        return 3
      elif (self.shortcutProcess.returnCode == None):
        return 2
    else:
      return 1
    
  async def listenForStatus(self):
    while True:
      if (instancesShouldRun[self.shortcut["id"]]):
        status = self._getProcessStatus()

        if (status != 2):
          return status
        else:
          sleep(self.checkInterval)
      else:
        status = self.killInstance()
        callbackQueue.put({
          "terminated": {
            "status": status,
            "shortcut": self.shortcut
          }
        })
        break



def cloneObject(object):
  return deepcopy(object)

class InstanceManager:
  threads = {}
  shortcutsRunnerPath = ""
  checkInterval = 250

  def __init__(self, log, shortcutsRunnerPath, checkInterval):
    self.log = log
    self.shortcutsRunnerPath = shortcutsRunnerPath
    self.checkInterval = checkInterval

  def createInstance(self, shortcut):
    instancesShouldRun[shortcut["id"]] = True
    cmdThread = Thread(target=self.runInstanceInThread, args=[self.shortcutsRunnerPath, cloneObject(shortcut)])
    self.threads[shortcut["id"]] = cmdThread
    pass
  
  def killInstance(self, shortcut):
    instancesShouldRun[shortcut["id"]] = False
    pass

  def runInstanceInThread(self, runnerPath, clonedShortcut, checkInterval):
    instance = Instance(runnerPath, clonedShortcut, self.checkInterval)
    instance.createInstance()
    instance.listenForStatus()
    pass
  
  def _onThreadUpdate(self, shortcut, data):
    self.notifyFrontend(shortcut, { "update": data, "ended": False, "status": None })
    pass
  
  def _onThreadEnd(self, shortcut, status):
    self.notifyFrontend(shortcut, { "update": None, "ended": True, "status": status })

    if (shortcut["id"] not in instancesShouldRun):
      self.log(f"Missing instanceShouldRun for shortcut {shortcut['name']} with id {shortcut['id']}")
    else:
      del instancesShouldRun[shortcut["id"]]
      
    if (shortcut["id"] not in self.threads):
      self.log(f"Missing thread for shortcut {shortcut['name']} with id {shortcut['id']}")
    else:
      del self.threads[shortcut["id"]]
    
    pass

  async def listenForThreadEvents(self):
    while True:
      if (not callbackQueue.empty()):
        data = self.callbackQueue.get(False)
        
        if ("terminated" in data):
          self._onThreadEnd(data["shortcut"], data["status"])
        elif ("update" in data):
          self._onThreadUpdate(data["shortcut"], data["data"])

      sleep(self.checkInterval)

  def notifyFrontend(self, shortcut, data):
    update = data["update"]
    ended = data["ended"]
    status = data["status"]

    self.log(f"Notifying frontend for shortcut {shortcut['name']} Id: {shortcut['id']} Status: {status}")
    pass

