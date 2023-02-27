#!/usr/bin/env python
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
  def __init__(self, clonedShortcut, checkInterval):
    self.shortcut = clonedShortcut
    self.shortcutProcess = None
    self.checkInterval = checkInterval

  def createInstance(self):
    log(f"Created instance for shortcut {self.shortcut['name']} Id: {self.shortcut['id']}")
    self.shortcutProcess = subprocess.Popen([self.shortcut["cmd"]], shell=True) #, stdout=subprocess.PIPE
    status = self._getProcessStatus(self.shortcut, self.shortcutProcess)
    # ! This log isnt running. figure out why
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
      log(f"Checking status for shortcut {self.shortcut['name']}. shouldRun: {instancesShouldRun[self.shortcut['id']]}")

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
          break
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
  checkInterval = 250

  def __init__(self, checkInterval):
    self.checkInterval = checkInterval

  def createInstance(self, shortcut):
    log(f"Creating instance for {shortcut['name']} Id: {shortcut['id']}")
    instancesShouldRun[shortcut["id"]] = True
    cmdThread = Thread(target=self.runInstanceInThread, args=[cloneObject(shortcut), self.checkInterval])
    self.threads[shortcut["id"]] = cmdThread
    cmdThread.start()
    pass
  
  def killInstance(self, shortcut):
    log(f"Killing instance for {shortcut['name']} Id: {shortcut['id']}")
    instancesShouldRun[shortcut["id"]] = False
    pass

  def runInstanceInThread(self, clonedShortcut, checkInterval):
    log(f"Running instance in thread for {clonedShortcut['name']} Id: {clonedShortcut['id']}")
    instance = Instance(clonedShortcut, checkInterval)
    instance.createInstance()
    instance.listenForStatus()
    pass
  
  def _onThreadUpdate(self, jsInteropManager, shortcut, status, data):
    log(f"Recieved update event for instance. Name {shortcut['name']} Id: {shortcut['id']}")
    self.notifyFrontend(jsInteropManager, shortcut, { "update": data, "started": True, "ended": False, "status": status })
    pass
  
  def _onThreadEnd(self, jsInteropManager, shortcut, status):
    log(f"Recieved terminate event for instance. Name {shortcut['name']} Id: {shortcut['id']}")
    self.notifyFrontend(jsInteropManager, shortcut, { "update": None, "started": True, "ended": True, "status": status })

    if (shortcut["id"] not in instancesShouldRun):
      log(f"Missing instanceShouldRun for shortcut {shortcut['name']} with id {shortcut['id']}")
    else:
      del instancesShouldRun[shortcut["id"]]
      
    if (shortcut["id"] not in self.threads):
      log(f"Missing thread for shortcut {shortcut['name']} with id {shortcut['id']}")
    else:
      del self.threads[shortcut["id"]]
    
    pass

  async def listenForThreadEvents(self, jsInteropManager):
    while True:
      if (not callbackQueue.empty()):
        data = callbackQueue.get(False)
        
        log(f"Data recieved: {json.dumps(data)}")
        if ("terminated" in data):
          self._onThreadEnd(jsInteropManager, data["shortcut"], data["status"])
        elif ("update" in data):
          self._onThreadUpdate(jsInteropManager, data["shortcut"], data["status"], data["data"])

        callbackQueue.task_done()

      sleep(self.checkInterval)

  def notifyFrontend(self, jsInteropManager, shortcut, data):
    update = data["update"]
    started = data["started"]
    ended = data["ended"]
    status = data["status"]

    log(f"Notifying frontend for shortcut {shortcut['name']} Id: {shortcut['id']} Status: {status}")
    pass
