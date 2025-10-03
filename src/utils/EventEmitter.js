// Simple event emitter that works in both web and React Native
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (!this.events[event]) return;
    
    if (callback) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    } else {
      delete this.events[event];
    }
  }

  emit(event, data) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  // For web compatibility, also emit to window if available
  emitWeb(event, data) {
    this.emit(event, data);
    
    // Also emit to window for web compatibility (only in web environment)
    if (typeof global !== 'undefined' && global.window && global.window.dispatchEvent) {
      try {
        // Check if we're in a web environment before using window
        if (typeof global !== 'undefined' && global.window && global.window.dispatchEvent) {
          global.window.dispatchEvent(new CustomEvent(event, { detail: data }));
        }
      } catch (error) {
        console.error(`Error emitting web event ${event}:`, error);
      }
    }
  }
}

// Export singleton instance
export default new EventEmitter();
