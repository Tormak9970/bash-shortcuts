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
    self.serverProcess = Popen(["python", "./server.py", self.hostName, self.port, os.environ["DECKY_PLUGIN_LOG_DIR"]])
    pass

  def sendMessage(self, message: str, data: str):
    log(f"Sending message to frontend. Message: {data}")

    ws = WebSocketClient()
    ws.connect(f"ws://{self.hostName}:{self.port}")
    ws.send(json.dumps({ "message": message, "data": data }))
    # print(ws.recv())
    ws.close()

    log(f"Message sent.")
    pass

  def stopServer(self):
    log(f"Killing Websocket server on port {self.port}")
    self.serverProcess.kill()
    log("Waiting for Websocket server to die")
    self.serverProcess.wait()
    log("Websocket server died")
    pass

        