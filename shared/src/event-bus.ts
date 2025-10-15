import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { BaseEvent, DomainEvent, BaseCommand, DomainCommand } from './events';

export interface EventBusConfig {
  kafka: {
    brokers: string[];
    clientId: string;
    groupId: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
}

export interface EventHandler<T extends DomainEvent = DomainEvent> {
  handle(event: T): Promise<void>;
}

export interface CommandHandler<T extends DomainCommand = DomainCommand> {
  handle(command: T): Promise<void>;
}

/**
 * Event Bus implementation using Kafka for events and Redis for real-time notifications
 */
export class EventBus {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private redis: Redis;
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private commandHandlers: Map<string, CommandHandler> = new Map();

  constructor(private config: EventBusConfig) {
    this.kafka = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
    });
    
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: config.kafka.groupId });
    
    this.redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });
  }

  /**
   * Initialize the event bus
   */
  async initialize(): Promise<void> {
    await this.producer.connect();
    await this.consumer.connect();
    
    // Subscribe to all domain events
    await this.consumer.subscribe({ topic: 'domain-events', fromBeginning: false });
    await this.consumer.subscribe({ topic: 'domain-commands', fromBeginning: false });
    
    await this.consumer.run({
      eachMessage: this.handleMessage.bind(this),
    });

    console.log('EventBus initialized successfully');
  }

  /**
   * Publish a domain event
   */
  async publishEvent(event: DomainEvent): Promise<void> {
    const enrichedEvent = this.enrichEvent(event);
    
    try {
      // Publish to Kafka for persistence and processing
      await this.producer.send({
        topic: 'domain-events',
        messages: [{
          key: event.data?.userId || event.id,
          value: JSON.stringify(enrichedEvent),
          headers: {
            eventType: event.type,
            version: event.version,
            source: event.source,
          },
        }],
      });

      // Publish to Redis for real-time notifications
      await this.redis.publish(`events:${event.type}`, JSON.stringify(enrichedEvent));
      
      // Store in Redis for recent events cache
      await this.redis.lpush('recent-events', JSON.stringify(enrichedEvent));
      await this.redis.ltrim('recent-events', 0, 999); // Keep last 1000 events

      console.log(`Event published: ${event.type}`, { eventId: event.id });
    } catch (error) {
      console.error('Failed to publish event:', error);
      throw error;
    }
  }

  /**
   * Send a command
   */
  async sendCommand(command: DomainCommand): Promise<void> {
    const enrichedCommand = this.enrichCommand(command);
    
    try {
      await this.producer.send({
        topic: 'domain-commands',
        messages: [{
          key: command.userId,
          value: JSON.stringify(enrichedCommand),
          headers: {
            commandType: command.type,
            userId: command.userId,
          },
        }],
      });

      console.log(`Command sent: ${command.type}`, { commandId: command.id });
    } catch (error) {
      console.error('Failed to send command:', error);
      throw error;
    }
  }

  /**
   * Register an event handler
   */
  registerEventHandler<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler as EventHandler);
    console.log(`Event handler registered for: ${eventType}`);
  }

  /**
   * Register a command handler
   */
  registerCommandHandler<T extends DomainCommand>(commandType: string, handler: CommandHandler<T>): void {
    if (this.commandHandlers.has(commandType)) {
      throw new Error(`Command handler already registered for: ${commandType}`);
    }
    this.commandHandlers.set(commandType, handler as CommandHandler);
    console.log(`Command handler registered for: ${commandType}`);
  }

  /**
   * Subscribe to real-time events via Redis
   */
  async subscribeToRealTimeEvents(eventTypes: string[], callback: (event: DomainEvent) => void): Promise<void> {
    const subscriber = new Redis(this.config.redis);
    
    const patterns = eventTypes.map(type => `events:${type}`);
    await subscriber.psubscribe(...patterns);
    
    subscriber.on('pmessage', (pattern, channel, message) => {
      try {
        const event = JSON.parse(message) as DomainEvent;
        callback(event);
      } catch (error) {
        console.error('Failed to parse real-time event:', error);
      }
    });
  }

  /**
   * Get recent events from cache
   */
  async getRecentEvents(limit: number = 100): Promise<DomainEvent[]> {
    const events = await this.redis.lrange('recent-events', 0, limit - 1);
    return events.map(event => JSON.parse(event) as DomainEvent);
  }

  /**
   * Handle incoming Kafka messages
   */
  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, message } = payload;
    
    try {
      if (topic === 'domain-events') {
        const event = JSON.parse(message.value!.toString()) as DomainEvent;
        await this.processEvent(event);
      } else if (topic === 'domain-commands') {
        const command = JSON.parse(message.value!.toString()) as DomainCommand;
        await this.processCommand(command);
      }
    } catch (error) {
      console.error('Failed to handle message:', error);
      // TODO: Send to dead letter queue
    }
  }

  /**
   * Process domain events
   */
  private async processEvent(event: DomainEvent): Promise<void> {
    const handlers = this.eventHandlers.get(event.type) || [];
    
    if (handlers.length === 0) {
      console.warn(`No handlers registered for event: ${event.type}`);
      return;
    }

    // Process handlers in parallel
    const promises = handlers.map(handler => 
      handler.handle(event).catch(error => {
        console.error(`Event handler failed for ${event.type}:`, error);
        // TODO: Send to dead letter queue or retry mechanism
      })
    );

    await Promise.allSettled(promises);
  }

  /**
   * Process domain commands
   */
  private async processCommand(command: DomainCommand): Promise<void> {
    const handler = this.commandHandlers.get(command.type);
    
    if (!handler) {
      console.error(`No handler registered for command: ${command.type}`);
      throw new Error(`No handler for command: ${command.type}`);
    }

    try {
      await handler.handle(command);
    } catch (error) {
      console.error(`Command handler failed for ${command.type}:`, error);
      throw error;
    }
  }

  /**
   * Enrich event with metadata
   */
  private enrichEvent(event: DomainEvent): DomainEvent {
    return {
      ...event,
      id: event.id || uuidv4(),
      timestamp: event.timestamp || new Date().toISOString(),
      version: event.version || '1.0.0',
      metadata: {
        ...event.metadata,
        processedBy: this.config.kafka.clientId,
        processedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Enrich command with metadata
   */
  private enrichCommand(command: DomainCommand): DomainCommand {
    return {
      ...command,
      id: command.id || uuidv4(),
      timestamp: command.timestamp || new Date().toISOString(),
      metadata: {
        ...command.metadata,
        processedBy: this.config.kafka.clientId,
        processedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Gracefully shutdown the event bus
   */
  async shutdown(): Promise<void> {
    await this.producer.disconnect();
    await this.consumer.disconnect();
    await this.redis.disconnect();
    console.log('EventBus shutdown completed');
  }
}

/**
 * Event Store for event sourcing
 */
export class EventStore {
  private redis: Redis;

  constructor(redisConfig: { host: string; port: number; password?: string }) {
    this.redis = new Redis(redisConfig);
  }

  /**
   * Append events to an aggregate stream
   */
  async appendEvents(aggregateId: string, events: DomainEvent[], expectedVersion?: number): Promise<void> {
    const streamKey = `stream:${aggregateId}`;
    
    // Check expected version if provided
    if (expectedVersion !== undefined) {
      const currentVersion = await this.getStreamVersion(aggregateId);
      if (currentVersion !== expectedVersion) {
        throw new Error(`Concurrency conflict. Expected version ${expectedVersion}, got ${currentVersion}`);
      }
    }

    // Append events to stream
    const pipeline = this.redis.pipeline();
    
    for (const event of events) {
      pipeline.xadd(streamKey, '*', 'event', JSON.stringify(event));
    }
    
    await pipeline.exec();
  }

  /**
   * Get all events for an aggregate
   */
  async getEvents(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]> {
    const streamKey = `stream:${aggregateId}`;
    const startId = fromVersion ? `${fromVersion}-0` : '-';
    
    const results = await this.redis.xrange(streamKey, startId, '+');
    
    return results.map(([id, fields]) => {
      const eventData = fields[1]; // fields is ['event', eventData]
      return JSON.parse(eventData) as DomainEvent;
    });
  }

  /**
   * Get stream version (number of events)
   */
  async getStreamVersion(aggregateId: string): Promise<number> {
    const streamKey = `stream:${aggregateId}`;
    const info = await this.redis.xinfo('STREAM', streamKey).catch(() => null);
    return info ? parseInt(info[1] as string) : 0;
  }

  /**
   * Create snapshot of aggregate state
   */
  async saveSnapshot(aggregateId: string, version: number, snapshot: any): Promise<void> {
    const snapshotKey = `snapshot:${aggregateId}`;
    await this.redis.hset(snapshotKey, {
      version: version.toString(),
      data: JSON.stringify(snapshot),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get latest snapshot
   */
  async getSnapshot(aggregateId: string): Promise<{ version: number; data: any; timestamp: string } | null> {
    const snapshotKey = `snapshot:${aggregateId}`;
    const snapshot = await this.redis.hgetall(snapshotKey);
    
    if (!snapshot.version) {
      return null;
    }

    return {
      version: parseInt(snapshot.version),
      data: JSON.parse(snapshot.data),
      timestamp: snapshot.timestamp,
    };
  }
}