import { PyInterop } from "./PyInterop";

type Listener = (data: any) => void

/**
 * Enum for return values from running scripts.
 */
// @ts-ignore
enum ScriptStatus {
  UNEXPECTED_RETURN_CODE = -1,
  FINISHED = 0,
  DOES_NOT_EXIST = 1,
  RUNNING = 2,
  KILLED = 3,
  FAILED = 4
}

/**
 * WebSocketClient class for connecting to a WebSocket.
 */
export class WebSocketClient {
  hostName: string;
  port: string;
  ws: WebSocket|null;
  listeners = new Map<string, Listener[]>();
  reconnectInterval: number;
  numRetries: number | null;

  /**
   * Creates a new WebSocketClient.
   * @param hostName The host name of the WebSocket.
   * @param port The port of the WebSocket.
   * @param reconnectInterval The time between reconnect attempts.
   * @param numRetries The number of times to try to reconnect. If null there is no cap. Defaults to null.
   */
  constructor(hostName: string, port: string, reconnectInterval: number, numRetries = null) {
    this.hostName = hostName;
    this.port = port;
    this.reconnectInterval = reconnectInterval;
    this.numRetries = numRetries;
    this.ws = null;
  }

  /**
   * Connects the client to the WebSocket.
   */
  connect(): void {
    PyInterop.log(`WebSocket client connecting to ${this.hostName}:${this.port}...`);

    this.ws = new WebSocket(`ws://${this.hostName}:${this.port}`);
    this.ws.onopen = this.onOpen;
    this.ws.onmessage = this.listen;
    this.ws.onerror = this.onError;
    this.ws.onclose = this.onClose;

    PyInterop.log(`WebSocket client connected to ${this.hostName}:${this.port}.`);
  }

  /**
   * Disconnects the client from the WebSocket.
   */
  disconnect(): void {
    PyInterop.log(`WebSocket client disconnecting from ${this.hostName}:${this.port}...`);

    this.ws?.close();
    
    PyInterop.log(`WebSocket client disconnected from ${this.hostName}:${this.port}.`);
  }

  /**
   * Listens to the WebSocket for messages.
   * @param e The MessageEvent.
   */
  private listen(e: MessageEvent): void {
    PyInterop.log(`Recieved message ${JSON.stringify(e)}`);
    const info = JSON.parse(e.data);

    if (this.listeners.has(info.type)) {
      const registeredListeners = this.listeners.get(info.message) as Listener[];

      for (const listener of registeredListeners) {
        listener(info.data);
      }
    }
  }

  /**
   * Handler for WebSocket errors.
   * @param e The Event.
   */
  private onError(e: Event) {
    console.log(`WebSocket onError triggered:`, e);
    PyInterop.log(`Websocket recieved and error: ${e}`)
  }

  /**
   * Handler for when WebSocket opens.
   * @param e The Event.
   */
  private onOpen(e: Event) {
    console.log(`WebSocket onOpen triggered:`, e);
    this.ws?.send("Hello server from TS!");
    PyInterop.log(`WebSocket server opened. Event: ${e}`);
  }

  /**
   * Handler for when WebSocket closes.
   * @param e The CloseEvent.
   */
  private onClose(e: CloseEvent) {
    // const returnCode = e.code;
    // const reason = e.reason;
    // const wasClean = e.wasClean;
    console.log(`WebSocket onClose triggered:`, e);
    
    const closedByUser = false;

    if (!closedByUser) {
      // const interval = setInterval(() => {

      // }, this.reconnectInterval);
    } else {

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
    PyInterop.log(`Removed listeners for message of type: ${type}.`);
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