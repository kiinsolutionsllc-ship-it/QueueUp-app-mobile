import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { hapticService } from './HapticService';

class RealtimeService {
  constructor() {
    try {
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
      this.maxReconnectAttempts = 5;
      this.reconnectDelay = 1000;
      this.listeners = new Map();
      this.roomSubscriptions = new Set();
    } catch (error) {
      console.error('RealtimeService: Error in constructor:', error);
      // Fallback initialization
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
      this.maxReconnectAttempts = 5;
      this.reconnectDelay = 1000;
      this.listeners = new Map();
      this.roomSubscriptions = new Set();
    }
  }

  // Initialize WebSocket connection
  connect(serverUrl = 'ws://localhost:3000') {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    this.setupEventListeners();
  }

  // Setup event listeners
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection', { status: 'connected' });
      hapticService.success();
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      this.emit('connection', { status: 'disconnected', reason });
      hapticService.warning();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.handleReconnect();
      this.emit('connection', { status: 'error', error: error.message });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection', { status: 'reconnected', attempts: attemptNumber });
      hapticService.success();
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
      this.handleReconnect();
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect after maximum attempts');
      this.emit('connection', { status: 'failed' });
      hapticService.error();
    });

    // Job-related events
    this.socket.on('job_created', (data) => {
      this.emit('job_created', data);
      hapticService.light();
    });

    this.socket.on('job_updated', (data) => {
      this.emit('job_updated', data);
      hapticService.light();
    });

    this.socket.on('job_deleted', (data) => {
      this.emit('job_deleted', data);
      hapticService.light();
    });

    this.socket.on('job_status_changed', (data) => {
      this.emit('job_status_changed', data);
      hapticService.light();
    });

    // Message events
    this.socket.on('message_received', (data) => {
      this.emit('message_received', data);
      hapticService.messageReceived();
    });

    this.socket.on('message_sent', (data) => {
      this.emit('message_sent', data);
    });

    // Notification events
    this.socket.on('notification', (data) => {
      this.emit('notification', data);
      hapticService.light();
    });

    // Location events
    this.socket.on('location_updated', (data) => {
      this.emit('location_updated', data);
    });

    // Payment events
    this.socket.on('payment_processed', (data) => {
      this.emit('payment_processed', data);
      hapticService.paymentSuccess();
    });

    this.socket.on('payment_failed', (data) => {
      this.emit('payment_failed', data);
      hapticService.paymentFailed();
    });
  }

  // Handle reconnection logic
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        this.socket?.connect();
      }, delay);
    }
  }

  // Emit event to listeners
  emit(event, data) {
    try {
      if (!this.listeners) {
        console.warn('RealtimeService: listeners not initialized');
        return;
      }
      
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.forEach(callback => {
          try {
            if (typeof callback === 'function') {
              callback(data);
            } else {
              console.warn('RealtimeService: Invalid callback for event:', event);
            }
          } catch (error) {
            console.error(`Error in event listener for ${event}:`, error);
          }
        });
      }
    } catch (error) {
      console.error('RealtimeService: Error in emit method:', error);
    }
  }

  // Add event listener
  on(event, callback) {
    try {
      if (!this.listeners) {
        this.listeners = new Map();
      }
      
      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set());
      }
      this.listeners.get(event).add(callback);

      // Return unsubscribe function
      return () => {
        try {
          const eventListeners = this.listeners.get(event);
          if (eventListeners) {
            eventListeners.delete(callback);
            if (eventListeners.size === 0) {
              this.listeners.delete(event);
            }
          }
        } catch (error) {
          console.error('RealtimeService: Error unsubscribing from event:', error);
        }
      };
    } catch (error) {
      console.error('RealtimeService: Error adding event listener:', error);
      return () => {}; // Return empty function as fallback
    }
  }

  // Remove event listener
  off(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  // Join a room
  joinRoom(roomId, userId) {
    if (!this.socket || !this.isConnected) {
      console.warn('Cannot join room: not connected');
      return;
    }

    this.socket.emit('join_room', { roomId, userId });
    this.roomSubscriptions.add(roomId);
  }

  // Leave a room
  leaveRoom(roomId, userId) {
    if (!this.socket || !this.isConnected) {
      console.warn('Cannot leave room: not connected');
      return;
    }

    this.socket.emit('leave_room', { roomId, userId });
    this.roomSubscriptions.delete(roomId);
  }

  // Send message
  sendMessage(message) {
    if (!this.socket || !this.isConnected) {
      console.warn('Cannot send message: not connected');
      return;
    }

    this.socket.emit('send_message', message);
  }

  // Send job update
  sendJobUpdate(jobId, updates) {
    if (!this.socket || !this.isConnected) {
      console.warn('Cannot send job update: not connected');
      return;
    }

    this.socket.emit('job_update', { jobId, updates });
  }

  // Send location update
  sendLocationUpdate(location) {
    if (!this.socket || !this.isConnected) {
      console.warn('Cannot send location update: not connected');
      return;
    }

    this.socket.emit('location_update', location);
  }

  // Send typing indicator
  sendTypingIndicator(roomId, isTyping) {
    if (!this.socket || !this.isConnected) {
      return;
    }

    this.socket.emit('typing', { roomId, isTyping });
  }

  // Send heartbeat
  sendHeartbeat() {
    if (!this.socket || !this.isConnected) {
      return;
    }

    this.socket.emit('heartbeat', { timestamp: Date.now() });
  }


  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      roomSubscriptions: Array.from(this.roomSubscriptions || []),
    };
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners.clear();
    this.roomSubscriptions.clear();
  }

  // Cleanup
  destroy() {
    this.disconnect();
  }
}

// Real-time hooks
export const useRealtime = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    reconnectAttempts: 0,
    roomSubscriptions: [],
  });

  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    const updateConnectionStatus = () => {
      try {
        setConnectionStatus(realtimeService.getConnectionStatus());
      } catch (error) {
        console.error('useRealtime: Error updating connection status:', error);
      }
    };

    const handleMessage = (data) => {
      try {
        setLastMessage({ data, timestamp: Date.now() });
      } catch (error) {
        console.error('useRealtime: Error handling message:', error);
      }
    };

    try {
      // Listen for connection changes
      const unsubscribeConnection = realtimeService.on('connection', updateConnectionStatus);
      
      // Listen for all messages
      const unsubscribeMessages = realtimeService.on('message_received', handleMessage);

      // Update status initially
      updateConnectionStatus();

      return () => {
        try {
          if (unsubscribeConnection) unsubscribeConnection();
          if (unsubscribeMessages) unsubscribeMessages();
        } catch (error) {
          console.error('useRealtime: Error cleaning up listeners:', error);
        }
      };
    } catch (error) {
      console.error('useRealtime: Error setting up listeners:', error);
      return () => {}; // Return empty cleanup function
    }
  }, []);

  return {
    connectionStatus,
    lastMessage,
    joinRoom: realtimeService.joinRoom.bind(realtimeService),
    leaveRoom: realtimeService.leaveRoom.bind(realtimeService),
    sendMessage: realtimeService.sendMessage.bind(realtimeService),
    sendJobUpdate: realtimeService.sendJobUpdate.bind(realtimeService),
    sendLocationUpdate: realtimeService.sendLocationUpdate.bind(realtimeService),
    sendTypingIndicator: realtimeService.sendTypingIndicator.bind(realtimeService),
  };
};

// Real-time job updates hook
export const useRealtimeJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleJobCreated = (data) => {
      setJobs(prev => [data.job, ...prev]);
    };

    const handleJobUpdated = (data) => {
      setJobs(prev => prev.map(job => 
        job.id === data.job.id ? data.job : job
      ));
    };

    const handleJobDeleted = (data) => {
      setJobs(prev => prev.filter(job => job.id !== data.jobId));
    };

    const handleJobStatusChanged = (data) => {
      setJobs(prev => prev.map(job => 
        job.id === data.jobId ? { ...job, status: data.status } : job
      ));
    };

    const handleConnection = (data) => {
      setIsConnected(data.status === 'connected');
    };

    const unsubscribeJobCreated = realtimeService.on('job_created', handleJobCreated);
    const unsubscribeJobUpdated = realtimeService.on('job_updated', handleJobUpdated);
    const unsubscribeJobDeleted = realtimeService.on('job_deleted', handleJobDeleted);
    const unsubscribeJobStatusChanged = realtimeService.on('job_status_changed', handleJobStatusChanged);
    const unsubscribeConnection = realtimeService.on('connection', handleConnection);

    return () => {
      unsubscribeJobCreated();
      unsubscribeJobUpdated();
      unsubscribeJobDeleted();
      unsubscribeJobStatusChanged();
      unsubscribeConnection();
    };
  }, []);

  return {
    jobs,
    isConnected,
    sendJobUpdate: realtimeService.sendJobUpdate.bind(realtimeService),
  };
};

// Real-time messaging hook
export const useRealtimeMessaging = (roomId) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (!roomId) return;

    const handleMessageReceived = (data) => {
      if (data.roomId === roomId) {
        setMessages(prev => [...prev, data.message]);
      }
    };

    const handleTyping = (data) => {
      if (data.roomId === roomId) {
        setTypingUsers(prev => {
          if (data.isTyping) {
            return [...prev.filter(user => user.id !== data.userId), { id: data.userId, name: data.userName }];
          } else {
            return prev.filter(user => user.id !== data.userId);
          }
        });
      }
    };

    const unsubscribeMessageReceived = realtimeService.on('message_received', handleMessageReceived);
    const unsubscribeTyping = realtimeService.on('typing', handleTyping);

    // Join room - user ID should be passed from component
    // realtimeService.joinRoom(roomId, userId);

    return () => {
      unsubscribeMessageReceived();
      unsubscribeTyping();
      // realtimeService.leaveRoom(roomId, userId);
    };
  }, [roomId]);

  const sendMessage = (message, userId, userName) => {
    realtimeService.sendMessage({
      roomId,
      message,
      userId: userId || 'unknown_user',
      userName: userName || 'User',
      timestamp: Date.now(),
    });
  };

  const sendTypingIndicator = (isTyping) => {
    realtimeService.sendTypingIndicator(roomId, isTyping);
  };

  return {
    messages,
    isTyping,
    typingUsers,
    sendMessage,
    sendTypingIndicator,
  };
};

export const realtimeService = new RealtimeService();
