# from subprocess import Popen
# from time import sleep

# from webSocketClient import Client as WebSocketClient
import webSocketClient as websocket

def log(txt):
  print(txt)

websocket.enableTrace(True)
ws = websocket.WebSocket()
ws.connect("ws://localhost:5000")
ws.send("Hello, Server")
# print(ws.recv())
ws.close()
