// Commission Service
// Manages dynamic commission rates based on service categories

class CommissionService {
  constructor() {
    this.commissionRates = new Map();
    this.defaultRate = 0.10; // 10% default
    this.initializeRates();
  }

  // Initialize default commission rates
  initializeRates() {
    // Default rates based on service categories
    this.commissionRates.set('Maintenance', 0.08);      // 8% - Lower for routine maintenance
    this.commissionRates.set('Repair', 0.12);           // 12% - Higher for complex repairs
    this.commissionRates.set('Detailing', 0.15);        // 15% - Premium service
    this.commissionRates.set('Diagnostic/Other', 0.10); // 10% - Standard rate
    this.commissionRates.set('Emergency', 0.08);        // 8% - Lower for emergency services
    this.commissionRates.set('Tire', 0.06);             // 6% - Lower for tire services
    this.commissionRates.set('Electrical', 0.12);       // 12% - Higher for electrical work
    this.commissionRates.set('Transmission', 0.10);     // 10% - Standard for transmission
    this.commissionRates.set('Engine', 0.10);           // 10% - Standard for engine work
    this.commissionRates.set('AC', 0.12);               // 12% - Higher for AC work
    this.commissionRates.set('Brake', 0.10);            // 10% - Standard for brake work
    this.commissionRates.set('Battery', 0.08);          // 8% - Lower for battery work
    this.commissionRates.set('additional_work', 0.08);  // 8% - Lower rate for additional work
  }

  // Get commission rate for a specific service category
  getCommissionRate(serviceCategory) {
    if (!serviceCategory) {
      return this.defaultRate;
    }

    // Try exact match first
    if (this.commissionRates.has(serviceCategory)) {
      return this.commissionRates.get(serviceCategory);
    }

    // Try partial matching for subcategories
    const category = this.findMatchingCategory(serviceCategory);
    if (category) {
      return this.commissionRates.get(category);
    }

    // Return default rate if no match found
    return this.defaultRate;
  }

  // Find matching category for subcategories
  findMatchingCategory(serviceCategory) {
    const category = serviceCategory.toLowerCase();
    
    // Map subcategories to main categories
    const categoryMappings = {
      'oil-change': 'Maintenance',
      'oil_change': 'Maintenance',
      'filter': 'Maintenance',
      'fluid': 'Maintenance',
      'tire-rotation': 'Maintenance',
      'tire_rotation': 'Maintenance',
      'inspection': 'Maintenance',
      
      'brake': 'Brake',
      'brake-service': 'Brake',
      'brake_service': 'Brake',
      'brake-pad': 'Brake',
      'brake_pad': 'Brake',
      'brake-rotor': 'Brake',
      'brake_rotor': 'Brake',
      
      'tire': 'Tire',
      'tire-service': 'Tire',
      'tire_service': 'Tire',
      'wheel': 'Tire',
      'wheel-alignment': 'Tire',
      'wheel_alignment': 'Tire',
      'balancing': 'Tire',
      
      'electrical': 'Electrical',
      'battery': 'Battery',
      'alternator': 'Electrical',
      'starter': 'Electrical',
      'lights': 'Electrical',
      'wiring': 'Electrical',
      
      'ac': 'AC',
      'air-conditioning': 'AC',
      'air_conditioning': 'AC',
      'heating': 'AC',
      'cooling': 'AC',
      
      'engine': 'Engine',
      'transmission': 'Transmission',
      'diagnostic': 'Diagnostic/Other',
      'diagnosis': 'Diagnostic/Other',
      
      'detailing': 'Detailing',
      'wash': 'Detailing',
      'wax': 'Detailing',
      'polish': 'Detailing',
      'interior': 'Detailing',
      'exterior': 'Detailing',
      
      'emergency': 'Emergency',
      'roadside': 'Emergency',
      'towing': 'Emergency',
    };

    // Check for exact matches first
    if (categoryMappings[category]) {
      return categoryMappings[category];
    }

    // Check for partial matches
    for (const [key, value] of Object.entries(categoryMappings)) {
      if (category.includes(key)) {
        return value;
      }
    }

    return null;
  }

  // Calculate commission amount
  calculateCommission(amount, serviceCategory) {
    const rate = this.getCommissionRate(serviceCategory);
    return Math.round(amount * rate * 100) / 100;
  }

  // Calculate mechanic payout
  calculateMechanicPayout(amount, serviceCategory) {
    const commission = this.calculateCommission(amount, serviceCategory);
    return Math.round((amount - commission) * 100) / 100;
  }

  // Update commission rate for a category
  updateCommissionRate(category, rate) {
    if (rate < 0 || rate > 1) {
      throw new Error('Commission rate must be between 0 and 1');
    }
    this.commissionRates.set(category, rate);
  }

  // Get all commission rates
  getAllRates() {
    const rates = {};
    for (const [category, rate] of this.commissionRates) {
      rates[category] = rate;
    }
    return rates;
  }

  // Get commission rate details for display
  getCommissionDetails(serviceCategory) {
    const rate = this.getCommissionRate(serviceCategory);
    const percentage = ((rate || 0) * 100).toFixed(1);
    
    return {
      category: serviceCategory,
      rate: rate,
      percentage: `${percentage}%`,
      description: this.getRateDescription(rate)
    };
  }

  // Get description for commission rate
  getRateDescription(rate) {
    if (rate <= 0.06) return 'Low commission rate';
    if (rate <= 0.08) return 'Below average rate';
    if (rate <= 0.10) return 'Standard rate';
    if (rate <= 0.12) return 'Above average rate';
    return 'Premium rate';
  }

  // Get commission summary for analytics
  getCommissionSummary(transactions) {
    const summary = {};
    
    transactions.forEach(transaction => {
      const category = transaction.serviceCategory || 'Unknown';
      const rate = this.getCommissionRate(category);
      const commission = this.calculateCommission(transaction.amount, category);
      
      if (!summary[category]) {
        summary[category] = {
          category,
          rate,
          percentage: `${((rate || 0) * 100).toFixed(1)}%`,
          totalAmount: 0,
          totalCommission: 0,
          transactionCount: 0
        };
      }
      
      summary[category].totalAmount += transaction.amount;
      summary[category].totalCommission += commission;
      summary[category].transactionCount += 1;
    });
    
    return Object.values(summary);
  }

  // Reset to default rates
  resetToDefaults() {
    this.initializeRates();
  }

  // Export rates for backup
  exportRates() {
    return {
      rates: this.getAllRates(),
      defaultRate: this.defaultRate,
      exportedAt: new Date().toISOString()
    };
  }

  // Import rates from backup
  importRates(data) {
    if (data.rates) {
      for (const [category, rate] of Object.entries(data.rates)) {
        this.updateCommissionRate(category, rate);
      }
    }
    if (data.defaultRate !== undefined) {
      this.defaultRate = data.defaultRate;
    }
  }
}

export default new CommissionService();
