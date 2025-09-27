import { EventEmitter } from "events";
import { Events } from "./events";

class CustomEventEmitter extends EventEmitter {
  private static instance: CustomEventEmitter;

  private constructor() {
    super();
    this.setMaxListeners(100); // Increase max listeners for production
  }

  public static getInstance(): CustomEventEmitter {
    if (!CustomEventEmitter.instance) {
      CustomEventEmitter.instance = new CustomEventEmitter();
    }
    return CustomEventEmitter.instance;
  }

  /**
   * Emit event with data
   */
  public emitEvent(event: Events, data: any, room?: string): void {
    try {
      this.emit(event, data, room);
      console.log(`Event emitted: ${event}`, {
        room,
        dataKeys: Object.keys(data),
      });
    } catch (error) {
      console.error(`Failed to emit event ${event}:`, error);
    }
  }

  /**
   * Listen to events
   */
  public onEvent(
    event: Events,
    callback: (data: any, room?: string) => void
  ): void {
    this.on(event, callback);
  }

  /**
   * Remove event listener
   */
  public offEvent(
    event: Events,
    callback: (data: any, room?: string) => void
  ): void {
    this.off(event, callback);
  }
}

// Export singleton instance
export const eventEmitter = CustomEventEmitter.getInstance();

// Export convenience function
export const emitEvent = (event: Events, data: any, room?: string): void => {
  eventEmitter.emitEvent(event, data, room);
};

export default eventEmitter;
