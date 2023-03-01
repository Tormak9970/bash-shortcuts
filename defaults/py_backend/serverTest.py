# from subprocess import Popen
from time import sleep

from webSocketClient import Client as WebSocketClient

def log(txt):
  print(txt)

def connect(hostName, port):
  # log(f"Starting Websocket server on port {port}")
  # serverProcess = Popen([f"python server.py \"{hostName}\" \"{port}\""])
  
  for i in range(5):
    try:
      client = WebSocketClient(f"ws://{hostName}:{port}")
      log(f"Attempt: {i+1} :: Connection to {hostName}:{port} was successful")
      client.handshake()
      break
    except ConnectionRefusedError:
      log(f"Attempt: {i+1} :: Connection to {hostName}:{port} was refused")
      sleep(0.2)

connect("localhost", "5000")