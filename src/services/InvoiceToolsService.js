import AsyncStorage from '@react-native-async-storage/async-storage';
import uniqueIdGenerator from '../utils/UniqueIdGenerator';
import { MOCK_MODE } from '../config/payment';

/**
 * INVOICE TOOLS SERVICE
 * 
 * Professional invoice generation and management for Professional and Enterprise tiers
 * Features:
 * - Automated invoice generation
 * - Payment processing integration
 * - Tax calculation
 * - Receipt management
 * - Invoice templates
 * - Payment tracking
 */

class InvoiceToolsService {
  constructor() {
    this.invoices = [];
    this.invoiceTemplates = [];
    this.paymentRecords = [];
    this.taxRates = [];
    this.initialized = false;
    
    // Storage keys
    this.INVOICES_KEY = 'invoice_tools_invoices';
    this.TEMPLATES_KEY = 'invoice_tools_templates';
    this.PAYMENTS_KEY = 'invoice_tools_payments';
    this.TAX_RATES_KEY = 'invoice_tools_tax_rates';
    
    this.initialize();
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      await this.loadData();
      await this.initializeDefaultTemplates();
      await this.initializeDefaultTaxRates();
      this.initialized = true;
      console.log('InvoiceToolsService: Initialized successfully');
    } catch (error) {
      console.error('InvoiceToolsService: Error initializing:', error);
    }
  }

  async loadData() {
    try {
      const [invoices, templates, payments, taxRates] = await Promise.all([
        AsyncStorage.getItem(this.INVOICES_KEY),
        AsyncStorage.getItem(this.TEMPLATES_KEY),
        AsyncStorage.getItem(this.PAYMENTS_KEY),
        AsyncStorage.getItem(this.TAX_RATES_KEY)
      ]);

      this.invoices = invoices ? JSON.parse(invoices) : [];
      this.invoiceTemplates = templates ? JSON.parse(templates) : [];
      this.paymentRecords = payments ? JSON.parse(payments) : [];
      this.taxRates = taxRates ? JSON.parse(taxRates) : [];
    } catch (error) {
      console.error('InvoiceToolsService: Error loading data:', error);
    }
  }

  async saveData() {
    try {
      await Promise.all([
        AsyncStorage.setItem(this.INVOICES_KEY, JSON.stringify(this.invoices)),
        AsyncStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(this.invoiceTemplates)),
        AsyncStorage.setItem(this.PAYMENTS_KEY, JSON.stringify(this.paymentRecords)),
        AsyncStorage.setItem(this.TAX_RATES_KEY, JSON.stringify(this.taxRates))
      ]);
    } catch (error) {
      console.error('InvoiceToolsService: Error saving data:', error);
    }
  }

  async initializeDefaultTemplates() {
    if (this.invoiceTemplates.length > 0) return;

    const defaultTemplates = [
      {
        id: 'standard',
        name: 'Standard Invoice',
        description: 'Basic invoice template for general services',
        template: {
          header: {
            logo: null,
            business_name: 'Your Business Name',
            business_address: '123 Main St, City, State 12345',
            business_phone: '(555) 123-4567',
            business_email: 'contact@yourbusiness.com'
          },
          customer_section: {
            title: 'Bill To:',
            fields: ['name', 'address', 'phone', 'email']
          },
          invoice_details: {
            invoice_number_prefix: 'INV-',
            show_due_date: true,
            due_days: 30,
            show_terms: true,
            terms_text: 'Payment due within 30 days of invoice date.'
          },
          line_items: {
            show_description: true,
            show_quantity: true,
            show_rate: true,
            show_amount: true
          },
          totals: {
            show_subtotal: true,
            show_tax: true,
            show_discount: false,
            show_total: true
          },
          footer: {
            show_notes: true,
            notes_text: 'Thank you for your business!'
          }
        },
        is_default: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'detailed',
        name: 'Detailed Service Invoice',
        description: 'Comprehensive invoice for detailed service breakdown',
        template: {
          header: {
            logo: null,
            business_name: 'Your Business Name',
            business_address: '123 Main St, City, State 12345',
            business_phone: '(555) 123-4567',
            business_email: 'contact@yourbusiness.com'
          },
          customer_section: {
            title: 'Bill To:',
            fields: ['name', 'address', 'phone', 'email', 'vehicle_info']
          },
          invoice_details: {
            invoice_number_prefix: 'SVC-',
            show_due_date: true,
            due_days: 15,
            show_terms: true,
            terms_text: 'Payment due within 15 days. Late fees may apply.',
            show_service_date: true,
            show_vehicle_info: true
          },
          line_items: {
            show_description: true,
            show_quantity: true,
            show_rate: true,
            show_amount: true,
            show_parts: true,
            show_labor: true
          },
          totals: {
            show_subtotal: true,
            show_tax: true,
            show_discount: true,
            show_total: true,
            show_parts_total: true,
            show_labor_total: true
          },
          footer: {
            show_notes: true,
            notes_text: 'Warranty information and service details available upon request.',
            show_warranty: true
          }
        },
        is_default: false,
        created_at: new Date().toISOString()
      }
    ];

    this.invoiceTemplates = defaultTemplates;
    await this.saveData();
  }

  async initializeDefaultTaxRates() {
    if (this.taxRates.length > 0) return;

    const defaultTaxRates = [
      {
        id: 'us_sales_tax',
        name: 'US Sales Tax',
        rate: 0.08, // 8%
        type: 'percentage',
        applicable_to: ['services', 'parts'],
        states: ['CA', 'NY', 'TX', 'FL', 'IL'],
        created_at: new Date().toISOString()
      },
      {
        id: 'canada_gst',
        name: 'Canada GST',
        rate: 0.05, // 5%
        type: 'percentage',
        applicable_to: ['services', 'parts'],
        provinces: ['ON', 'BC', 'AB', 'QC'],
        created_at: new Date().toISOString()
      },
      {
        id: 'no_tax',
        name: 'No Tax',
        rate: 0.00,
        type: 'percentage',
        applicable_to: [],
        description: 'For tax-exempt customers or jurisdictions',
        created_at: new Date().toISOString()
      }
    ];

    this.taxRates = defaultTaxRates;
    await this.saveData();
  }

  // ========================================
  // INVOICE GENERATION
  // ========================================

  async generateInvoice(userId, jobId, invoiceData) {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const invoice = {
          id: uniqueIdGenerator.generateId('invoice'),
          user_id: userId,
          job_id: jobId,
          invoice_number: this.generateInvoiceNumber(),
          customer_id: invoiceData.customer_id,
          customer_info: invoiceData.customer_info,
          invoice_date: new Date().toISOString(),
          due_date: this.calculateDueDate(invoiceData.due_days || 30),
          status: 'pending', // pending, sent, paid, overdue, cancelled
          template_id: invoiceData.template_id || 'standard',
          line_items: invoiceData.line_items || [],
          subtotal: this.calculateSubtotal(invoiceData.line_items || []),
          tax_rate: invoiceData.tax_rate || 0.08,
          tax_amount: 0,
          discount_amount: invoiceData.discount_amount || 0,
          total_amount: 0,
          payment_terms: invoiceData.payment_terms || 'Payment due within 30 days',
          notes: invoiceData.notes || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Calculate totals
        invoice.tax_amount = invoice.subtotal * invoice.tax_rate;
        invoice.total_amount = invoice.subtotal + invoice.tax_amount - invoice.discount_amount;

        this.invoices.push(invoice);
        await this.saveData();
        return { success: true, invoice };
      }
    } catch (error) {
      console.error('InvoiceToolsService: Error generating invoice:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // PAYMENT PROCESSING
  // ========================================

  async processPayment(invoiceId, paymentData) {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const invoice = this.invoices.find(inv => inv.id === invoiceId);
        if (!invoice) {
          return { success: false, error: 'Invoice not found' };
        }

        const payment = {
          id: uniqueIdGenerator.generateId('payment'),
          invoice_id: invoiceId,
          user_id: invoice.user_id,
          amount: paymentData.amount,
          payment_method: paymentData.payment_method, // credit_card, bank_transfer, cash, check
          payment_date: new Date().toISOString(),
          transaction_id: paymentData.transaction_id || `txn_${Date.now()}`,
          status: 'completed',
          notes: paymentData.notes || '',
          created_at: new Date().toISOString()
        };

        this.paymentRecords.push(payment);

        // Update invoice status
        const totalPaid = this.paymentRecords
          .filter(p => p.invoice_id === invoiceId && p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0);

        if (totalPaid >= invoice.total_amount) {
          invoice.status = 'paid';
        } else if (totalPaid > 0) {
          invoice.status = 'partially_paid';
        }

        invoice.updated_at = new Date().toISOString();

        await this.saveData();
        return { success: true, payment, invoice };
      }
    } catch (error) {
      console.error('InvoiceToolsService: Error processing payment:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // INVOICE MANAGEMENT
  // ========================================

  async sendInvoice(invoiceId, sendMethod = 'email') {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const invoice = this.invoices.find(inv => inv.id === invoiceId);
        if (!invoice) {
          return { success: false, error: 'Invoice not found' };
        }

        invoice.status = 'sent';
        invoice.sent_at = new Date().toISOString();
        invoice.sent_method = sendMethod;
        invoice.updated_at = new Date().toISOString();

        await this.saveData();
        return { success: true, invoice };
      }
    } catch (error) {
      console.error('InvoiceToolsService: Error sending invoice:', error);
      return { success: false, error: error.message };
    }
  }

  async markInvoiceOverdue(invoiceId) {
    try {
      const invoice = this.invoices.find(inv => inv.id === invoiceId);
      if (!invoice) {
        return { success: false, error: 'Invoice not found' };
      }

      const dueDate = new Date(invoice.due_date);
      const now = new Date();

      if (now > dueDate && invoice.status === 'sent') {
        invoice.status = 'overdue';
        invoice.updated_at = new Date().toISOString();
        await this.saveData();
        return { success: true, invoice };
      }

      return { success: false, error: 'Invoice is not overdue' };
    } catch (error) {
      console.error('InvoiceToolsService: Error marking invoice overdue:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // RECEIPT GENERATION
  // ========================================

  async generateReceipt(paymentId) {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 600));
        
        const payment = this.paymentRecords.find(p => p.id === paymentId);
        if (!payment) {
          return { success: false, error: 'Payment not found' };
        }

        const invoice = this.invoices.find(inv => inv.id === payment.invoice_id);
        if (!invoice) {
          return { success: false, error: 'Invoice not found' };
        }

        const receipt = {
          id: uniqueIdGenerator.generateId('receipt'),
          payment_id: paymentId,
          invoice_id: payment.invoice_id,
          user_id: payment.user_id,
          receipt_number: this.generateReceiptNumber(),
          customer_info: invoice.customer_info,
          payment_amount: payment.amount,
          payment_method: payment.payment_method,
          payment_date: payment.payment_date,
          invoice_number: invoice.invoice_number,
          services_provided: invoice.line_items.map(item => item.description),
          created_at: new Date().toISOString()
        };

        await this.saveData();
        return { success: true, receipt };
      }
    } catch (error) {
      console.error('InvoiceToolsService: Error generating receipt:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // ANALYTICS AND REPORTING
  // ========================================

  getInvoiceAnalytics(userId, timeframe = '30_days') {
    try {
      const now = new Date();
      const daysBack = timeframe === '7_days' ? 7 : timeframe === '30_days' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      const userInvoices = this.invoices.filter(inv => 
        inv.user_id === userId && new Date(inv.created_at) >= cutoffDate
      );

      const analytics = {
        total_invoices: userInvoices.length,
        total_amount: userInvoices.reduce((sum, inv) => sum + inv.total_amount, 0),
        paid_invoices: userInvoices.filter(inv => inv.status === 'paid').length,
        pending_invoices: userInvoices.filter(inv => inv.status === 'pending').length,
        overdue_invoices: userInvoices.filter(inv => inv.status === 'overdue').length,
        average_invoice_amount: userInvoices.length > 0 ? 
          userInvoices.reduce((sum, inv) => sum + inv.total_amount, 0) / userInvoices.length : 0,
        payment_rate: userInvoices.length > 0 ? 
          (userInvoices.filter(inv => inv.status === 'paid').length / userInvoices.length) * 100 : 0,
        average_payment_time: this.calculateAveragePaymentTime(userInvoices),
        revenue_by_status: this.groupRevenueByStatus(userInvoices),
        monthly_breakdown: this.getMonthlyInvoiceBreakdown(userInvoices)
      };

      return { success: true, analytics };
    } catch (error) {
      console.error('InvoiceToolsService: Error getting invoice analytics:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // TEMPLATE MANAGEMENT
  // ========================================

  async createInvoiceTemplate(templateData) {
    try {
      if (MOCK_MODE) {
        const template = {
          id: uniqueIdGenerator.generateId('template'),
          name: templateData.name,
          description: templateData.description,
          template: templateData.template,
          is_default: false,
          created_at: new Date().toISOString()
        };

        this.invoiceTemplates.push(template);
        await this.saveData();
        return { success: true, template };
      }
    } catch (error) {
      console.error('InvoiceToolsService: Error creating invoice template:', error);
      return { success: false, error: error.message };
    }
  }

  getInvoiceTemplates() {
    return this.invoiceTemplates;
  }

  getInvoiceTemplate(templateId) {
    return this.invoiceTemplates.find(t => t.id === templateId);
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  generateInvoiceNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `INV-${year}${month}${day}-${random}`;
  }

  generateReceiptNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `RCP-${year}${month}${day}-${random}`;
  }

  calculateDueDate(dueDays) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueDays);
    return dueDate.toISOString();
  }

  calculateSubtotal(lineItems) {
    return lineItems.reduce((sum, item) => {
      const quantity = item.quantity || 1;
      const rate = item.rate || 0;
      return sum + (quantity * rate);
    }, 0);
  }

  calculateAveragePaymentTime(invoices) {
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    if (paidInvoices.length === 0) return 0;

    const totalDays = paidInvoices.reduce((sum, inv) => {
      const created = new Date(inv.created_at);
      const paid = new Date(inv.updated_at);
      const days = Math.ceil((paid - created) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    return Math.round(totalDays / paidInvoices.length);
  }

  groupRevenueByStatus(invoices) {
    const grouped = {};
    invoices.forEach(inv => {
      if (!grouped[inv.status]) {
        grouped[inv.status] = { count: 0, total: 0 };
      }
      grouped[inv.status].count += 1;
      grouped[inv.status].total += inv.total_amount;
    });
    return grouped;
  }

  getMonthlyInvoiceBreakdown(invoices) {
    const monthly = {};
    invoices.forEach(inv => {
      const month = inv.created_at.substring(0, 7); // YYYY-MM
      if (!monthly[month]) {
        monthly[month] = { count: 0, total: 0 };
      }
      monthly[month].count += 1;
      monthly[month].total += inv.total_amount;
    });
    return monthly;
  }

  getUserInvoices(userId, status = null) {
    let userInvoices = this.invoices.filter(inv => inv.user_id === userId);
    
    if (status) {
      userInvoices = userInvoices.filter(inv => inv.status === status);
    }
    
    return userInvoices.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  getInvoicePayments(invoiceId) {
    return this.paymentRecords.filter(p => p.invoice_id === invoiceId);
  }

  getOverdueInvoices(userId) {
    const now = new Date();
    return this.invoices.filter(inv => 
      inv.user_id === userId && 
      inv.status === 'sent' && 
      new Date(inv.due_date) < now
    );
  }

  clearAllData() {
    this.invoices = [];
    this.invoiceTemplates = [];
    this.paymentRecords = [];
    this.taxRates = [];
    return this.saveData();
  }
}

// Export singleton instance
const invoiceToolsService = new InvoiceToolsService();
export default invoiceToolsService;
