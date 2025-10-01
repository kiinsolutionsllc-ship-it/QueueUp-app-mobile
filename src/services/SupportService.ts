import { supabase } from '../config/supabase';

export interface SupportTicket {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  agentId?: string;
  messages: SupportMessage[];
  attachments?: string[];
  tags?: string[];
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'user' | 'agent';
  content: string;
  timestamp: Date;
  attachments?: string[];
  messageType?: 'text' | 'image' | 'file' | 'system';
}

export interface ChatSession {
  id: string;
  userId: string;
  agentId?: string;
  status: 'waiting' | 'active' | 'ended';
  startedAt: Date;
  endedAt?: Date;
  messages: SupportMessage[];
}

export interface SupportAgent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'busy' | 'offline';
  specialties: string[];
  rating: number;
  responseTime: number; // in minutes
}

class SupportService {
  private static instance: SupportService;
  private chatSessions: Map<string, ChatSession> = new Map();
  private messageListeners: Map<string, (message: SupportMessage) => void> = new Map();

  static getInstance(): SupportService {
    if (!SupportService.instance) {
      SupportService.instance = new SupportService();
    }
    return SupportService.instance;
  }

  // Ticket Management
  async createSupportTicket(ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages'>): Promise<SupportTicket> {
    try {
      const ticket: SupportTicket = {
        ...ticketData,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      };

      // In a real implementation, save to database
      // const { data, error } = await supabase
      //   .from('support_tickets')
      //   .insert([ticket])
      //   .select()
      //   .single();

      // For now, store in local storage or memory
      this.saveTicketToStorage(ticket);
      
      return ticket;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw new Error('Failed to create support ticket');
    }
  }

  async getSupportTickets(userId: string): Promise<SupportTicket[]> {
    try {
      // In a real implementation, fetch from database
      // const { data, error } = await supabase
      //   .from('support_tickets')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .order('created_at', { ascending: false });

      // For now, get from local storage
      return this.getTicketsFromStorage(userId);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      return [];
    }
  }

  async getSupportTicket(ticketId: string): Promise<SupportTicket | null> {
    try {
      // In a real implementation, fetch from database
      // const { data, error } = await supabase
      //   .from('support_tickets')
      //   .select('*')
      //   .eq('id', ticketId)
      //   .single();

      // For now, get from local storage
      return this.getTicketFromStorage(ticketId);
    } catch (error) {
      console.error('Error fetching support ticket:', error);
      return null;
    }
  }

  async updateTicketStatus(ticketId: string, status: SupportTicket['status'], agentId?: string): Promise<void> {
    try {
      const ticket = await this.getSupportTicket(ticketId);
      if (!ticket) throw new Error('Ticket not found');

      ticket.status = status;
      ticket.updatedAt = new Date();
      if (agentId) ticket.agentId = agentId;

      // In a real implementation, update in database
      // await supabase
      //   .from('support_tickets')
      //   .update({ status, agent_id: agentId, updated_at: new Date() })
      //   .eq('id', ticketId);

      this.saveTicketToStorage(ticket);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw new Error('Failed to update ticket status');
    }
  }

  async addMessageToTicket(ticketId: string, message: Omit<SupportMessage, 'id' | 'timestamp'>): Promise<SupportMessage> {
    try {
      const ticket = await this.getSupportTicket(ticketId);
      if (!ticket) throw new Error('Ticket not found');

      const newMessage: SupportMessage = {
        ...message,
        id: this.generateId(),
        timestamp: new Date(),
      };

      ticket.messages.push(newMessage);
      ticket.updatedAt = new Date();

      this.saveTicketToStorage(ticket);

      // Notify listeners
      this.messageListeners.forEach((listener) => {
        listener(newMessage);
      });

      return newMessage;
    } catch (error) {
      console.error('Error adding message to ticket:', error);
      throw new Error('Failed to add message to ticket');
    }
  }

  // Live Chat Management
  async startChatSession(userId: string): Promise<ChatSession> {
    try {
      const session: ChatSession = {
        id: this.generateId(),
        userId,
        status: 'waiting',
        startedAt: new Date(),
        messages: [],
      };

      this.chatSessions.set(session.id, session);

      // In a real implementation, save to database and notify agents
      // await supabase
      //   .from('chat_sessions')
      //   .insert([session]);

      // Simulate agent assignment after a delay
      setTimeout(() => {
        this.assignAgentToChat(session.id);
      }, 2000);

      return session;
    } catch (error) {
      console.error('Error starting chat session:', error);
      throw new Error('Failed to start chat session');
    }
  }

  async endChatSession(sessionId: string): Promise<void> {
    try {
      const session = this.chatSessions.get(sessionId);
      if (!session) throw new Error('Chat session not found');

      session.status = 'ended';
      session.endedAt = new Date();

      // In a real implementation, update in database
      // await supabase
      //   .from('chat_sessions')
      //   .update({ status: 'ended', ended_at: new Date() })
      //   .eq('id', sessionId);

      this.chatSessions.delete(sessionId);
    } catch (error) {
      console.error('Error ending chat session:', error);
      throw new Error('Failed to end chat session');
    }
  }

  async sendChatMessage(sessionId: string, message: Omit<SupportMessage, 'id' | 'timestamp'>): Promise<SupportMessage> {
    try {
      const session = this.chatSessions.get(sessionId);
      if (!session) throw new Error('Chat session not found');

      const newMessage: SupportMessage = {
        ...message,
        id: this.generateId(),
        timestamp: new Date(),
      };

      session.messages.push(newMessage);

      // In a real implementation, save to database
      // await supabase
      //   .from('chat_messages')
      //   .insert([newMessage]);

      // Simulate agent response
      if (message.senderType === 'user' && session.status === 'active') {
        setTimeout(() => {
          this.simulateAgentResponse(sessionId);
        }, 1000 + Math.random() * 2000);
      }

      return newMessage;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw new Error('Failed to send chat message');
    }
  }

  async getChatMessages(sessionId: string): Promise<SupportMessage[]> {
    try {
      const session = this.chatSessions.get(sessionId);
      if (!session) return [];

      return session.messages;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
  }

  // Agent Management
  async getAvailableAgents(): Promise<SupportAgent[]> {
    try {
      // In a real implementation, fetch from database
      // const { data, error } = await supabase
      //   .from('support_agents')
      //   .select('*')
      //   .eq('status', 'online')
      //   .order('response_time', { ascending: true });

      // Mock data for now
      const agents: SupportAgent[] = [
        {
          id: 'agent1',
          name: 'Sarah Johnson',
          email: 'sarah@queued.app',
          avatar: 'https://via.placeholder.com/40',
          status: 'online' as const,
          specialties: ['billing', 'technical', 'general'],
          rating: 4.8,
          responseTime: 2,
        },
        {
          id: 'agent2',
          name: 'Mike Chen',
          email: 'mike@queued.app',
          avatar: 'https://via.placeholder.com/40',
          status: 'online' as const,
          specialties: ['vehicle_issues', 'scheduling'],
          rating: 4.9,
          responseTime: 3,
        },
        {
          id: 'agent3',
          name: 'Emily Rodriguez',
          email: 'emily@queued.app',
          avatar: 'https://via.placeholder.com/40',
          status: 'busy' as const,
          specialties: ['account', 'technical'],
          rating: 4.7,
          responseTime: 5,
        },
      ];
      return agents;
    } catch (error) {
      console.error('Error fetching available agents:', error);
      return [];
    }
  }

  // Analytics and Reporting
  async getSupportAnalytics(userId?: string): Promise<{
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    averageResponseTime: number;
    satisfactionRating: number;
  }> {
    try {
      // In a real implementation, calculate from database
      const tickets = userId 
        ? await this.getSupportTickets(userId)
        : await this.getAllTickets();

      const totalTickets = tickets.length;
      const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
      const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
      
      // Mock calculations
      const averageResponseTime = 15; // minutes
      const satisfactionRating = 4.6;

      return {
        totalTickets,
        openTickets,
        resolvedTickets,
        averageResponseTime,
        satisfactionRating,
      };
    } catch (error) {
      console.error('Error fetching support analytics:', error);
      return {
        totalTickets: 0,
        openTickets: 0,
        resolvedTickets: 0,
        averageResponseTime: 0,
        satisfactionRating: 0,
      };
    }
  }

  // Message Listeners
  onMessageReceived(ticketId: string, callback: (message: SupportMessage) => void): () => void {
    this.messageListeners.set(ticketId, callback);
    
    // Return unsubscribe function
    return () => {
      this.messageListeners.delete(ticketId);
    };
  }

  // Private helper methods
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private async assignAgentToChat(sessionId: string): Promise<void> {
    const session = this.chatSessions.get(sessionId);
    if (!session) return;

    const agents = await this.getAvailableAgents();
    const availableAgent = agents.find(agent => agent.status === 'online');
    
    if (availableAgent) {
      session.status = 'active';
      session.agentId = availableAgent.id;

      // Send welcome message from agent
      const welcomeMessage: SupportMessage = {
        id: this.generateId(),
        ticketId: sessionId,
        senderId: availableAgent.id,
        senderType: 'agent',
        content: `Hello! I'm ${availableAgent.name} and I'm here to help you. How can I assist you today?`,
        timestamp: new Date(),
      };

      session.messages.push(welcomeMessage);
    }
  }

  private async simulateAgentResponse(sessionId: string): Promise<void> {
    const session = this.chatSessions.get(sessionId);
    if (!session || !session.agentId) return;

    const responses = [
      "I understand your concern. Let me help you with that.",
      "Thank you for providing those details. I'm looking into this for you.",
      "I can definitely help you resolve this issue. Here's what we can do...",
      "That's a common question. Let me explain the process to you.",
      "I'm checking your account details now. Please give me a moment.",
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const agentMessage: SupportMessage = {
      id: this.generateId(),
      ticketId: sessionId,
      senderId: session.agentId,
      senderType: 'agent',
      content: randomResponse,
      timestamp: new Date(),
    };

    session.messages.push(agentMessage);

    // Notify listeners
    this.messageListeners.forEach((listener) => {
      listener(agentMessage);
    });
  }

  private saveTicketToStorage(ticket: SupportTicket): void {
    try {
      const existingTickets = this.getTicketsFromStorage(ticket.userId);
      const updatedTickets = existingTickets.filter(t => t.id !== ticket.id);
      updatedTickets.unshift(ticket);
      
      // In a real app, you might use AsyncStorage or similar
      // localStorage.setItem(`support_tickets_${ticket.userId}`, JSON.stringify(updatedTickets));
    } catch (error) {
      console.error('Error saving ticket to storage:', error);
    }
  }

  private getTicketsFromStorage(userId: string): SupportTicket[] {
    try {
      // const stored = localStorage.getItem(`support_tickets_${userId}`);
      // if (!stored) return [];
      
      // const tickets = JSON.parse(stored);
      // return tickets.map((ticket: any) => ({
      //   ...ticket,
      //   createdAt: new Date(ticket.createdAt),
      //   updatedAt: new Date(ticket.updatedAt),
      // }));
      console.log('SupportService: Mock storage - returning empty array');
      return [];
    } catch (error) {
      console.error('Error getting tickets from storage:', error);
      return [];
    }
  }

  private getTicketFromStorage(ticketId: string): SupportTicket | null {
    try {
      // This is a simplified approach - in reality you'd need to search across all users
      // or maintain a separate index
      // const keys = Object.keys(localStorage).filter(key => key.startsWith('support_tickets_'));
      
      // for (const key of keys) {
      //   const tickets = JSON.parse(localStorage.getItem(key) || '[]');
      //   const ticket = tickets.find((t: any) => t.id === ticketId);
      //   if (ticket) {
      //     return {
      //       ...ticket,
      //       createdAt: new Date(ticket.createdAt),
      //       updatedAt: new Date(ticket.updatedAt),
      //       messages: ticket.messages.map((msg: any) => ({
      //         ...msg,
      //         timestamp: new Date(msg.timestamp),
      //       })),
      //     };
      //   }
      // }
      
      console.log('SupportService: Mock storage - returning null');
      return null;
    } catch (error) {
      console.error('Error getting ticket from storage:', error);
      return null;
    }
  }

  private async getAllTickets(): Promise<SupportTicket[]> {
    try {
      // const keys = Object.keys(localStorage).filter(key => key.startsWith('support_tickets_'));
      const allTickets: SupportTicket[] = [];
      
      // for (const key of keys) {
      //   const tickets = JSON.parse(localStorage.getItem(key) || '[]');
      //   allTickets.push(...tickets.map((ticket: any) => ({
      //     ...ticket,
      //     createdAt: new Date(ticket.createdAt),
      //     updatedAt: new Date(ticket.updatedAt),
      //     messages: ticket.messages.map((msg: any) => ({
      //       ...msg,
      //       timestamp: new Date(msg.timestamp),
      //     })),
      //   })));
      // }
      
      console.log('SupportService: Mock storage - returning empty array');
      return allTickets;
    } catch (error) {
      console.error('Error getting all tickets:', error);
      return [];
    }
  }
}

export default SupportService.getInstance();
