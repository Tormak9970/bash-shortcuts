from subprocess import Popen

class JsInteropManager:
  def __init__(self, hostName, port):
    self.hostName = hostName
    self.port = port
    
    pass

  def startServer(self):
    self.serverProcess = Popen(["python", "./webSocketServer.py", self.hostName, self.port])
    pass

  def sendMessage(self):
    # self.server
    pass

  def stopServer(self):
    pass

        