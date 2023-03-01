#!/usr/bin/env python
from subprocess import Popen
import json
import os
import sys

from .webSocketClient import WebSocket as WebSocketClient
from .logger import log

class JsInteropManager:
  def __init__(self, hostName, port):
    self.hostName = hostName
    self.port = port
    pass

  def startServer(self):
    log(f"Starting Websocket server on port {self.port}")
    # self.serverProcess = Popen(["python", "server.py", self.hostName, self.port, os.environ["DECKY_PLUGIN_LOG_DIR"]], shell=True)
    self.serverProcess = Popen([sys.executable, "server.py", "localhost", "5000", "/home/deck/homebrew/logs/bash-shortcuts"])
    pass

  def sendMessage(self, message: str, data: str):
    ws = WebSocketClient()
    log(f"Connecting to websocket {self.hostName}:{self.port}...")
    ws.connect(f"ws://{self.hostName}:{self.port}")
    log(f"Connected")

    log(f"Sending message to frontend. Message: {data}")
    ws.send(json.dumps({ "message": message, "data": data }))
    log(f"Message sent.")

    log(f"Closing websocket...")
    ws.close()
    log(f"Closed.")
    pass

  def stopServer(self):
    log(f"Killing Websocket server on port {self.port}")
    self.serverProcess.kill()
    log("Waiting for Websocket server to die")
    self.serverProcess.wait()
    log("Websocket server died")
    pass

        