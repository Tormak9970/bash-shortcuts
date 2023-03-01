from subprocess import Popen
import webSocketClient as websocket

def log(txt):
  print(txt)


Popen(["python", "server.py", "localhost", "5000", "/home/deck/homebrew/logs/bash-shortcuts"], shell=True)

websocket.enableTrace(True)
ws = websocket.WebSocket()
ws.connect("ws://localhost:5000")
ws.send("Hello, Server")
# print(ws.recv())
ws.close()
