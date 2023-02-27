from webSocket import WebSocketServer, WebSocket
import sys

class InteropServer(WebSocket):
  def handle(self):
    for client in clients:
      if client != self:
        client.send_message(self.address[0] + u' - ' + self.data)

  def connected(self):
    print(self.address, 'connected')
    for client in clients:
      client.send_message(self.address[0] + u' - connected')
    clients.append(self)

  def handle_close(self):
    clients.remove(self)
    print(self.address, 'closed')
    for client in clients:
      client.send_message(self.address[0] + u' - disconnected')


clients = []

args = sys.argv
numArgs = len(args)

if (len(args) >= 3):
  server = WebSocketServer(args[1], args[2], InteropServer)
  server.serve_forever()
else:
  Exception(f"Expected two arguments but only found {len(sys.argv)}")
      