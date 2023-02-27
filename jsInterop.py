from subprocess import Popen
from logger import log

class JsInteropManager:
  def __init__(self, hostName, port):
    self.hostName = hostName
    self.port = port
    
    pass

  def startServer(self):
    log(f"Starting Websocket server on port {self.port}")
    self.serverProcess = Popen(["python", "./webSocketServer.py", self.hostName, self.port])
    pass

  def sendMessage(self):
    # self.server
    pass

  def stopServer(self):
    log(f"Killing Websocket server on port {self.port}")
    self.serverProcess.kill()
    pass

        