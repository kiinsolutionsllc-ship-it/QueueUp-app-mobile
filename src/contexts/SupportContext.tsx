import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import SupportService, { SupportTicket, SupportMessage, ChatSession } from '../services/SupportService';
import KnowledgeBaseService, { KnowledgeBaseArticle, SearchResult } from '../services/KnowledgeBaseService';

interface SupportContextType {
  // Ticket management
  supportTickets: SupportTicket[];
  isLoadingTickets: boolean;
  createTicket: (ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages'>) => Promise<SupportTicket>;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status'], agentId?: string) => Promise<void>;
  addMessageToTicket: (ticketId: string, message: Omit<SupportMessage, 'id' | 'timestamp'>) => Promise<SupportMessage>;
  
  // Live chat
  activeChatSession: ChatSession | null;
  isChatConnected: boolean;
  startChatSession: (userId: string) => Promise<ChatSession>;
  endChatSession: (sessionId: string) => Promise<void>;
  sendChatMessage: (sessionId: string, message: Omit<SupportMessage, 'id' | 'timestamp'>) => Promise<SupportMessage>;
  
  // Knowledge base
  searchArticles: (query: string, filters?: any, limit?: number) => Promise<SearchResult[]>;
  getArticle: (articleId: string) => Promise<KnowledgeBaseArticle | null>;
  getPopularArticles: (limit?: number) => Promise<SearchResult[]>;
  getRelatedArticles: (articleId: string, limit?: number) => Promise<KnowledgeBaseArticle[]>;
  rateArticle: (articleId: string, helpful: boolean) => Promise<void>;
  
  // Analytics
  supportAnalytics: {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    averageResponseTime: number;
    satisfactionRating: number;
  } | null;
  isLoadingAnalytics: boolean;
  
  // UI state
  unreadMessages: number;
  hasActiveTickets: boolean;
  refreshSupportData: () => Promise<void>;
}

const SupportContext = createContext<SupportContextType | undefined>(undefined);

interface SupportProviderProps {
  children: ReactNode;
  userId?: string;
}

export function SupportProvider({ children, userId }: SupportProviderProps) {
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [activeChatSession, setActiveChatSession] = useState<ChatSession | null>(null);
  const [isChatConnected, setIsChatConnected] = useState(false);
  const [supportAnalytics, setSupportAnalytics] = useState<SupportContextType['supportAnalytics']>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Load initial data
  useEffect(() => {
    if (userId) {
      loadSupportData();
    }
  }, [userId]);

  // Set up message listeners
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = SupportService.onMessageReceived('*', (message) => {
      // Update unread message count
      setUnreadMessages(prev => prev + 1);
      
      // Update chat session if it's the active one
      if (activeChatSession && message.ticketId === activeChatSession.id) {
        setActiveChatSession(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, message],
          };
        });
      }
      
      // Update ticket messages
      setSupportTickets(prev => 
        prev.map(ticket => {
          if (ticket.id === message.ticketId) {
            return {
              ...ticket,
              messages: [...ticket.messages, message],
              updatedAt: new Date(),
            };
          }
          return ticket;
        })
      );
    });

    return unsubscribe;
  }, [userId, activeChatSession]);

  const loadSupportData = async () => {
    if (!userId) return;

    setIsLoadingTickets(true);
    setIsLoadingAnalytics(true);

    try {
      const [tickets, analytics] = await Promise.all([
        SupportService.getSupportTickets(userId),
        SupportService.getSupportAnalytics(userId),
      ]);

      setSupportTickets(tickets);
      setSupportAnalytics(analytics);
      
      // Calculate derived state
      const hasActive = tickets.some(ticket => 
        ticket.status === 'open' || ticket.status === 'in_progress'
      );
      // hasActiveTickets is calculated in the value object below
      
      // Calculate unread messages
      const unread = tickets.reduce((count, ticket) => {
        return count + ticket.messages.filter(msg => 
          msg.senderType === 'agent' && 
          new Date(msg.timestamp) > new Date(ticket.updatedAt)
        ).length;
      }, 0);
      setUnreadMessages(unread);

    } catch (error) {
      console.error('Error loading support data:', error);
    } finally {
      setIsLoadingTickets(false);
      setIsLoadingAnalytics(false);
    }
  };

  const createTicket = async (ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages'>): Promise<SupportTicket> => {
    try {
      const newTicket = await SupportService.createSupportTicket(ticketData);
      setSupportTickets(prev => [newTicket, ...prev]);
      
      // Update analytics
      if (supportAnalytics) {
        setSupportAnalytics(prev => prev ? {
          ...prev,
          totalTickets: prev.totalTickets + 1,
          openTickets: prev.openTickets + 1,
        } : null);
      }
      
      return newTicket;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  };

  const updateTicketStatus = async (ticketId: string, status: SupportTicket['status'], agentId?: string): Promise<void> => {
    try {
      await SupportService.updateTicketStatus(ticketId, status, agentId);
      
      setSupportTickets(prev => 
        prev.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, status, agentId, updatedAt: new Date() }
            : ticket
        )
      );
      
      // Update analytics
      if (supportAnalytics) {
        const ticket = supportTickets.find(t => t.id === ticketId);
        if (ticket) {
          const wasOpen = ticket.status === 'open' || ticket.status === 'in_progress';
          const isNowOpen = status === 'open' || status === 'in_progress';
          const wasResolved = ticket.status === 'resolved';
          const isNowResolved = status === 'resolved';
          
          setSupportAnalytics(prev => prev ? {
            ...prev,
            openTickets: prev.openTickets + (isNowOpen ? 1 : 0) - (wasOpen ? 1 : 0),
            resolvedTickets: prev.resolvedTickets + (isNowResolved ? 1 : 0) - (wasResolved ? 1 : 0),
          } : null);
        }
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  };

  const addMessageToTicket = async (ticketId: string, message: Omit<SupportMessage, 'id' | 'timestamp'>): Promise<SupportMessage> => {
    try {
      const newMessage = await SupportService.addMessageToTicket(ticketId, message);
      
      setSupportTickets(prev => 
        prev.map(ticket => 
          ticket.id === ticketId 
            ? { 
                ...ticket, 
                messages: [...ticket.messages, newMessage],
                updatedAt: new Date(),
              }
            : ticket
        )
      );
      
      return newMessage;
    } catch (error) {
      console.error('Error adding message to ticket:', error);
      throw error;
    }
  };

  const startChatSession = async (userId: string): Promise<ChatSession> => {
    try {
      const session = await SupportService.startChatSession(userId);
      setActiveChatSession(session);
      setIsChatConnected(true);
      return session;
    } catch (error) {
      console.error('Error starting chat session:', error);
      throw error;
    }
  };

  const endChatSession = async (sessionId: string): Promise<void> => {
    try {
      await SupportService.endChatSession(sessionId);
      setActiveChatSession(null);
      setIsChatConnected(false);
    } catch (error) {
      console.error('Error ending chat session:', error);
      throw error;
    }
  };

  const sendChatMessage = async (sessionId: string, message: Omit<SupportMessage, 'id' | 'timestamp'>): Promise<SupportMessage> => {
    try {
      const newMessage = await SupportService.sendChatMessage(sessionId, message);
      
      setActiveChatSession(prev => {
        if (!prev || prev.id !== sessionId) return prev;
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
        };
      });
      
      return newMessage;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  };

  const searchArticles = async (query: string, filters?: any, limit: number = 10): Promise<SearchResult[]> => {
    try {
      return await KnowledgeBaseService.searchArticles(query, filters, limit);
    } catch (error) {
      console.error('Error searching articles:', error);
      return [];
    }
  };

  const getArticle = async (articleId: string): Promise<KnowledgeBaseArticle | null> => {
    try {
      return await KnowledgeBaseService.getArticle(articleId);
    } catch (error) {
      console.error('Error getting article:', error);
      return null;
    }
  };

  const getPopularArticles = async (limit: number = 5): Promise<SearchResult[]> => {
    try {
      return await KnowledgeBaseService.getPopularArticles(limit);
    } catch (error) {
      console.error('Error getting popular articles:', error);
      return [];
    }
  };

  const getRelatedArticles = async (articleId: string, limit: number = 3): Promise<KnowledgeBaseArticle[]> => {
    try {
      return await KnowledgeBaseService.getRelatedArticles(articleId, limit);
    } catch (error) {
      console.error('Error getting related articles:', error);
      return [];
    }
  };

  const rateArticle = async (articleId: string, helpful: boolean): Promise<void> => {
    try {
      await KnowledgeBaseService.rateArticle(articleId, helpful);
    } catch (error) {
      console.error('Error rating article:', error);
    }
  };

  const refreshSupportData = async (): Promise<void> => {
    await loadSupportData();
  };

  const hasActiveTickets = supportTickets.some(ticket => 
    ticket.status === 'open' || ticket.status === 'in_progress'
  );

  const value: SupportContextType = {
    // Ticket management
    supportTickets,
    isLoadingTickets,
    createTicket,
    updateTicketStatus,
    addMessageToTicket,
    
    // Live chat
    activeChatSession,
    isChatConnected,
    startChatSession,
    endChatSession,
    sendChatMessage,
    
    // Knowledge base
    searchArticles,
    getArticle,
    getPopularArticles,
    getRelatedArticles,
    rateArticle,
    
    // Analytics
    supportAnalytics,
    isLoadingAnalytics,
    
    // UI state
    unreadMessages,
    hasActiveTickets,
    refreshSupportData,
  };

  return (
    <SupportContext.Provider value={value}>
      {children}
    </SupportContext.Provider>
  );
}

export function useSupport(): SupportContextType {
  const context = useContext(SupportContext);
  if (context === undefined) {
    throw new Error('useSupport must be used within a SupportProvider');
  }
  return context;
}
