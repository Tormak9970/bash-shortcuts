import { PyInterop } from "./PyInterop";

type Listener = (data: any) => void

/**
 * WebSocketClient class for connecting to a WebSocket.
 */
export class WebSocketClient {
  hostName: string;
  port: string;
  ws: WebSocket|null;
  listeners = new Map<string, Listener[]>();

  /**
   * Creates a new WebSocketClient.
   * @param hostName The host name of the WebSocket.
   * @param port The port of the WebSocket.
   */
  constructor(hostName: string, port: string) {
    this.hostName = hostName;
    this.port = port;
    this.ws = null;
  }

  /**
   * Connects the client to the WebSocket.
   */
  connect(): void {
    this.ws = new WebSocket(`ws://${this.hostName}:${this.port}`);
    this.ws.onmessage = this.listen;
  }

  /**
   * Disconnects the client from the WebSocket.
   */
  disconnect(): void {
    this.ws?.close();
  }

  /**
   * Listens to the WebSocket for messages.
   * @param e The MessageEvent.
   */
  listen(e:MessageEvent): void {
    const info = JSON.parse(e.data);

    if (this.listeners.has(info.type)) {
      const registeredListeners = this.listeners.get(info.message) as Listener[];

      for (const listener of registeredListeners) {
        listener(info.data);
      }
    }
  }

  /**
   * Registers a callback to run when an event with the given message is recieved.
   * @param type The type of message to register the callback for.
   * @param callback The callback to run.
   */
  on(type: string, callback: Listener): void {
    let existingListeners:Listener[] = []
    if (this.listeners.has(type)) {
      existingListeners = this.listeners.get(type) as Listener[];
    }
    
    existingListeners.push(callback)

    this.listeners.set(type, existingListeners);
    PyInterop.log(`Registered listener for message of type: ${type}.`);
  }

  /**
   * Deletes all listeners for a message type.
   * @param type The type of message.
   */
  deleteListeners(type: string): void {
    this.listeners.delete(type);
  }

  /**
   * Sends a message to the WebSocket.
   * @param type The type message name to send.
   * @param data The data to send.
   */
  sendMessage(type: string, data: any) {
    this.ws?.send(JSON.stringify({
      "type": type,
      "data": data
    }));
  }
}