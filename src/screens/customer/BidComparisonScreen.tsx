import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextSupabase';
import { useJob } from '../../contexts/SimplifiedJobContext';
import { useVehicle } from '../../contexts/VehicleContext';
import IconFallback from '../../components/shared/IconFallback';
import { FadeIn } from '../../components/shared/Animations';
import BiddingService from '../../services/BiddingService';
import { hapticService } from '../../services/HapticService';
import { formatJobType, formatVehicle } from '../../utils/UnifiedJobFormattingUtils';
import { getFallbackUserIdWithTypeDetection } from '../../utils/UserIdUtils';
import { useCountdown } from '../../hooks';
// JobAssignmentService removed - using UnifiedJobService through SimplifiedJobContext

const BidComparisonScreen = ({ navigation, route }: { navigation: any, route: any }) => {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const { bids, acceptBid, getJobsByCustomer, getJob } = useJob();
  const { vehicles } = useVehicle();
  const theme = getCurrentTheme();

  // Safely extract job from route params, with fallback to getJob if only jobId is provided
  const routeJob = route?.params?.job || null;
  const jobId = route?.params?.jobId || null;
  const job = routeJob || (jobId ? getJob(jobId) : null);
  
  // Debug: Log job data
  console.log('BidComparisonScreen - Route params:', route?.params);
  console.log('BidComparisonScreen - Route job:', routeJob);
  console.log('BidComparisonScreen - Job ID:', jobId);
  console.log('BidComparisonScreen - Final job:', job);
  const [jobsWithBids, setJobsWithBids] = useState<any>([]);
  const [expandedJobs, setExpandedJobs] = useState<any>(new Set());
  const [loading, setLoading] = useState<any>(true);
  const [refreshing, setRefreshing] = useState<any>(false);
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [acceptingBid, setAcceptingBid] = useState<any>(false);
  const [selectedJobId, setSelectedJobId] = useState<any>(null);

  // Helper function to resolve vehicle data (handle both objects and IDs)
  const resolveVehicleData = (vehicle: any) => {
    if (!vehicle) return null;
    
    // If it's already an object with make/model/year, return it
    if (typeof vehicle === 'object' && vehicle.make && vehicle.model) {
      return vehicle;
    }
    
    // If it's a string that looks like a vehicle ID, try to find the full vehicle object
    if (typeof vehicle === 'string' && /^\d{13,}$/.test(vehicle)) {
      const fullVehicle = vehicles.find(v => v.id === vehicle);
      if (fullVehicle) {
        return fullVehicle;
      }
    }
    
    // Return the original vehicle data
    return vehicle;
  };

  const fetchJobsWithBids = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get all customer jobs that can receive bids
      const customerJobs = getJobsByCustomer(getFallbackUserIdWithTypeDetection(user?.id, user?.user_type));
      const jobsThatCanReceiveBids = customerJobs.filter(job => {
        const jobBids = bids.filter(bid => bid.jobId === job.id && bid.status === 'pending');
        // Show jobs that are posted or bidding (can receive bids), regardless of whether they have bids yet
        // Exclude expired jobs
        return (job.status === 'posted' || job.status === 'bidding') && job.cancellationReason !== 'expired';
      });
      
      // Transform jobs with their bids
      const formattedJobs = jobsThatCanReceiveBids.map((job: any) => {
        const jobBids = bids.filter(bid => bid.jobId === job.id && bid.status === 'pending');
        
        const formattedBids = jobBids.map((bid: any) => ({
          id: bid.id,
          job_id: bid.jobId,
          mechanic_id: bid.mechanicId,
          amount: bid.price,
          message: bid.message,
          estimatedDuration: bid.estimatedDuration || 60,
          estimated_start_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          status: bid.status,
          created_at: bid.createdAt,
          mechanic: {
            id: bid.mechanicId,
            name: bid.mechanicName || 'Mechanic Name',
            rating: 4.5,
            review_count: 50,
            profile_image: null,
            specialties: ['General Maintenance', 'Oil Change'],
            location: 'Local Area',
            years_experience: 5,
          }
        }));
        
        return {
          ...job,
          bids: formattedBids,
          bidCount: formattedBids.length
        };
      });
      
      setJobsWithBids(formattedJobs);
      
      // Auto-expand the job that was passed in route params if it exists
      if (job && formattedJobs.some(j => j.id === job.id)) {
        setExpandedJobs(new Set([job.id]));
        setSelectedJobId(job.id); // Also set as selected
      }
    } catch (error) {
      console.error('Error fetching jobs with bids:', error);
      Alert.alert('Error', 'Failed to load jobs with bids. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, getJobsByCustomer, job]);

  useEffect(() => {
    fetchJobsWithBids();
  }, [fetchJobsWithBids]);

  // Refresh bids when JobContext bids change
  useEffect(() => {
    fetchJobsWithBids();
  }, [bids, fetchJobsWithBids]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchJobsWithBids();
    setRefreshing(false);
  };

  const toggleJobExpansion = (jobId: any) => {
    const newExpandedJobs = new Set(expandedJobs);
    if (newExpandedJobs.has(jobId)) {
      newExpandedJobs.delete(jobId);
    } else {
      newExpandedJobs.add(jobId);
    }
    setExpandedJobs(newExpandedJobs);
    setSelectedJobId(jobId); // Set the selected job ID
    hapticService.light();
  };

  const handleSelectBid = (bid: any) => {
    setSelectedBid(bid);
    hapticService.medium();
  };

  const handleAcceptBid = async (bid: any) => {
    Alert.alert(
      'Accept Bid',
      `Are you sure you want to accept ${bid.mechanic.name}'s bid for $${bid.amount}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          style: 'default',
          onPress: () => processBidAcceptance(bid),
        },
      ]
    );
  };

  const handleMessageMechanic = (bid: any) => {
    hapticService.light();
    try {
      // Navigate to messaging system
      navigation.navigate('Messaging', {
        conversationId: null,
        targetUserId: bid.mechanic_id,
        targetUserName: bid.mechanic.name,
        jobId: bid.job_id,
        currentUserId: getFallbackUserIdWithTypeDetection(user?.id, user?.user_type),
        currentUserName: user?.name || 'Customer'
      });
    } catch (error) {
      console.error('Error navigating to messaging:', error);
      Alert.alert('Error', 'Failed to open messaging. Please try again.');
    }
  };

  const processBidAcceptance = async (bid: any) => {
    try {
      setAcceptingBid(true);
      await hapticService.heavy();

      // Accept the bid using UnifiedJobService
      const result = await acceptBid(bid.id);
      
        if (result.success) {
        
        // Show success and navigate to scheduling
        Alert.alert(
          'Bid Accepted!',
          'Great! Now let\'s schedule the work. You can set the date and time for the service.',
          [
            {
              text: 'Schedule Work',
              onPress: () => {
                // Navigate to scheduling screen
                  navigation.navigate('Scheduling', { job: job || {}, bid });
              },
            },
          ]
        );
      } else {
        throw new Error(result.error || 'Failed to accept bid');
      }
    } catch (error) {
      console.error('Error accepting bid:', error);
      Alert.alert('Error', 'Failed to accept bid. Please try again.');
    } finally {
      setAcceptingBid(false);
    }
  };

  const formatDuration = (minutes: any) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderBidCard = (bid: any, allBids: any) => {
    const isSelected = selectedBid?.id === bid.id;
    const isLowestBid = bid.amount === Math.min(...allBids.map((b: any) => b.amount));

    return (
      <TouchableOpacity
        key={bid.id}
        style={[
          styles.bidCard,
          {
            backgroundColor: isSelected ? theme.primary + '10' : theme.surface,
            borderColor: isSelected ? theme.primary : theme.divider,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => handleSelectBid(bid)}
        activeOpacity={0.7}
      >
        <View style={styles.bidHeader}>
          <View style={styles.mechanicInfo}>
            <View style={[styles.mechanicAvatar, { backgroundColor: theme.primary + '20' }]}>
              <IconFallback name="person" size={24} color={theme.primary} />
            </View>
            <View style={styles.mechanicDetails}>
              <Text style={[styles.mechanicName, { color: theme.text }]}>
                {bid.mechanic.name}
              </Text>
              <View style={styles.ratingContainer}>
                <IconFallback name="star" size={14} color="#FFD700" />
                <Text style={[styles.rating, { color: theme.textSecondary }]}>
                  {bid.mechanic.rating} ({bid.mechanic.review_count} reviews)
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.bidAmount}>
            <Text style={[styles.amount, { color: theme.primary }]}>
              ${bid.amount}
            </Text>
            {isLowestBid && (
              <View style={[styles.lowestBidBadge, { backgroundColor: theme.success }]}>
                <Text style={[styles.lowestBidText, { color: theme.onSuccess }]}>
                  Lowest
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.bidDetails}>
          <View style={styles.detailRow}>
            <IconFallback name="schedule" size={16} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.textSecondary }]}>
              {formatDuration(bid.estimatedDuration)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <IconFallback name="event" size={16} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.textSecondary }]}>
              Available {formatDate(bid.estimated_start_date)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <IconFallback name="location-on" size={16} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.textSecondary }]}>
              {bid.mechanic.location}
            </Text>
          </View>
        </View>

        <View style={styles.bidMessage}>
          <Text style={[styles.messageText, { color: theme.text }]}>
            "{bid.message}"
          </Text>
        </View>

        <View style={styles.mechanicSpecialties}>
          <Text style={[styles.specialtiesLabel, { color: theme.textSecondary }]}>
            Specialties:
          </Text>
          <View style={styles.specialtiesList}>
            {bid.mechanic.specialties.map((specialty: any, index: any) => (
              <View
                key={index}
                style={[styles.specialtyTag, { backgroundColor: theme.primary + '20' }]}
              >
                <Text style={[styles.specialtyText, { color: theme.primary }]}>
                  {specialty}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {isSelected && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.messageButton,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.primary,
                  borderWidth: 1,
                },
              ]}
              onPress={() => handleMessageMechanic(bid)}
            >
              <IconFallback name="message" size={16} color={theme.primary} />
              <Text style={[styles.messageButtonText, { color: theme.primary }]}>
                Message
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.acceptButton,
                {
                  backgroundColor: acceptingBid ? theme.divider : theme.primary,
                  opacity: acceptingBid ? 0.6 : 1,
                },
              ]}
              onPress={() => handleAcceptBid(bid)}
              disabled={acceptingBid}
            >
              <Text style={[styles.acceptButtonText, { color: theme.onPrimary }]}>
                {acceptingBid ? 'Processing...' : 'Accept This Bid'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderJobAccordion = (job: any) => {
    const isExpanded = expandedJobs.has(job.id);
    const isSelected = selectedJobId === job.id;
    const lowestBid = job.bids.length > 0 ? Math.min(...job.bids.map((b: any) => b.amount)) : 0;
    const highestBid = job.bids.length > 0 ? Math.max(...job.bids.map((b: any) => b.amount)) : 0;
    const isExpired = job.cancellationReason === 'expired';
    
    // Calculate expiration time for countdown
    const expirationTime = (() => {
      if (!job.createdAt) return null;
      const createdAtMs = new Date(job.createdAt).getTime();
      const twentyFourHoursMs = 24 * 60 * 60 * 1000;
      return createdAtMs + twentyFourHoursMs;
    })();
    
    // Calculate if job is expiring (without using hook inside render function)
    const now = Date.now();
    const isExpiring = expirationTime && (expirationTime - now) <= (2 * 60 * 60 * 1000) && (expirationTime - now) > 0;

    return (
      <View key={job.id} style={[
        styles.jobAccordion, 
        { 
          backgroundColor: isSelected ? theme.primary + '08' : theme.surface, 
          borderColor: isSelected ? theme.primary : (isExpired ? theme.error : (isExpiring ? theme.warning : theme.divider)),
          borderWidth: isSelected ? 3 : (isExpired || isExpiring ? 2 : 1),
          shadowColor: isSelected ? theme.primary : '#000',
          shadowOffset: isSelected ? { width: 0, height: 4 } : { width: 0, height: 2 },
          shadowOpacity: isSelected ? 0.15 : 0.1,
          shadowRadius: isSelected ? 8 : 4,
          elevation: isSelected ? 6 : 2,
          opacity: isExpired ? 0.7 : (isExpiring ? 0.9 : 1),
        }
      ]}>
        {/* Job Header - Always Visible */}
        <TouchableOpacity
          style={styles.jobHeader}
          onPress={() => toggleJobExpansion(job.id)}
          activeOpacity={0.7}
        >
          <View style={styles.jobHeaderContent}>
            <View style={styles.jobTitleContainer}>
              <View style={styles.jobTitleRow}>
                <Text style={[styles.jobTitle, { color: theme.text }]}>
                  {formatJobType(job.category)} - {formatJobType(job.subcategory?.name || job.subcategory || 'General')}
                </Text>
                {isExpired && (
                  <View style={[styles.expiredBadge, { backgroundColor: theme.error }]}>
                    <IconFallback name="schedule" size={12} color="white" />
                    <Text style={styles.expiredBadgeText}>Expired</Text>
                  </View>
                )}
                {isExpiring && !isExpired && (
                  <View style={[styles.expiringBadge, { backgroundColor: theme.warning }]}>
                    <IconFallback name="warning" size={12} color="white" />
                    <Text style={styles.expiringBadgeText}>
                      Expiring Soon
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.jobDescription, { color: theme.textSecondary }]}>
                {job.description}
              </Text>
              {isExpired && (
                <Text style={[styles.expiredMessage, { color: theme.error }]}>
                  This job expired 24 hours after posting
                </Text>
              )}
              {isExpiring && !isExpired && (
                <Text style={[styles.expiringMessage, { color: theme.warning }]}>
                  This job expires soon
                </Text>
              )}
            </View>
            
            <View style={styles.jobStats}>
              <View style={styles.bidCountContainer}>
                <Text style={[styles.bidCount, { color: theme.primary }]}>
                  {job.bidCount} bid{job.bidCount !== 1 ? 's' : ''}
                </Text>
              </View>
              
              {job.bids.length > 0 && (
                <View style={styles.priceRangeContainer}>
                  <Text style={[styles.priceRange, { color: theme.textSecondary }]}>
                    ${lowestBid} - ${highestBid}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.expandIconContainer}>
            <IconFallback 
              name="expand-more" 
              size={24} 
              color={theme.textSecondary} 
            />
          </View>
        </TouchableOpacity>

        {/* Job Details - Always Visible */}
        <View style={styles.jobDetails}>
          <View style={styles.jobDetailRow}>
            <IconFallback name="directions-car" size={16} color={theme.textSecondary} />
            <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>
              {(() => {
                const resolvedVehicle = resolveVehicleData(job.vehicle);
                const formatted = formatVehicle(resolvedVehicle);
                return formatted || 'Vehicle information not available';
              })()}
            </Text>
          </View>
          <View style={styles.jobDetailRow}>
            <IconFallback name="location-on" size={16} color={theme.textSecondary} />
            <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>
              {job.serviceType === 'mobile' ? 'Mobile Service' : 'Shop Service'}
            </Text>
          </View>
          <View style={styles.jobDetailRow}>
            <IconFallback name="schedule" size={16} color={theme.textSecondary} />
            <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>
              Posted {new Date(job.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Bids List - Expandable */}
        {isExpanded && (
          <View style={styles.bidsList}>
            {job.bids.length === 0 ? (
              <View style={styles.emptyBidsState}>
                <IconFallback name="gavel" size={32} color={theme.textSecondary} />
                <Text style={[styles.emptyBidsText, { color: theme.textSecondary }]}>
                  No bids yet
                </Text>
              </View>
            ) : (
              job.bids.map((bid: any, index: any) => (
                <FadeIn key={bid.id} delay={index * 100}>
                  {renderBidCard(bid, job.bids)}
                </FadeIn>
              ))
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={theme.statusBarStyle as any} backgroundColor={theme.background} />
        <View style={styles.loadingContainer}>
          <IconFallback name="hourglass-empty" size={48} color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading bids...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBarStyle as any} backgroundColor={theme.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <IconFallback name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Compare Bids
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {jobsWithBids.length} job{jobsWithBids.length !== 1 ? 's' : ''} available for bidding
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Jobs with Bids */}
        <FadeIn delay={100}>
          <View style={styles.jobsContainer}>
            {jobsWithBids.length === 0 ? (
              <View style={styles.emptyState}>
                <IconFallback name="gavel" size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                  No Jobs Available for Bidding
                </Text>
                <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                  Create a job to start receiving bids from mechanics!
                </Text>
              </View>
            ) : (
              jobsWithBids.map((job: any, index: any) => (
                <FadeIn key={job.id} delay={200 + index * 100}>
                  {renderJobAccordion(job)}
                </FadeIn>
              ))
            )}
          </View>
        </FadeIn>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  jobsContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  jobAccordion: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  jobHeaderContent: {
    flex: 1,
    marginRight: 12,
  },
  jobTitleContainer: {
    marginBottom: 8,
  },
  jobTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  expiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  expiredBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  expiredMessage: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  expiringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  expiringBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  expiringMessage: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  jobDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  jobStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bidCountContainer: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bidCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceRangeContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceRange: {
    fontSize: 12,
    fontWeight: '500',
  },
  expandIconContainer: {
    padding: 4,
  },
  jobDetails: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 6,
  },
  jobDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobDetailText: {
    fontSize: 13,
    marginLeft: 8,
  },
  bidsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  emptyBidsState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyBidsText: {
    fontSize: 14,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  bidCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mechanicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mechanicAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mechanicDetails: {
    flex: 1,
  },
  mechanicName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 13,
    marginLeft: 4,
  },
  bidAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  lowestBidBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  lowestBidText: {
    fontSize: 10,
    fontWeight: '600',
  },
  bidDetails: {
    marginBottom: 12,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    marginLeft: 8,
  },
  bidMessage: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  mechanicSpecialties: {
    marginBottom: 16,
  },
  specialtiesLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  specialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specialtyTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  specialtyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default BidComparisonScreen;

