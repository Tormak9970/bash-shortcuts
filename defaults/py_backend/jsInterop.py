from subprocess import Popen
from logger import log
from webSocketClient import Client as WebSocketClient
import json

class JsInteropManager:
  def __init__(self, hostName, port):
    self.hostName = hostName
    self.port = port
    self.client = WebSocketClient(f"ws://{self.hostname}:{self.port}/")
    pass

  def startServer(self):
    log(f"Starting Websocket server on port {self.port}")
    self.serverProcess = Popen(["python", "./server.py", self.hostName, self.port])
    self.client.handshake()
    pass

  def sendMessage(self, message: str, data: str):
    self.client.send(json.dumps({ "message": message, "data": data }))
    pass

  def stopServer(self):
    log(f"Killing Websocket server on port {self.port}")
    self.serverProcess.kill()
    log(f"Killing Websocket client")
    self.client.close()
    pass

        