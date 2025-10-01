import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from './NotificationService';

/**
 * Change Order Service
 * 
 * Handles all change order operations including:
 * - Creating change orders for additional work
 * - Managing line items and pricing
 * - Customer approval workflow
 * - Payment processing for additional work
 * - Integration with existing job system
 */
class ChangeOrderService {
  constructor() {
    this.changeOrders = [];
    this.lineItems = [];
    this.payments = [];
    this.initialized = false;
  }

  // Initialize the service
  async initialize() {
    if (this.initialized) return;
    
    try {
      await this.loadData();
      this.initialized = true;
      console.log('ChangeOrderService: Initialized successfully with', this.changeOrders.length, 'change orders');
    } catch (error) {
      console.error('ChangeOrderService: Initialization failed:', error);
    }
  }

  // Load all data from AsyncStorage
  async loadData() {
    try {
      const [changeOrdersData, lineItemsData, paymentsData] = await Promise.all([
        AsyncStorage.getItem('changeOrders'),
        AsyncStorage.getItem('changeOrderLineItems'),
        AsyncStorage.getItem('changeOrderPayments')
      ]);

      this.changeOrders = changeOrdersData ? JSON.parse(changeOrdersData) : [];
      this.lineItems = lineItemsData ? JSON.parse(lineItemsData) : [];
      this.payments = paymentsData ? JSON.parse(paymentsData) : [];
    } catch (error) {
      console.error('ChangeOrderService: Error loading data:', error);
      this.changeOrders = [];
      this.lineItems = [];
      this.payments = [];
    }
  }

  // Save all data to AsyncStorage
  async saveData() {
    try {
      await Promise.all([
        AsyncStorage.setItem('changeOrders', JSON.stringify(this.changeOrders)),
        AsyncStorage.setItem('changeOrderLineItems', JSON.stringify(this.lineItems)),
        AsyncStorage.setItem('changeOrderPayments', JSON.stringify(this.payments))
      ]);
    } catch (error) {
      console.error('ChangeOrderService: Error saving data:', error);
    }
  }

  // Create a new change order
  async createChangeOrder(changeOrderData) {
    const changeOrder = {
      id: `change-order-${Date.now()}`,
      ...changeOrderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    this.changeOrders.push(changeOrder);
    await this.saveData();

    // Send notification to customer
    await NotificationService.notifyCustomer(
      changeOrder.customerId,
      changeOrder.jobId,
      'change_order_created',
      {
        changeOrderId: changeOrder.id,
        title: changeOrder.title,
        amount: changeOrder.totalAmount,
        mechanicName: changeOrder.mechanicName || 'Your mechanic'
      }
    );

    return { success: true, changeOrder };
  }

  // Add line items to a change order
  async addLineItems(changeOrderId, lineItemsData) {
    const changeOrder = this.changeOrders.find(co => co.id === changeOrderId);
    if (!changeOrder) {
      return { success: false, error: 'Change order not found' };
    }

    const lineItems = lineItemsData.map(item => ({
      id: `line-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      changeOrderId,
      ...item,
      totalPrice: item.quantity * item.unitPrice,
      createdAt: new Date().toISOString()
    }));

    this.lineItems.push(...lineItems);
    
    // Recalculate total amount
    const totalAmount = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
    await this.updateChangeOrder(changeOrderId, { totalAmount });

    await this.saveData();
    return { success: true, lineItems };
  }

  // Update a change order
  async updateChangeOrder(changeOrderId, updates) {
    const changeOrderIndex = this.changeOrders.findIndex(co => co.id === changeOrderId);
    if (changeOrderIndex === -1) {
      return { success: false, error: 'Change order not found' };
    }

    this.changeOrders[changeOrderIndex] = {
      ...this.changeOrders[changeOrderIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.saveData();
    return { success: true, changeOrder: this.changeOrders[changeOrderIndex] };
  }

  // Approve a change order
  async approveChangeOrder(changeOrderId, customerId) {
    console.log('ChangeOrderService: Approving change order', changeOrderId, 'by customer', customerId);
    
    const changeOrder = this.changeOrders.find(co => co.id === changeOrderId);
    if (!changeOrder) {
      console.log('ChangeOrderService: Change order not found:', changeOrderId);
      return { success: false, error: 'Change order not found' };
    }

    if (changeOrder.status !== 'pending') {
      console.log('ChangeOrderService: Change order is not pending, current status:', changeOrder.status);
      return { success: false, error: 'Change order is not pending' };
    }

    console.log('ChangeOrderService: Updating change order status to approved');
    
    // Update change order status and clear expiration date
    await this.updateChangeOrder(changeOrderId, {
      status: 'approved',
      approvedBy: customerId,
      approvedAt: new Date().toISOString(),
      expiresAt: null // Clear expiration date since it's now approved
    });

    console.log('ChangeOrderService: Change order approved successfully, new status:', this.changeOrders.find(co => co.id === changeOrderId)?.status);

    // Send notification to mechanic
    await NotificationService.notifyMechanic(
      changeOrder.mechanicId,
      changeOrder.jobId,
      'change_order_approved',
      {
        changeOrderId: changeOrder.id,
        title: changeOrder.title,
        amount: changeOrder.totalAmount,
        customerName: changeOrder.customerName || 'Customer'
      }
    );

    return { success: true, changeOrder: this.changeOrders.find(co => co.id === changeOrderId) };
  }

  // Reject a change order
  async rejectChangeOrder(changeOrderId, customerId, reason) {
    const changeOrder = this.changeOrders.find(co => co.id === changeOrderId);
    if (!changeOrder) {
      return { success: false, error: 'Change order not found' };
    }

    if (changeOrder.status !== 'pending') {
      return { success: false, error: 'Change order is not pending' };
    }

    // Update change order status
    await this.updateChangeOrder(changeOrderId, {
      status: 'rejected',
      rejectedBy: customerId,
      rejectedAt: new Date().toISOString(),
      reason: reason
    });

    // Send notification to mechanic
    await NotificationService.notifyMechanic(
      changeOrder.mechanicId,
      changeOrder.jobId,
      'change_order_rejected',
      {
        changeOrderId: changeOrder.id,
        title: changeOrder.title,
        reason,
        customerName: changeOrder.customerName || 'Customer'
      }
    );

    return { success: true, changeOrder: this.changeOrders.find(co => co.id === changeOrderId) };
  }

  // Cancel a change order (by mechanic)
  async cancelChangeOrder(changeOrderId, mechanicId, reason) {
    const changeOrder = this.changeOrders.find(co => co.id === changeOrderId);
    if (!changeOrder) {
      return { success: false, error: 'Change order not found' };
    }

    if (changeOrder.mechanicId !== mechanicId) {
      return { success: false, error: 'Unauthorized' };
    }

    if (changeOrder.status !== 'pending') {
      return { success: false, error: 'Change order cannot be cancelled' };
    }

    // Update change order status
    await this.updateChangeOrder(changeOrderId, {
      status: 'cancelled',
      reason: reason
    });

    // Send notification to customer
    await NotificationService.notifyCustomer(
      changeOrder.customerId,
      changeOrder.jobId,
      'change_order_cancelled',
      {
        changeOrderId: changeOrder.id,
        title: changeOrder.title,
        reason,
        mechanicName: changeOrder.mechanicName || 'Your mechanic'
      }
    );

    return { success: true, changeOrder: this.changeOrders.find(co => co.id === changeOrderId) };
  }

  // Get change orders for a job
  getChangeOrdersByJob(jobId) {
    return this.changeOrders.filter(co => co.jobId === jobId);
  }

  // Get pending change orders by job ID
  getPendingChangeOrdersByJob(jobId) {
    return this.changeOrders.filter(co => co.jobId === jobId && co.status === 'pending');
  }

  // Get change orders for a mechanic
  getChangeOrdersByMechanic(mechanicId) {
    return this.changeOrders.filter(co => co.mechanicId === mechanicId);
  }

  // Get change orders for a customer
  getChangeOrdersByCustomer(customerId) {
    return this.changeOrders.filter(co => co.customerId === customerId);
  }

  // Get line items for a change order
  getLineItemsByChangeOrder(changeOrderId) {
    return this.lineItems.filter(item => item.changeOrderId === changeOrderId);
  }

  // Get pending change orders for a customer
  getPendingChangeOrdersForCustomer(customerId) {
    return this.changeOrders.filter(co => 
      co.customerId === customerId && co.status === 'pending'
    );
  }

  // Get pending change orders for a mechanic
  getPendingChangeOrdersForMechanic(mechanicId) {
    return this.changeOrders.filter(co => 
      co.mechanicId === mechanicId && co.status === 'pending'
    );
  }

  // Process payment for a change order (held in escrow)
  async processChangeOrderPayment(changeOrderId, paymentData) {
    const changeOrder = this.changeOrders.find(co => co.id === changeOrderId);
    if (!changeOrder) {
      return { success: false, error: 'Change order not found' };
    }

    if (changeOrder.status !== 'approved') {
      return { success: false, error: 'Change order must be approved before payment' };
    }

    const payment = {
      id: `change-payment-${Date.now()}`,
      changeOrderId,
      customerId: changeOrder.customerId,
      amount: changeOrder.totalAmount,
      currency: 'USD',
      status: 'escrow', // Payment held in escrow until work is completed
      ...paymentData,
      createdAt: new Date().toISOString(),
      escrowDate: new Date().toISOString()
    };

    this.payments.push(payment);
    await this.saveData();

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update payment status to escrow (not completed yet)
    payment.status = 'escrow';
    payment.processedAt = new Date().toISOString();

    // Update change order status to escrow
    await this.updateChangeOrder(changeOrderId, { status: 'escrow' });

    // Send notification to mechanic about escrow payment
    await NotificationService.notifyMechanic(
      changeOrder.mechanicId,
      changeOrder.jobId,
      'change_order_payment_escrow',
      {
        changeOrderId: changeOrder.id,
        amount: changeOrder.totalAmount,
        customerName: changeOrder.customerName || 'Customer'
      }
    );

    return { success: true, payment };
  }

  // Release escrow payment when work is completed
  async releaseEscrowPayment(changeOrderId) {
    const changeOrder = this.changeOrders.find(co => co.id === changeOrderId);
    if (!changeOrder) {
      return { success: false, error: 'Change order not found' };
    }

    if (changeOrder.status !== 'escrow') {
      return { success: false, error: 'Change order must be in escrow to release payment' };
    }

    // Find the escrow payment
    const payment = this.payments.find(p => p.changeOrderId === changeOrderId && p.status === 'escrow');
    if (!payment) {
      return { success: false, error: 'Escrow payment not found' };
    }

    // Update payment status to released
    payment.status = 'released';
    payment.releasedAt = new Date().toISOString();

    // Update change order status to paid
    await this.updateChangeOrder(changeOrderId, { status: 'paid' });

    // Send notification to mechanic about payment release
    await NotificationService.notifyMechanic(
      changeOrder.mechanicId,
      changeOrder.jobId,
      'change_order_payment_released',
      {
        changeOrderId: changeOrder.id,
        amount: changeOrder.totalAmount,
        customerName: changeOrder.customerName || 'Customer'
      }
    );

    await this.saveData();
    return { success: true, payment };
  }

  // Get change order statistics
  getChangeOrderStats(mechanicId = null, customerId = null) {
    let filteredOrders = this.changeOrders;

    if (mechanicId) {
      filteredOrders = filteredOrders.filter(co => co.mechanicId === mechanicId);
    }

    if (customerId) {
      filteredOrders = filteredOrders.filter(co => co.customerId === customerId);
    }

    const stats = {
      total: filteredOrders.length,
      pending: filteredOrders.filter(co => co.status === 'pending').length,
      approved: filteredOrders.filter(co => co.status === 'approved').length,
      rejected: filteredOrders.filter(co => co.status === 'rejected').length,
      cancelled: filteredOrders.filter(co => co.status === 'cancelled').length,
      escrow: filteredOrders.filter(co => co.status === 'escrow').length,
      paid: filteredOrders.filter(co => co.status === 'paid').length,
      expired: filteredOrders.filter(co => co.status === 'expired').length,
      totalAmount: filteredOrders.reduce((sum, co) => sum + (co.totalAmount || 0), 0),
      averageAmount: filteredOrders.length > 0 ? 
        filteredOrders.reduce((sum, co) => sum + (co.totalAmount || 0), 0) / filteredOrders.length : 0
    };

    return stats;
  }

  // Check if change order has expired
  checkExpiredChangeOrders() {
    const now = new Date();
    const expiredOrders = this.changeOrders.filter(co => 
      co.status === 'pending' && new Date(co.expiresAt) < now
    );

    expiredOrders.forEach(async (order) => {
      await this.updateChangeOrder(order.id, { status: 'expired' });
      
      // Notify both parties
      await NotificationService.notifyCustomer(
        order.customerId,
        order.jobId,
        'change_order_expired',
        { changeOrderId: order.id, title: order.title }
      );

      await NotificationService.notifyMechanic(
        order.mechanicId,
        order.jobId,
        'change_order_expired',
        { changeOrderId: order.id, title: order.title }
      );
    });

    return expiredOrders.length;
  }

  // Utility methods
  isReady() {
    return this.initialized;
  }

  async refresh() {
    await this.loadData();
  }

  // Expire all pending change orders for a job when it's completed
  async expirePendingChangeOrdersForJob(jobId) {
    try {
      console.log('ChangeOrderService: Expiring pending change orders for job:', jobId);
      
      const pendingChangeOrders = this.changeOrders.filter(
        co => co.jobId === jobId && co.status === 'pending'
      );

      if (pendingChangeOrders.length === 0) {
        console.log('ChangeOrderService: No pending change orders found for job:', jobId);
        return { success: true, expiredCount: 0 };
      }

      let expiredCount = 0;
      const expiredChangeOrders = [];

      for (const changeOrder of pendingChangeOrders) {
        // Update change order status to expired
        await this.updateChangeOrder(changeOrder.id, {
          status: 'expired',
          reason: 'Job completed - change order no longer applicable',
          updatedAt: new Date().toISOString()
        });

        expiredCount++;
        expiredChangeOrders.push(changeOrder);

        // Send notification to customer about expired change order
        try {
          await NotificationService.notifyCustomer(
            changeOrder.customerId,
            changeOrder.jobId,
            'change_order_expired',
            {
              changeOrderId: changeOrder.id,
              title: changeOrder.title,
              amount: changeOrder.totalAmount,
              reason: 'Job completed - change order no longer applicable'
            }
          );
        } catch (error) {
          console.error('ChangeOrderService: Failed to send expiration notification:', error);
        }

        // Send notification to mechanic about expired change order
        try {
          await NotificationService.notifyMechanic(
            changeOrder.mechanicId,
            changeOrder.jobId,
            'change_order_expired',
            {
              changeOrderId: changeOrder.id,
              title: changeOrder.title,
              amount: changeOrder.totalAmount,
              reason: 'Job completed - change order no longer applicable'
            }
          );
        } catch (error) {
          console.error('ChangeOrderService: Failed to send expiration notification to mechanic:', error);
        }

        console.log('ChangeOrderService: Expired change order:', changeOrder.id);
      }

      console.log('ChangeOrderService: Successfully expired', expiredCount, 'change orders for job:', jobId);
      
      return { 
        success: true, 
        expiredCount,
        expiredChangeOrders: expiredChangeOrders.map(co => ({
          id: co.id,
          title: co.title,
          amount: co.totalAmount
        }))
      };
    } catch (error) {
      console.error('ChangeOrderService: Error expiring pending change orders:', error);
      return { success: false, error: error.message };
    }
  }

  getAllData() {
    return {
      changeOrders: [...this.changeOrders],
      lineItems: [...this.lineItems],
      payments: [...this.payments]
    };
  }
}

// Export singleton instance
export default new ChangeOrderService();

