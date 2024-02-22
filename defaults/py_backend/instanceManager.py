#!/usr/bin/env python
import subprocess
from threading import Thread
from time import sleep
from copy import deepcopy

from .logger import log

instancesShouldRun = {}

class Instance:
  def __init__(self, clonedShortcut, flags, checkInterval, jsInteropManager):
    self.shortcut = clonedShortcut
    self.flags = flags
    self.shortcutProcess = None
    self.checkInterval = checkInterval
    self.jsInteropManager = jsInteropManager

  def createInstance(self):
    log(f"Created instance for shortcut {self.shortcut['name']} Id: {self.shortcut['id']}")
    command = [self.shortcut["cmd"]]

    for _, flag in enumerate(self.flags):
      command.append(f"-{flag[0]}")
      command.append(flag[1])

    self.shortcutProcess = subprocess.Popen(command, shell=True) # , stdout=subprocess.PIPE
    log(f"Ran process for shortcut {self.shortcut['name']} Id: {self.shortcut['id']}. Attempting to fetch status")
    status = self._getProcessStatus()
    log(f"Status for command was {status}. Name: {self.shortcut['name']} Id: {self.shortcut['id']}")
    self._onUpdate(status, None)
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
    status = self.shortcutProcess.poll()

    if (status is None):
      return 2
    elif (status < 0):
      return 4
    elif (status == 0):
      return 0
    elif (status > 0):
      return 3
    
  def listenForStatus(self):
    while True:
      log(f"Checking status for shortcut {self.shortcut['name']}. shouldRun: {instancesShouldRun[self.shortcut['id']]}")

      if (instancesShouldRun[self.shortcut["id"]]):
        status = self._getProcessStatus()

        if (status != 2):
          self._onTerminate(status)
          break
        else:
          sleep(self.checkInterval)
      else:
        status = self.killInstance()
        self._onTerminate(status)
        break

  def _onUpdate(self, status, data):
    log(f"Recieved update event for instance. Name {self.shortcut['name']} Id: {self.shortcut['id']}")
    log(f"Notifying frontend. Status: {status}")
    self.jsInteropManager.sendMessage(f"{self.shortcut['id']}", { "type": "update", "data": data, "started": True, "ended": False, "status": status })
    pass
  
  def _onTerminate(self, status):
    log(f"Recieved terminate event for instance. Name {self.shortcut['name']} Id: {self.shortcut['id']}")
    log(f"Notifying frontend. Status: {status}")
    self.jsInteropManager.sendMessage(f"{self.shortcut['id']}", { "type": "end", "data": None, "started": True, "ended": True, "status": status })

    if (self.shortcut["id"] not in instancesShouldRun):
      log(f"Missing instanceShouldRun for shortcut {self.shortcut['name']} with id {self.shortcut['id']}")
    else:
      del instancesShouldRun[self.shortcut["id"]]
    
    pass

def cloneObject(object):
  return deepcopy(object)

class InstanceManager:
  def __init__(self, checkInterval, jsInteropManager):
    self.checkInterval = checkInterval
    self.jsInteropManager = jsInteropManager

  def createInstance(self, shortcut, flags):
    log(f"Creating instance for {shortcut['name']} Id: {shortcut['id']}")
    instancesShouldRun[shortcut["id"]] = True
    cmdThread = Thread(target=self.runInstanceInThread, args=[cloneObject(shortcut), flags, self.checkInterval, self.jsInteropManager])
    cmdThread.start()
    pass
  
  def killInstance(self, shortcut):
    log(f"Killing instance for {shortcut['name']} Id: {shortcut['id']}")
    instancesShouldRun[shortcut["id"]] = False
    pass

  def runInstanceInThread(self, clonedShortcut, flags, checkInterval, jsInteropManager):
    log(f"Running instance in thread for {clonedShortcut['name']} Id: {clonedShortcut['id']}")
    instance = Instance(clonedShortcut, flags, checkInterval, jsInteropManager)
    instance.createInstance()
    instance.listenForStatus()
    pass
