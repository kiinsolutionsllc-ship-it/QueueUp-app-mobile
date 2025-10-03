export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  subcategory?: string;
  tags: string[];
  keywords: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated: Date;
  author: string;
  views: number;
  helpful: number;
  notHelpful: number;
  relatedArticles: string[];
  attachments?: string[];
}

export interface SearchResult {
  article: KnowledgeBaseArticle;
  relevanceScore: number;
  matchedTerms: string[];
  snippet: string;
}

export interface SearchFilters {
  category?: string;
  difficulty?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

class KnowledgeBaseService {
  private static instance: KnowledgeBaseService;
  private articles: KnowledgeBaseArticle[] = [];
  private searchIndex: Map<string, string[]> = new Map();

  static getInstance(): KnowledgeBaseService {
    if (!KnowledgeBaseService.instance) {
      KnowledgeBaseService.instance = new KnowledgeBaseService();
      KnowledgeBaseService.instance.initializeArticles();
    }
    return KnowledgeBaseService.instance;
  }

  private initializeArticles(): void {
    this.articles = [
      {
        id: 'kb-001',
        title: 'How to Create a Service Request',
        content: `Creating a service request is easy! Follow these steps:

1. Open the QueueUp app and tap the "Create Job" button on the home screen
2. Select your vehicle from the list or add a new one
3. Choose the type of service you need (maintenance, repair, inspection, etc.)
4. Describe the issue or service needed in detail
5. Upload photos if relevant (optional but helpful)
6. Set your preferred date and time
7. Review your request and submit

Once submitted, mechanics in your area will be able to see your request and submit bids. You'll receive notifications when bids are placed, and you can compare them before making a selection.`,
        category: 'Getting Started',
        subcategory: 'Service Requests',
        tags: ['service', 'request', 'create', 'job', 'booking'],
        keywords: ['create', 'service', 'request', 'job', 'booking', 'mechanic', 'appointment'],
        difficulty: 'beginner',
        lastUpdated: new Date('2024-01-15'),
        author: 'QueueUp Support Team',
        views: 1250,
        helpful: 89,
        notHelpful: 3,
        relatedArticles: ['kb-002', 'kb-003', 'kb-004'],
      },
      {
        id: 'kb-002',
        title: 'Understanding Bids and Pricing',
        content: `When you create a service request, mechanics will submit bids with their proposed pricing and timeline. Here's what to know:

**Bid Components:**
- Labor cost (hourly rate × estimated hours)
- Parts cost (if applicable)
- Total estimated cost
- Timeline for completion
- Mechanic's experience and ratings

**Comparing Bids:**
- Look at the total cost, not just the lowest price
- Consider the mechanic's ratings and reviews
- Check their experience with your specific issue
- Review their estimated timeline
- Look at their response time and communication

**Making a Decision:**
- You can ask questions before accepting a bid
- Consider the overall value, not just price
- Check if the mechanic is certified for your vehicle type
- Review their availability and scheduling flexibility`,
        category: 'Billing & Payments',
        subcategory: 'Understanding Costs',
        tags: ['bids', 'pricing', 'cost', 'comparison', 'selection'],
        keywords: ['bid', 'price', 'cost', 'pricing', 'comparison', 'mechanic', 'selection'],
        difficulty: 'beginner',
        lastUpdated: new Date('2024-01-20'),
        author: 'QueueUp Support Team',
        views: 980,
        helpful: 76,
        notHelpful: 2,
        relatedArticles: ['kb-001', 'kb-005', 'kb-006'],
      },
      {
        id: 'kb-003',
        title: 'Payment Process and Security',
        content: `QueueUp uses secure payment processing to protect your financial information:

**Payment Methods:**
- Credit/Debit cards (Visa, MasterCard, American Express)
- Digital wallets (Apple Pay, Google Pay)
- Bank transfers (ACH)

**Payment Security:**
- All payments are processed through Stripe, a PCI-compliant payment processor
- Your card details are never stored on our servers
- We use 256-bit SSL encryption for all transactions
- Two-factor authentication for account security

**Payment Flow:**
1. Payment is held in escrow when you accept a bid
2. Funds are released to the mechanic after service completion
3. You have 24 hours to dispute any charges
4. Refunds are processed within 3-5 business days

**Escrow Protection:**
- Your payment is protected until you confirm satisfaction
- Automatic refund if service is not completed as agreed
- Dispute resolution process for any issues`,
        category: 'Billing & Payments',
        subcategory: 'Payment Security',
        tags: ['payment', 'security', 'escrow', 'stripe', 'refund'],
        keywords: ['payment', 'security', 'escrow', 'stripe', 'refund', 'dispute', 'protection'],
        difficulty: 'intermediate',
        lastUpdated: new Date('2024-01-25'),
        author: 'QueueUp Security Team',
        views: 750,
        helpful: 65,
        notHelpful: 1,
        relatedArticles: ['kb-002', 'kb-007', 'kb-008'],
      },
      {
        id: 'kb-004',
        title: 'Finding and Selecting Mechanics',
        content: `QueueUp helps you find qualified mechanics in your area:

**Search Options:**
- Browse by location (nearest first)
- Filter by specialty (engine, brakes, electrical, etc.)
- Sort by rating, price, or availability
- Search by specific services needed

**Mechanic Profiles Include:**
- Certifications and qualifications
- Years of experience
- Customer ratings and reviews
- Service specialties
- Response time and availability
- Sample work photos

**Verification Process:**
- All mechanics are background checked
- License verification required
- Insurance coverage confirmed
- Regular performance monitoring

**Making Your Choice:**
- Read customer reviews carefully
- Check their experience with your vehicle type
- Consider their communication style
- Look at their response time to messages
- Verify their availability matches your needs`,
        category: 'Mechanics & Services',
        subcategory: 'Finding Mechanics',
        tags: ['mechanic', 'search', 'selection', 'profile', 'verification'],
        keywords: ['mechanic', 'search', 'find', 'profile', 'rating', 'review', 'verification'],
        difficulty: 'beginner',
        lastUpdated: new Date('2024-01-18'),
        author: 'QueueUp Support Team',
        views: 1100,
        helpful: 82,
        notHelpful: 4,
        relatedArticles: ['kb-001', 'kb-002', 'kb-009'],
      },
      {
        id: 'kb-005',
        title: 'Cancelling or Rescheduling Services',
        content: `Sometimes you need to change your service appointment:

**Cancellation Policy:**
- Free cancellation up to 24 hours before scheduled service
- 50% fee for cancellations within 24 hours
- Full charge for same-day cancellations
- Emergency cancellations may be waived

**Rescheduling:**
- Free rescheduling up to 24 hours before service
- Small fee for rescheduling within 24 hours
- Subject to mechanic availability
- Multiple reschedules may incur additional fees

**How to Cancel/Reschedule:**
1. Go to your active jobs in the app
2. Select the job you want to modify
3. Tap "Cancel" or "Reschedule"
4. Follow the prompts to complete the action
5. You'll receive confirmation via email and app notification

**Refund Process:**
- Refunds are processed automatically for eligible cancellations
- Processing time: 3-5 business days
- Refunds appear on your original payment method
- Contact support if you don't see your refund within 7 days`,
        category: 'Service Management',
        subcategory: 'Cancellations',
        tags: ['cancel', 'reschedule', 'refund', 'policy', 'appointment'],
        keywords: ['cancel', 'reschedule', 'refund', 'policy', 'appointment', 'change'],
        difficulty: 'beginner',
        lastUpdated: new Date('2024-01-22'),
        author: 'QueueUp Support Team',
        views: 650,
        helpful: 58,
        notHelpful: 2,
        relatedArticles: ['kb-001', 'kb-003', 'kb-010'],
      },
      {
        id: 'kb-006',
        title: 'Rating and Review System',
        content: `After each service, you can rate and review your mechanic:

**Rating Categories:**
- Overall experience (1-5 stars)
- Quality of work
- Communication
- Timeliness
- Cleanliness
- Value for money

**Writing Reviews:**
- Be specific about your experience
- Mention what went well and any areas for improvement
- Include details about the service performed
- Keep reviews constructive and honest
- Reviews help other customers make informed decisions

**Review Guidelines:**
- Reviews must be based on actual service received
- No personal attacks or inappropriate language
- Reviews are moderated for accuracy and appropriateness
- You can edit your review within 48 hours of posting

**How Reviews Help:**
- Help other customers choose the right mechanic
- Provide feedback to mechanics for improvement
- Build trust in the QueueUp community
- Influence mechanic rankings and visibility`,
        category: 'Community & Reviews',
        subcategory: 'Rating System',
        tags: ['rating', 'review', 'feedback', 'mechanic', 'experience'],
        keywords: ['rating', 'review', 'feedback', 'mechanic', 'experience', 'stars'],
        difficulty: 'beginner',
        lastUpdated: new Date('2024-01-19'),
        author: 'QueueUp Community Team',
        views: 420,
        helpful: 35,
        notHelpful: 1,
        relatedArticles: ['kb-004', 'kb-011'],
      },
      {
        id: 'kb-007',
        title: 'Dispute Resolution Process',
        content: `If you're not satisfied with a service, here's how to resolve disputes:

**When to File a Dispute:**
- Service not completed as agreed
- Poor quality workmanship
- Unauthorized charges
- Mechanic didn't show up
- Safety concerns with work performed

**How to File a Dispute:**
1. Go to your completed job in the app
2. Tap "Report Issue" or "File Dispute"
3. Select the type of issue
4. Provide detailed description and photos
5. Submit your dispute

**Dispute Resolution Process:**
- Initial review within 24 hours
- Investigation period: 3-5 business days
- Mediation with mechanic if needed
- Final decision within 10 business days
- Appeal process available

**Possible Outcomes:**
- Full refund if dispute is valid
- Partial refund for partial issues
- Service redo by same or different mechanic
- No action if dispute is unfounded

**Prevention Tips:**
- Communicate clearly with your mechanic
- Take photos before and after service
- Keep all receipts and documentation
- Report issues immediately`,
        category: 'Disputes & Issues',
        subcategory: 'Resolution Process',
        tags: ['dispute', 'resolution', 'refund', 'issue', 'complaint'],
        keywords: ['dispute', 'resolution', 'refund', 'issue', 'complaint', 'problem'],
        difficulty: 'intermediate',
        lastUpdated: new Date('2024-01-23'),
        author: 'QueueUp Legal Team',
        views: 320,
        helpful: 28,
        notHelpful: 0,
        relatedArticles: ['kb-003', 'kb-005', 'kb-012'],
      },
      {
        id: 'kb-008',
        title: 'Account Security and Privacy',
        content: `Protecting your account and personal information is our priority:

**Account Security:**
- Strong password requirements
- Two-factor authentication available
- Regular security updates
- Suspicious activity monitoring
- Secure login sessions

**Data Privacy:**
- We never sell your personal information
- Data is encrypted in transit and at rest
- Limited data sharing with service providers
- You control what information is shared
- Right to data deletion upon request

**Privacy Settings:**
- Control who can see your profile
- Manage notification preferences
- Set location sharing preferences
- Control data usage for analytics
- Download your data anytime

**Best Practices:**
- Use a strong, unique password
- Enable two-factor authentication
- Log out from shared devices
- Keep your app updated
- Report suspicious activity immediately

**Your Rights:**
- Access your personal data
- Correct inaccurate information
- Delete your account and data
- Opt out of marketing communications
- File privacy complaints`,
        category: 'Account & Privacy',
        subcategory: 'Security',
        tags: ['security', 'privacy', 'account', 'data', 'protection'],
        keywords: ['security', 'privacy', 'account', 'data', 'protection', 'password'],
        difficulty: 'intermediate',
        lastUpdated: new Date('2024-01-21'),
        author: 'QueueUp Security Team',
        views: 580,
        helpful: 45,
        notHelpful: 1,
        relatedArticles: ['kb-003', 'kb-013'],
      },
      {
        id: 'kb-009',
        title: 'Vehicle Information Management',
        content: `Managing your vehicle information helps get better service:

**Adding Vehicles:**
- Go to Profile > My Vehicles
- Tap "Add Vehicle"
- Enter VIN or select make/model/year
- Add mileage and service history
- Upload photos if desired

**Vehicle Details Include:**
- Make, model, year, and VIN
- Current mileage
- Service history and records
- Photos of the vehicle
- Special notes or modifications

**Benefits of Complete Vehicle Info:**
- More accurate service estimates
- Better mechanic matching
- Automatic maintenance reminders
- Service history tracking
- Recall notifications

**Privacy Considerations:**
- Vehicle info is only shared with selected mechanics
- You control what information is visible
- Data is encrypted and secure
- You can delete vehicle info anytime

**Maintenance Tracking:**
- Automatic mileage tracking
- Service interval reminders
- Maintenance calendar integration
- Service history documentation
- Cost tracking and analytics`,
        category: 'Vehicle Management',
        subcategory: 'Vehicle Info',
        tags: ['vehicle', 'vin', 'mileage', 'history', 'maintenance'],
        keywords: ['vehicle', 'vin', 'mileage', 'history', 'maintenance', 'car'],
        difficulty: 'beginner',
        lastUpdated: new Date('2024-01-17'),
        author: 'QueueUp Support Team',
        views: 890,
        helpful: 72,
        notHelpful: 3,
        relatedArticles: ['kb-001', 'kb-004', 'kb-014'],
      },
      {
        id: 'kb-010',
        title: 'Mobile App Features and Tips',
        content: `Get the most out of the QueueUp mobile app:

**Key Features:**
- Real-time messaging with mechanics
- Push notifications for updates
- Photo sharing for service issues
- GPS location for accurate matching
- Offline mode for basic functions

**App Tips:**
- Enable push notifications for timely updates
- Use the camera feature to document issues
- Keep your location services enabled
- Regularly update the app for new features
- Use the search function to find specific help

**Troubleshooting:**
- Force close and restart if app is slow
- Check internet connection for messaging
- Clear app cache if experiencing issues
- Update to latest version regularly
- Contact support for persistent problems

**Accessibility Features:**
- Voice-over support for screen readers
- High contrast mode available
- Large text options
- Voice commands for navigation
- Haptic feedback for interactions

**Performance Optimization:**
- Close unused apps to free memory
- Connect to WiFi for large file uploads
- Keep device storage free for photos
- Restart device weekly for best performance`,
        category: 'Technical Support',
        subcategory: 'App Usage',
        tags: ['app', 'mobile', 'features', 'tips', 'troubleshooting'],
        keywords: ['app', 'mobile', 'features', 'tips', 'troubleshooting', 'performance'],
        difficulty: 'beginner',
        lastUpdated: new Date('2024-01-24'),
        author: 'QueueUp Technical Team',
        views: 720,
        helpful: 61,
        notHelpful: 2,
        relatedArticles: ['kb-008', 'kb-015'],
      },
    ];

    this.buildSearchIndex();
  }

  private buildSearchIndex(): void {
    this.searchIndex.clear();
    
    this.articles.forEach(article => {
      const searchableText = [
        article.title,
        article.content,
        article.category,
        article.subcategory || '',
        ...article.tags,
        ...article.keywords,
      ].join(' ').toLowerCase();

      // Simple word tokenization
      const words = searchableText
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);

      words.forEach(word => {
        if (!this.searchIndex.has(word)) {
          this.searchIndex.set(word, []);
        }
        this.searchIndex.get(word)!.push(article.id);
      });
    });
  }

  // Search functionality
  async searchArticles(
    query: string,
    filters?: SearchFilters,
    limit: number = 10
  ): Promise<SearchResult[]> {
    if (!query.trim()) {
      return this.getPopularArticles(limit);
    }

    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    const results: Map<string, SearchResult> = new Map();

    // Find articles that match search terms
    searchTerms.forEach(term => {
      const matchingArticleIds = this.searchIndex.get(term) || [];
      
      matchingArticleIds.forEach(articleId => {
        const article = this.articles.find(a => a.id === articleId);
        if (!article) return;

        // Apply filters
        if (filters) {
          if (filters.category && article.category !== filters.category) return;
          if (filters.difficulty && article.difficulty !== filters.difficulty) return;
          if (filters.tags && !filters.tags.some(tag => article.tags.includes(tag))) return;
          if (filters.dateRange) {
            if (article.lastUpdated < filters.dateRange.start || 
                article.lastUpdated > filters.dateRange.end) return;
          }
        }

        const existingResult = results.get(articleId);
        if (existingResult) {
          existingResult.relevanceScore += 1;
          existingResult.matchedTerms.push(term);
        } else {
          const snippet = this.generateSnippet(article, searchTerms);
          results.set(articleId, {
            article,
            relevanceScore: 1,
            matchedTerms: [term],
            snippet,
          });
        }
      });
    });

    // Sort by relevance score and other factors
    const sortedResults = Array.from(results.values())
      .sort((a, b) => {
        // Primary sort: relevance score
        if (a.relevanceScore !== b.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        
        // Secondary sort: helpfulness ratio
        const aHelpful = a.article.helpful / (a.article.helpful + a.article.notHelpful);
        const bHelpful = b.article.helpful / (b.article.helpful + b.article.notHelpful);
        if (aHelpful !== bHelpful) {
          return bHelpful - aHelpful;
        }
        
        // Tertiary sort: views
        return b.article.views - a.article.views;
      })
      .slice(0, limit);

    return sortedResults;
  }

  private generateSnippet(article: KnowledgeBaseArticle, searchTerms: string[]): string {
    const content = article.content;
    const maxLength = 200;
    
    // Find the first occurrence of any search term
    let bestIndex = -1;
    let bestTerm = '';
    
    searchTerms.forEach(term => {
      const index = content.toLowerCase().indexOf(term);
      if (index !== -1 && (bestIndex === -1 || index < bestIndex)) {
        bestIndex = index;
        bestTerm = term;
      }
    });

    if (bestIndex === -1) {
      return content.substring(0, maxLength) + '...';
    }

    // Extract snippet around the found term
    const start = Math.max(0, bestIndex - 50);
    const end = Math.min(content.length, start + maxLength);
    let snippet = content.substring(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';
    
    return snippet;
  }

  // Get articles by category
  async getArticlesByCategory(category: string): Promise<KnowledgeBaseArticle[]> {
    return this.articles
      .filter(article => article.category === category)
      .sort((a, b) => b.views - a.views);
  }

  // Get popular articles
  async getPopularArticles(limit: number = 5): Promise<SearchResult[]> {
    return this.articles
      .sort((a, b) => {
        const aScore = a.views + (a.helpful * 10) - (a.notHelpful * 5);
        const bScore = b.views + (b.helpful * 10) - (b.notHelpful * 5);
        return bScore - aScore;
      })
      .slice(0, limit)
      .map(article => ({
        article,
        relevanceScore: 0,
        matchedTerms: [],
        snippet: article.content.substring(0, 200) + '...',
      }));
  }

  // Get related articles
  async getRelatedArticles(articleId: string, limit: number = 3): Promise<KnowledgeBaseArticle[]> {
    const article = this.articles.find(a => a.id === articleId);
    if (!article) return [];

    return this.articles
      .filter(a => 
        a.id !== articleId && 
        (a.category === article.category || 
         a.tags.some(tag => article.tags.includes(tag)))
      )
      .sort((a, b) => {
        // Score based on shared tags and category
        const aScore = (a.category === article.category ? 2 : 0) +
                      a.tags.filter(tag => article.tags.includes(tag)).length;
        const bScore = (b.category === article.category ? 2 : 0) +
                      b.tags.filter(tag => article.tags.includes(tag)).length;
        return bScore - aScore;
      })
      .slice(0, limit);
  }

  // Get article by ID
  async getArticle(articleId: string): Promise<KnowledgeBaseArticle | null> {
    const article = this.articles.find(a => a.id === articleId);
    if (article) {
      // Increment view count
      article.views++;
    }
    return article || null;
  }

  // Rate article helpfulness
  async rateArticle(articleId: string, helpful: boolean): Promise<void> {
    const article = this.articles.find(a => a.id === articleId);
    if (article) {
      if (helpful) {
        article.helpful++;
      } else {
        article.notHelpful++;
      }
    }
  }

  // Get all categories
  async getCategories(): Promise<string[]> {
    const categories = new Set(this.articles.map(article => article.category));
    return Array.from(categories).sort();
  }

  // Get all tags
  async getTags(): Promise<string[]> {
    const tags = new Set(this.articles.flatMap(article => article.tags));
    return Array.from(tags).sort();
  }

  // Get search suggestions
  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (!query.trim()) return [];

    const suggestions = new Set<string>();
    const lowerQuery = query.toLowerCase();

    // Add matching article titles
    this.articles.forEach(article => {
      if (article.title.toLowerCase().includes(lowerQuery)) {
        suggestions.add(article.title);
      }
    });

    // Add matching tags
    this.articles.forEach(article => {
      article.tags.forEach(tag => {
        if (tag.toLowerCase().includes(lowerQuery)) {
          suggestions.add(tag);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  }
}

export default KnowledgeBaseService.getInstance();
