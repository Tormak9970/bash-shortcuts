import json
import subprocess
from threading import Thread
from queue import Queue
from time import sleep
from copy import deepcopy

from logger import log

callbackQueue = Queue()
instancesShouldRun = {}

class Instance:
  def __init__(self, runnerPath, clonedShortcut, checkInterval):
    self.runnerPath = runnerPath
    self.shortcut = clonedShortcut
    self.shortcutProcess = None
    self.checkInterval = checkInterval

  def createInstance(self):
    log(f"Created instance for shortcut {self.shortcut['name']} Id: {self.shortcut['id']}")
    self.shortcutProcess = subprocess.Popen([self.runnerPath, self.shortcut["cmd"]], shell=True) #, stdout=subprocess.PIPE
    status = 4 if self.shortcutProcess == None else self._getProcessStatus(self.shortcut, self.shortcutProcess)
    log(f"Status for command was {status}. Name: {self.shortcut['name']} Id: {self.shortcut['id']}")
    callbackQueue.put({
      "update": {
        "status": status,
        "shortcut": self.shortcut
      }
    })
    callbackQueue.task_done()
    return status
  
  def killInstance(self):
    log(f"Killing instance for shortcut {self.shortcut['name']} Id: {self.shortcut['id']}")
    status = self._getProcessStatus()

    if (status == 2):
      self.shortcutProcess.kill()
      return 3
    else:
      return status

  def _getProcessStatus(self):
    log(f"Getting process status for instance. Name: {self.shortcut['name']} Id: {self.shortcut['id']}")
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
          callbackQueue.put({
            "terminated": {
              "status": status,
              "shortcut": self.shortcut
            }
          })
          callbackQueue.task_done()
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
        callbackQueue.task_done()
        break

def cloneObject(object):
  return deepcopy(object)

class InstanceManager:
  threads = {}
  shortcutsRunnerPath = ""
  checkInterval = 250

  def __init__(self, shortcutsRunnerPath, checkInterval):
    self.shortcutsRunnerPath = shortcutsRunnerPath
    self.checkInterval = checkInterval

  def createInstance(self, shortcut):
    log(f"Creating instance for {shortcut['name']} Id: {shortcut['id']}")
    instancesShouldRun[shortcut["id"]] = True
    cmdThread = Thread(target=self.runInstanceInThread, args=[self.shortcutsRunnerPath, cloneObject(shortcut), self.checkInterval])
    self.threads[shortcut["id"]] = cmdThread
    cmdThread.start()
    pass
  
  def killInstance(self, shortcut):
    log(f"Killing instance for {shortcut['name']} Id: {shortcut['id']}")
    instancesShouldRun[shortcut["id"]] = False
    pass

  def runInstanceInThread(self, runnerPath, clonedShortcut, checkInterval):
    log(f"Running instance in thread for {clonedShortcut['name']} Id: {clonedShortcut['id']}")
    instance = Instance(runnerPath, clonedShortcut, checkInterval)
    instance.createInstance()
    instance.listenForStatus()
    pass
  
  def _onThreadUpdate(self, shortcut, status, data):
    log(f"Recieved update event for instance. Name {shortcut['name']} Id: {shortcut['id']}")
    self.notifyFrontend(shortcut, { "update": data, "started": True, "ended": False, "status": status })
    pass
  
  def _onThreadEnd(self, shortcut, status):
    log(f"Recieved terminate event for instance. Name {shortcut['name']} Id: {shortcut['id']}")
    self.notifyFrontend(shortcut, { "update": None, "started": True, "ended": True, "status": status })

    if (shortcut["id"] not in instancesShouldRun):
      log(f"Missing instanceShouldRun for shortcut {shortcut['name']} with id {shortcut['id']}")
    else:
      del instancesShouldRun[shortcut["id"]]
      
    if (shortcut["id"] not in self.threads):
      log(f"Missing thread for shortcut {shortcut['name']} with id {shortcut['id']}")
    else:
      del self.threads[shortcut["id"]]
    
    pass

  async def listenForThreadEvents(self):
    while True:
      if (not callbackQueue.empty()):
        data = callbackQueue.get(False)
        
        log(f"Data recieved: {json.dumps(data)}")
        if ("terminated" in data):
          self._onThreadEnd(data["shortcut"], data["status"])
        elif ("update" in data):
          self._onThreadUpdate(data["shortcut"], data["status"], data["data"])

        callbackQueue.task_done()

      sleep(self.checkInterval)

  def notifyFrontend(self, shortcut, data):
    update = data["update"]
    started = data["started"]
    ended = data["ended"]
    status = data["status"]

    log(f"Notifying frontend for shortcut {shortcut['name']} Id: {shortcut['id']} Status: {status}")
    pass
