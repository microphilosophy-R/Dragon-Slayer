/**
 * Global Event Bus for the Observer Pattern.
 * Allows systems (Equipment, UI, AI) to subscribe to game events.
 */
class EventBus {
    constructor() {
        this.listeners = {};
    }

    /**
     * Subscribe to an event.
     * @param {string} event - Event name (e.g. 'Skill:CausingDamage')
     * @param {Function} handler - Callback function receiving payload
     */
    on(event, handler) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(handler);
    }

    /**
     * Unsubscribe from an event.
     * @param {string} event 
     * @param {Function} handler 
     */
    off(event, handler) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(h => h !== handler);
    }

    /**
     * Emit an event to all subscribers.
     * @param {string} event 
     * @param {Object} payload - Mutable data object
     */
    emit(event, payload = {}) {
        if (!this.listeners[event]) return;

        // Clone listeners to avoid issues if a handler unsubscribes during emission
        [...this.listeners[event]].forEach(handler => {
            try {
                handler(payload);
            } catch (e) {
                console.error(`Error in handler for event '${event}':`, e);
            }
        });
    }

    /**
     * Emit an event to all subscribers sequentially and asynchronously.
     * @param {string} event 
     * @param {Object} payload 
     */
    async emitAsync(event, payload = {}) {
        if (!this.listeners[event]) return;

        for (const handler of [...this.listeners[event]]) {
            try {
                await handler(payload);
            } catch (e) {
                console.error(`Error in async handler for event '${event}':`, e);
            }
        }
    }

    /**
     * Clears all listeners (Useful for testing/reset)
     */
    clear() {
        this.listeners = {};
    }
}

// Singleton instance
export const bus = new EventBus();
