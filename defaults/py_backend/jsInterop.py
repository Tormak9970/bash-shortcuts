#!/usr/bin/env python
from subprocess import Popen
import json

from .webSocketClient import Client as WebSocketClient
from .logger import log

class JsInteropManager:
  def __init__(self, hostName, port):
    self.hostName = hostName
    self.port = port
    pass

  def startServer(self):
    log(f"Starting Websocket server on port {self.port}")
    self.serverProcess = Popen(["python", "./server.py", self.hostName, self.port])
    self.client = WebSocketClient(f"ws://{self.hostName}:{self.port}/")
    self.client.handshake()
    pass

  def sendMessage(self, message: str, data: str):
    log(f"Sending message to frontend. Message: {data}")
    self.client.send(json.dumps({ "message": message, "data": data }))
    pass

  def stopServer(self):
    log(f"Closing Websocket client")
    self.client.close()
    log(f"Closed Websocket client")

    log(f"Killing Websocket server on port {self.port}")
    self.serverProcess.kill()
    log("Waiting for Websocket server to die")
    self.serverProcess.wait()
    log("Websocket server died")
    pass

        