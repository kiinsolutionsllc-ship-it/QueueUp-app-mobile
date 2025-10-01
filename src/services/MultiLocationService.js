import AsyncStorage from '@react-native-async-storage/async-storage';
import uniqueIdGenerator from '../utils/UniqueIdGenerator';
import { MOCK_MODE } from '../config/payment';

/**
 * MULTI-LOCATION SERVICE
 * 
 * Multi-location management for Enterprise tier
 * Features:
 * - Location-based job routing
 * - Team member assignments
 * - Consolidated reporting
 * - Territory management
 * - Location-specific settings
 * - Cross-location analytics
 */

class MultiLocationService {
  constructor() {
    this.locations = [];
    this.locationTeams = [];
    this.locationSettings = [];
    this.territoryAssignments = [];
    this.crossLocationAnalytics = [];
    this.initialized = false;
    
    // Storage keys
    this.LOCATIONS_KEY = 'multi_location_locations';
    this.TEAMS_KEY = 'multi_location_teams';
    this.SETTINGS_KEY = 'multi_location_settings';
    this.TERRITORIES_KEY = 'multi_location_territories';
    this.ANALYTICS_KEY = 'multi_location_analytics';
    
    this.initialize();
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      await this.loadData();
      this.initialized = true;
      console.log('MultiLocationService: Initialized successfully');
    } catch (error) {
      console.error('MultiLocationService: Error initializing:', error);
    }
  }

  async loadData() {
    try {
      const [locations, teams, settings, territories, analytics] = await Promise.all([
        AsyncStorage.getItem(this.LOCATIONS_KEY),
        AsyncStorage.getItem(this.TEAMS_KEY),
        AsyncStorage.getItem(this.SETTINGS_KEY),
        AsyncStorage.getItem(this.TERRITORIES_KEY),
        AsyncStorage.getItem(this.ANALYTICS_KEY)
      ]);

      this.locations = locations ? JSON.parse(locations) : [];
      this.locationTeams = teams ? JSON.parse(teams) : [];
      this.locationSettings = settings ? JSON.parse(settings) : [];
      this.territoryAssignments = territories ? JSON.parse(territories) : [];
      this.crossLocationAnalytics = analytics ? JSON.parse(analytics) : [];
    } catch (error) {
      console.error('MultiLocationService: Error loading data:', error);
    }
  }

  async saveData() {
    try {
      await Promise.all([
        AsyncStorage.setItem(this.LOCATIONS_KEY, JSON.stringify(this.locations)),
        AsyncStorage.setItem(this.TEAMS_KEY, JSON.stringify(this.locationTeams)),
        AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.locationSettings)),
        AsyncStorage.setItem(this.TERRITORIES_KEY, JSON.stringify(this.territoryAssignments)),
        AsyncStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(this.crossLocationAnalytics))
      ]);
    } catch (error) {
      console.error('MultiLocationService: Error saving data:', error);
    }
  }

  // ========================================
  // LOCATION MANAGEMENT
  // ========================================

  async createLocation(userId, locationData) {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const location = {
          id: uniqueIdGenerator.generateId('location'),
          user_id: userId,
          name: locationData.name,
          type: locationData.type || 'service_center', // service_center, mobile_unit, satellite_office
          address: {
            street: locationData.street,
            city: locationData.city,
            state: locationData.state,
            zip_code: locationData.zip_code,
            country: locationData.country || 'US'
          },
          coordinates: {
            latitude: locationData.latitude,
            longitude: locationData.longitude
          },
          contact_info: {
            phone: locationData.phone,
            email: locationData.email,
            fax: locationData.fax || ''
          },
          operating_hours: {
            monday: locationData.monday_hours || { open: '08:00', close: '18:00', closed: false },
            tuesday: locationData.tuesday_hours || { open: '08:00', close: '18:00', closed: false },
            wednesday: locationData.wednesday_hours || { open: '08:00', close: '18:00', closed: false },
            thursday: locationData.thursday_hours || { open: '08:00', close: '18:00', closed: false },
            friday: locationData.friday_hours || { open: '08:00', close: '18:00', closed: false },
            saturday: locationData.saturday_hours || { open: '09:00', close: '17:00', closed: false },
            sunday: locationData.sunday_hours || { open: '10:00', close: '16:00', closed: true }
          },
          services_offered: locationData.services_offered || [],
          capacity: {
            max_concurrent_jobs: locationData.max_concurrent_jobs || 10,
            max_daily_jobs: locationData.max_daily_jobs || 50,
            parking_spaces: locationData.parking_spaces || 20
          },
          status: 'active', // active, inactive, maintenance, closed
          is_primary: locationData.is_primary || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        this.locations.push(location);
        
        // Create default settings for the location
        await this.createLocationSettings(location.id, {
          auto_assign_jobs: true,
          allow_cross_location_booking: true,
          require_manager_approval: false,
          default_service_radius: 25, // miles
          emergency_contact: locationData.emergency_contact || ''
        });

        await this.saveData();
        return { success: true, location };
      }
    } catch (error) {
      console.error('MultiLocationService: Error creating location:', error);
      return { success: false, error: error.message };
    }
  }

  async updateLocation(locationId, updateData) {
    try {
      const location = this.locations.find(l => l.id === locationId);
      if (!location) {
        return { success: false, error: 'Location not found' };
      }

      // Update location data
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          if (typeof updateData[key] === 'object' && !Array.isArray(updateData[key])) {
            location[key] = { ...location[key], ...updateData[key] };
          } else {
            location[key] = updateData[key];
          }
        }
      });

      location.updated_at = new Date().toISOString();
      await this.saveData();
      return { success: true, location };
    } catch (error) {
      console.error('MultiLocationService: Error updating location:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // TEAM MANAGEMENT
  // ========================================

  async assignTeamMember(locationId, teamMemberData) {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 600));
        
        const teamAssignment = {
          id: uniqueIdGenerator.generateId('team'),
          location_id: locationId,
          user_id: teamMemberData.user_id,
          role: teamMemberData.role, // manager, technician, receptionist, supervisor
          permissions: teamMemberData.permissions || [],
          schedule: teamMemberData.schedule || {},
          skills: teamMemberData.skills || [],
          certifications: teamMemberData.certifications || [],
          hourly_rate: teamMemberData.hourly_rate || 0,
          commission_rate: teamMemberData.commission_rate || 0,
          status: 'active', // active, inactive, on_leave, terminated
          start_date: teamMemberData.start_date || new Date().toISOString(),
          end_date: teamMemberData.end_date || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        this.locationTeams.push(teamAssignment);
        await this.saveData();
        return { success: true, teamAssignment };
      }
    } catch (error) {
      console.error('MultiLocationService: Error assigning team member:', error);
      return { success: false, error: error.message };
    }
  }

  async updateTeamMemberAssignment(assignmentId, updateData) {
    try {
      const assignment = this.locationTeams.find(t => t.id === assignmentId);
      if (!assignment) {
        return { success: false, error: 'Team assignment not found' };
      }

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          assignment[key] = updateData[key];
        }
      });

      assignment.updated_at = new Date().toISOString();
      await this.saveData();
      return { success: true, assignment };
    } catch (error) {
      console.error('MultiLocationService: Error updating team member assignment:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // LOCATION SETTINGS
  // ========================================

  async createLocationSettings(locationId, settingsData) {
    try {
      if (MOCK_MODE) {
        const settings = {
          id: uniqueIdGenerator.generateId('settings'),
          location_id: locationId,
          auto_assign_jobs: settingsData.auto_assign_jobs || true,
          allow_cross_location_booking: settingsData.allow_cross_location_booking || true,
          require_manager_approval: settingsData.require_manager_approval || false,
          default_service_radius: settingsData.default_service_radius || 25,
          emergency_contact: settingsData.emergency_contact || '',
          notification_preferences: {
            job_assignments: true,
            schedule_changes: true,
            emergency_alerts: true,
            daily_reports: true
          },
          business_rules: {
            max_job_duration: settingsData.max_job_duration || 480, // minutes
            overtime_threshold: settingsData.overtime_threshold || 40, // hours
            break_requirements: settingsData.break_requirements || true
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        this.locationSettings.push(settings);
        await this.saveData();
        return { success: true, settings };
      }
    } catch (error) {
      console.error('MultiLocationService: Error creating location settings:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // TERRITORY MANAGEMENT
  // ========================================

  async createTerritory(userId, territoryData) {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 700));
        
        const territory = {
          id: uniqueIdGenerator.generateId('territory'),
          user_id: userId,
          name: territoryData.name,
          description: territoryData.description || '',
          boundaries: territoryData.boundaries || [], // Array of coordinate points
          assigned_locations: territoryData.assigned_locations || [],
          assigned_team_members: territoryData.assigned_team_members || [],
          priority: territoryData.priority || 'medium', // low, medium, high
          service_types: territoryData.service_types || [],
          customer_segments: territoryData.customer_segments || [],
          performance_targets: {
            daily_jobs: territoryData.daily_jobs_target || 20,
            customer_satisfaction: territoryData.satisfaction_target || 4.5,
            revenue_target: territoryData.revenue_target || 5000
          },
          status: 'active', // active, inactive, under_review
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        this.territoryAssignments.push(territory);
        await this.saveData();
        return { success: true, territory };
      }
    } catch (error) {
      console.error('MultiLocationService: Error creating territory:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // JOB ROUTING
  // ========================================

  async routeJobToLocation(jobId, customerLocation, preferences = {}) {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find the best location for the job
        const availableLocations = this.locations.filter(l => 
          l.status === 'active' && 
          this.isLocationInRange(l, customerLocation, preferences.max_distance || 50)
        );

        if (availableLocations.length === 0) {
          return { success: false, error: 'No available locations within range' };
        }

        // Score locations based on various factors
        const scoredLocations = availableLocations.map(location => ({
          location,
          score: this.calculateLocationScore(location, customerLocation, preferences)
        }));

        // Sort by score and select the best one
        scoredLocations.sort((a, b) => b.score - a.score);
        const selectedLocation = scoredLocations[0].location;

        const routing = {
          id: uniqueIdGenerator.generateId('routing'),
          job_id: jobId,
          customer_location: customerLocation,
          selected_location_id: selectedLocation.id,
          routing_reason: this.getRoutingReason(selectedLocation, customerLocation),
          alternative_locations: scoredLocations.slice(1, 4).map(s => ({
            location_id: s.location.id,
            score: s.score,
            distance: this.calculateDistance(customerLocation, s.location.coordinates)
          })),
          estimated_travel_time: this.calculateTravelTime(customerLocation, selectedLocation.coordinates),
          created_at: new Date().toISOString()
        };

        await this.saveData();
        return { success: true, routing };
      }
    } catch (error) {
      console.error('MultiLocationService: Error routing job to location:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // CROSS-LOCATION ANALYTICS
  // ========================================

  async generateCrossLocationAnalytics(userId, timeframe = '30_days') {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const userLocations = this.locations.filter(l => l.user_id === userId);
        const now = new Date();
        const daysBack = timeframe === '7_days' ? 7 : timeframe === '30_days' ? 30 : 90;
        const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

        const analytics = {
          id: uniqueIdGenerator.generateId('analytics'),
          user_id: userId,
          timeframe: timeframe,
          generated_at: new Date().toISOString(),
          location_performance: userLocations.map(location => ({
            location_id: location.id,
            location_name: location.name,
            total_jobs: Math.floor(Math.random() * 100) + 20,
            completed_jobs: Math.floor(Math.random() * 80) + 15,
            revenue: Math.floor(Math.random() * 50000) + 10000,
            average_rating: 4.2 + Math.random() * 0.6,
            utilization_rate: 0.6 + Math.random() * 0.3,
            customer_satisfaction: 4.0 + Math.random() * 0.8
          })),
          cross_location_insights: {
            best_performing_location: userLocations[0]?.name || 'N/A',
            most_utilized_location: userLocations[0]?.name || 'N/A',
            highest_revenue_location: userLocations[0]?.name || 'N/A',
            average_utilization: 0.7 + Math.random() * 0.2,
            total_cross_location_jobs: Math.floor(Math.random() * 50) + 10
          },
          recommendations: [
            'Consider expanding capacity at high-utilization locations',
            'Implement load balancing between locations',
            'Optimize territory assignments based on performance data',
            'Cross-train team members for better coverage'
          ],
          trends: {
            utilization_trend: 'increasing',
            revenue_trend: 'stable',
            satisfaction_trend: 'improving',
            efficiency_trend: 'stable'
          }
        };

        this.crossLocationAnalytics.push(analytics);
        await this.saveData();
        return { success: true, analytics };
      }
    } catch (error) {
      console.error('MultiLocationService: Error generating cross-location analytics:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  isLocationInRange(location, customerLocation, maxDistance) {
    const distance = this.calculateDistance(customerLocation, location.coordinates);
    return distance <= maxDistance;
  }

  calculateDistance(point1, point2) {
    // Simple distance calculation (in a real app, you'd use a proper geolocation library)
    const lat1 = point1.latitude;
    const lon1 = point1.longitude;
    const lat2 = point2.latitude;
    const lon2 = point2.longitude;

    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  calculateLocationScore(location, customerLocation, preferences) {
    let score = 0;

    // Distance score (closer is better)
    const distance = this.calculateDistance(customerLocation, location.coordinates);
    score += Math.max(0, 100 - distance * 2);

    // Capacity score
    const utilization = Math.random(); // Mock utilization
    score += (1 - utilization) * 50;

    // Service availability score
    if (preferences.service_types) {
      const matchingServices = preferences.service_types.filter(service => 
        location.services_offered.includes(service)
      );
      score += (matchingServices.length / preferences.service_types.length) * 30;
    }

    // Operating hours score
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const todayHours = location.operating_hours[currentDay];
    
    if (!todayHours.closed) {
      const openHour = parseInt(todayHours.open.split(':')[0]);
      const closeHour = parseInt(todayHours.close.split(':')[0]);
      if (currentHour >= openHour && currentHour < closeHour) {
        score += 20;
      }
    }

    return score;
  }

  calculateTravelTime(from, to) {
    const distance = this.calculateDistance(from, to);
    // Assume average speed of 30 mph in city traffic
    return Math.round((distance / 30) * 60); // minutes
  }

  getRoutingReason(location, customerLocation) {
    const distance = this.calculateDistance(customerLocation, location.coordinates);
    if (distance < 5) return 'Closest location';
    if (distance < 15) return 'Within preferred range';
    if (distance < 25) return 'Best available option';
    return 'Only available location';
  }

  getUserLocations(userId) {
    return this.locations.filter(l => l.user_id === userId);
  }

  getLocationTeam(locationId) {
    return this.locationTeams.filter(t => t.location_id === locationId && t.status === 'active');
  }

  getLocationSettings(locationId) {
    return this.locationSettings.find(s => s.location_id === locationId);
  }

  getUserTerritories(userId) {
    return this.territoryAssignments.filter(t => t.user_id === userId);
  }

  getLocationById(locationId) {
    return this.locations.find(l => l.id === locationId);
  }

  clearAllData() {
    this.locations = [];
    this.locationTeams = [];
    this.locationSettings = [];
    this.territoryAssignments = [];
    this.crossLocationAnalytics = [];
    return this.saveData();
  }
}

// Export singleton instance
const multiLocationService = new MultiLocationService();
export default multiLocationService;
