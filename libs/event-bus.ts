/*
  event-bus.ts
  Lightweight ND-safe event bus for the cathedral hub shell.
  - Respects offline-first usage; gracefully degrades when WebSocket is unavailable.
  - Default endpoint: wss://cathedral-core.fly.dev/ws.
  - Handlers stay pure; dispatch mirrors events locally before broadcasting.
*/

export type EventHandler<T = unknown> = (payload: T | undefined) => void;

export interface EventEnvelope<T = unknown> {
  type: string;
  payload?: T;
}

export interface EventBusOptions {
  url?: string;
  autoConnect?: boolean;
  logger?: (message: string) => void;
}

export interface EmitOptions {
  broadcast?: boolean;
}

const DEFAULT_URL = "wss://cathedral-core.fly.dev/ws";

function defaultLogger(message: string): void {
  if (typeof console !== "undefined" && typeof console.log === "function") {
    console.log(`[event-bus] ${message}`);
  }
}

function safeParseEnvelope(data: unknown): EventEnvelope | null {
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      if (isEnvelopeShape(parsed)) {
        return parsed;
      }
      return null;
    } catch (_err) {
      return null;
    }
  }
  if (isEnvelopeShape(data)) {
    return data;
  }
  return null;
}

function isEnvelopeShape(value: unknown): value is EventEnvelope {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as { type?: unknown };
  return typeof candidate.type === "string";
}

function toEnvelope(type: string, payload: unknown): EventEnvelope {
  return { type, payload };
}

export class EventBus {
  private readonly url: string;
  private readonly logger: (message: string) => void;
  private readonly handlers: Map<string, Set<EventHandler>> = new Map();
  private socket: WebSocket | null = null;

  constructor(options?: EventBusOptions) {
    this.url = options && options.url ? options.url : DEFAULT_URL;
    this.logger = options && options.logger ? options.logger : defaultLogger;

    if (!options || options.autoConnect !== false) {
      this.connect();
    }
  }

  connect(): void {
    if (typeof WebSocket === "undefined") {
      this.logger("WebSocket API unavailable; remaining in offline dispatch mode.");
      return;
    }

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.socket = new WebSocket(this.url);
    this.socket.addEventListener("open", () => {
      this.logger(`Connected to ${this.url}`);
    });
    this.socket.addEventListener("close", () => {
      this.logger("WebSocket closed; offline mode active.");
    });
    this.socket.addEventListener("error", () => {
      this.logger("WebSocket error; offline mode active.");
    });
    this.socket.addEventListener("message", event => {
      const envelope = safeParseEnvelope(event.data);
      if (envelope) {
        this.dispatch(envelope.type, envelope.payload);
      }
    });
  }

  disconnect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      this.socket.close();
    }
    this.socket = null;
  }

  on<T>(type: string, handler: EventHandler<T>): () => void {
    const pool = this.handlers.get(type) || new Set<EventHandler>();
    pool.add(handler as EventHandler);
    this.handlers.set(type, pool);
    return () => this.off(type, handler);
  }

  off<T>(type: string, handler: EventHandler<T>): void {
    const pool = this.handlers.get(type);
    if (!pool) {
      return;
    }
    pool.delete(handler as EventHandler);
    if (pool.size === 0) {
      this.handlers.delete(type);
    }
  }

  emit<T>(type: string, payload?: T, options?: EmitOptions): void {
    const envelope = toEnvelope(type, payload);
    this.dispatch(envelope.type, envelope.payload);

    const shouldBroadcast = !options || options.broadcast !== false;
    if (shouldBroadcast) {
      this.send(envelope);
    }
  }

  private dispatch(type: string, payload: unknown): void {
    const pool = this.handlers.get(type);
    if (!pool) {
      return;
    }
    pool.forEach(handler => {
      handler(payload);
    });
  }

  private send(envelope: EventEnvelope): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }
    try {
      this.socket.send(JSON.stringify(envelope));
    } catch (_err) {
      this.logger("Failed to send envelope; staying in local dispatch.");
    }
  }
}
