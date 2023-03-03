#!/usr/bin/env python
from webSocketServer import WebSocketServer, WebSocket
import sys

import logging
import os

args = sys.argv
numArgs = len(args)

logging.basicConfig(filename=os.path.join(args[3], "server.log"), format="[Server] %(asctime)s %(levelname)s %(message)s", filemode="w+", force=True)
logger=logging.getLogger()
logger.setLevel(logging.INFO)

clients = []

def log(txt):
  print(txt)
  logger.info(txt)

class InteropServer(WebSocket):
  def handle(self):
    log("Handling Message")
    log(f"Data: {self.data}")

    for client in clients:
      if client != self:
        client.send_message(self.address[0] + u' - ' + self.data)

  def connected(self):
    log(f"{self.address} connected")

    for client in clients:
      client.send_message(self.address[0] + u' - connected')
      
    clients.append(self)

  def handle_close(self):
    clients.remove(self)
    log(f"{self.address} closed")

    for client in clients:
      client.send_message(self.address[0] + u' - disconnected')

if (len(args) >= 4):
  server = WebSocketServer(args[1], args[2], InteropServer)
  log(f"Starting server on {args[1]}:{args[2]}")
  server.serve_forever()
else:
  Exception(f"Expected three arguments but only found {len(sys.argv)}")
      