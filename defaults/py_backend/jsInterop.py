#!/usr/bin/env python
from subprocess import Popen
import json
import os

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
    self.serverProcess = Popen(f"python {os.path.join(os.path.dirname(__file__), 'server.py')} \"{self.hostName}\" \"{self.port}\" \"{os.environ['DECKY_PLUGIN_LOG_DIR']}\"", shell=True)
    pass

  def sendMessage(self, type: str, data: dict):
    ws = WebSocketClient()
    log(f"Connecting to websocket {self.hostName}:{self.port}...")
    ws.connect(f"ws://{self.hostName}:{self.port}")
    log("Connected")

    log(f"Sending message to frontend. Type: {data}")
    ws.send(json.dumps({ "type": type, "data": data }))
    log("Message sent.")

    log("Closing websocket...")
    ws.close()
    log("Closed.")
    pass

  def stopServer(self):
    log(f"Killing Websocket server on port {self.port}")
    self.serverProcess.kill()
    log("Waiting for Websocket server to die")
    self.serverProcess.wait()
    log("Websocket server died")
    pass

        