/**
 * Supabase MCP (Model Context Protocol) Integration Service
 * 
 * This service provides a standardized interface for MCP operations
 * with Supabase, including connection management, error handling,
 * and fallback mechanisms.
 */

import { supabase, safeSupabase, testSupabaseConnection } from '../config/supabase';

export interface MCPConnectionStatus {
  connected: boolean;
  error?: string;
  fallback: boolean;
}

export interface MCPOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fallback?: boolean;
}

export class SupabaseMCPService {
  private static instance: SupabaseMCPService;
  private connectionStatus: MCPConnectionStatus = {
    connected: false,
    fallback: false
  };

  private constructor() {
    this.initializeConnection();
  }

  public static getInstance(): SupabaseMCPService {
    if (!SupabaseMCPService.instance) {
      SupabaseMCPService.instance = new SupabaseMCPService();
    }
    return SupabaseMCPService.instance;
  }

  private async initializeConnection(): Promise<void> {
    try {
      console.log('MCP Service: Initializing Supabase connection...');
      
      if (!supabase) {
        this.connectionStatus = {
          connected: false,
          error: 'Supabase not configured',
          fallback: true
        };
        console.warn('MCP Service: Supabase not configured - using fallback mode');
        return;
      }

      const connectionTest = await testSupabaseConnection();
      
      if (connectionTest) {
        this.connectionStatus = {
          connected: true,
          fallback: false
        };
        console.log('MCP Service: Supabase connection established');
      } else {
        this.connectionStatus = {
          connected: false,
          error: 'Connection test failed',
          fallback: true
        };
        console.warn('MCP Service: Connection test failed - using fallback mode');
      }
    } catch (error) {
      this.connectionStatus = {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
      };
      console.error('MCP Service: Connection initialization failed:', error);
    }
  }

  public getConnectionStatus(): MCPConnectionStatus {
    return { ...this.connectionStatus };
  }

  public async testConnection(): Promise<boolean> {
    try {
      if (!supabase) {
        return false;
      }
      return await testSupabaseConnection();
    } catch (error) {
      console.error('MCP Service: Connection test error:', error);
      return false;
    }
  }

  public async reconnect(): Promise<MCPOperationResult> {
    try {
      console.log('MCP Service: Attempting to reconnect...');
      await this.initializeConnection();
      
      if (this.connectionStatus.connected) {
        return {
          success: true,
          data: { message: 'Reconnected successfully' }
        };
      } else {
        return {
          success: false,
          error: this.connectionStatus.error || 'Reconnection failed',
          fallback: true
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Reconnection error',
        fallback: true
      };
    }
  }

  public getClient() {
    if (this.connectionStatus.connected && supabase) {
      return supabase;
    }
    return safeSupabase;
  }

  public async executeQuery<T = any>(
    table: string,
    operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert',
    data?: any,
    options?: any
  ): Promise<MCPOperationResult<T>> {
    try {
      const client = this.getClient();
      
      if (!client) {
        return {
          success: false,
          error: 'No database client available',
          fallback: true
        };
      }

      let result;
      const query = client.from(table);

      switch (operation) {
        case 'select':
          result = await query.select(options?.select || '*');
          break;
        case 'insert':
          result = await query.insert(data);
          break;
        case 'update':
          result = await query.update(data);
          break;
        case 'delete':
          result = await query.delete();
          break;
        case 'upsert':
          result = await query.upsert(data);
          break;
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      if (result.error) {
        return {
          success: false,
          error: result.error.message,
          fallback: this.connectionStatus.fallback
        };
      }

      return {
        success: true,
        data: result.data as T | undefined,
        fallback: this.connectionStatus.fallback
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Query execution error',
        fallback: this.connectionStatus.fallback
      };
    }
  }

  public async getTableInfo(table: string): Promise<MCPOperationResult> {
    try {
      const result = await this.executeQuery(table, 'select', null, { select: 'count' });
      
      if (result.success) {
        return {
          success: true,
          data: {
            table,
            recordCount: Array.isArray(result.data) ? result.data.length : 0,
            connected: this.connectionStatus.connected,
            fallback: this.connectionStatus.fallback
          }
        };
      } else {
        return result;
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Table info error',
        fallback: this.connectionStatus.fallback
      };
    }
  }

  public async healthCheck(): Promise<MCPOperationResult> {
    try {
      const status = this.getConnectionStatus();
      const connectionTest = await this.testConnection();
      
      return {
        success: connectionTest,
        data: {
          ...status,
          timestamp: new Date().toISOString(),
          clientAvailable: !!this.getClient()
        },
        fallback: status.fallback
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Health check error',
        fallback: true
      };
    }
  }
}

// Export singleton instance
export const supabaseMCP = SupabaseMCPService.getInstance();

// Export convenience functions
export const getSupabaseMCP = () => SupabaseMCPService.getInstance();
export const testSupabaseMCP = () => getSupabaseMCP().testConnection();
export const getSupabaseMCPStatus = () => getSupabaseMCP().getConnectionStatus();
export const reconnectSupabaseMCP = () => getSupabaseMCP().reconnect();

export default SupabaseMCPService;
