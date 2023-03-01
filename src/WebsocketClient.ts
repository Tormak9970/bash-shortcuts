import { PyInterop } from "./PyInterop";

type Listener = (data: any) => void

export class WebsocketClient {
  hostName: string;
  port: string;
  ws: WebSocket|null;
  listeners = new Map<string, Listener[]>();


  constructor(hostName: string, port: string) {
    this.hostName = hostName;
    this.port = port;
    this.ws = null;
  }

  connect() {
    this.ws = new WebSocket(`ws://${this.hostName}:${this.port}`);
    this.ws.onmessage = this.listen;
  }

  disconnect() {
    this.ws?.close();
  }

  listen(e:MessageEvent) {
    const info = JSON.parse(e.data);

    if (this.listeners.has(info.message)) {
      const registeredListeners = this.listeners.get(info.message) as Listener[];

      for (const listener of registeredListeners) {
        listener(info.data);
      }
    }
  }

  on(message: string, callback: Listener) {
    let existingListeners:Listener[] = []
    if (this.listeners.has(message)) {
      existingListeners = this.listeners.get(message) as Listener[];
    }
    
    existingListeners.push(callback)

    this.listeners.set(message, existingListeners);
    PyInterop.log(`Registered listener for ${message}.`);
  }

  sendMessage(message: string, data: any) {
    this.ws?.send(JSON.stringify({
      "message": message,
      "data": data
    }));
  }
}