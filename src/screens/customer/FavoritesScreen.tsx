import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getFallbackUserIdWithTypeDetection } from '../../utils/UserIdUtils';
import ModernHeader from '../../components/shared/ModernHeader';
import { hapticService } from '../../services/HapticService';
import FavoritesService from '../../services/FavoritesService';

const { width: screenWidth } = Dimensions.get('window');

interface FavoritesScreenProps {
  navigation: any;
}

export default function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const theme = getCurrentTheme();

  // State
  const [favorites, setFavorites] = useState<any>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<any>([]);
  const [activeTab, setActiveTab] = useState<any>('all'); // 'all', 'mechanics', 'shops'
  const [searchQuery, setSearchQuery] = useState<any>('');
  const [refreshing, setRefreshing] = useState<any>(false);
  const [isLoading, setIsLoading] = useState<any>(true);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      await FavoritesService.initialize();
      const customerFavorites = FavoritesService.getCustomerFavorites(getFallbackUserIdWithTypeDetection(user?.id, user?.user_type));
      setFavorites(customerFavorites);
    } catch (error) {
      console.error('Failed to load favorites:', error);
      Alert.alert('Error', 'Failed to load favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const filterFavorites = () => {
    let filtered = [...favorites];

    // Filter by type
    if (activeTab === 'mechanics') {
      filtered = filtered.filter(fav => fav.mechanicType === 'freelance');
    } else if (activeTab === 'shops') {
      filtered = filtered.filter(fav => fav.mechanicType === 'shop');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(fav =>
        fav.mechanicName.toLowerCase().includes(query) ||
        fav.specialties.some(specialty => specialty.toLowerCase().includes(query)) ||
        fav.location.toLowerCase().includes(query)
      );
    }

    setFilteredFavorites(filtered);
  };

  // Load favorites on component mount
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Filter favorites when search query or tab changes
  useEffect(() => {
    filterFavorites();
  }, [favorites, activeTab, searchQuery, filterFavorites]);

  // Animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleRemoveFavorite = async (mechanicId) => {
    try {
      await hapticService.buttonPress();
      
      Alert.alert(
        'Remove from Favorites',
        'Are you sure you want to remove this mechanic from your favorites?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              const result = await FavoritesService.removeFromFavorites(
                getFallbackUserIdWithTypeDetection(user?.id, user?.user_type),
                mechanicId
              );
              
              if (result.success) {
                await loadFavorites();
                Alert.alert('Success', 'Removed from favorites');
              } else {
                Alert.alert('Error', result.error || 'Failed to remove from favorites');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      Alert.alert('Error', 'Failed to remove from favorites');
    }
  };

  const handleViewProfile = async (favorite) => {
    try {
      await hapticService.buttonPress();
      navigation.navigate('MechanicProfile', {
        mechanic: favorite.mechanicData,
        mechanicId: favorite.mechanicId
      });
    } catch (error) {
      console.error('Failed to navigate to profile:', error);
    }
  };

  const handleBookService = async (favorite) => {
    try {
      await hapticService.buttonPress();
      navigation.navigate('CreateJob', {
        mechanicId: favorite.mechanicId,
        mechanicName: favorite.mechanicName
      });
    } catch (error) {
      console.error('Failed to navigate to booking:', error);
    }
  };

  const renderFavoriteCard = (favorite) => (
    <Animated.View
      key={favorite.id}
      style={[
        styles.favoriteCard,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.divider,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => handleViewProfile(favorite)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.mechanicInfo}>
            <View style={[styles.avatarContainer, { backgroundColor: theme.primary + '20' }]}>
              <Text style={[styles.avatarText, { color: theme.primary }]}>
                {favorite.mechanicName.charAt(0)}
              </Text>
            </View>
            <View style={styles.mechanicDetails}>
              <Text style={[styles.mechanicName, { color: theme.text }]} numberOfLines={1}>
                {favorite.mechanicName}
              </Text>
              <View style={styles.ratingContainer}>
                <IconFallback name="star" size={14} color={theme.warning} />
                <Text style={[styles.rating, { color: theme.textSecondary }]}>
                  {favorite.rating.toFixed(1)}
                </Text>
                <View style={[styles.typeBadge, { 
                  backgroundColor: favorite.mechanicType === 'shop' ? theme.info + '20' : theme.success + '20'
                }]}>
                  <Text style={[styles.typeText, { 
                    color: favorite.mechanicType === 'shop' ? theme.info : theme.success
                  }]}>
                    {favorite.mechanicType === 'shop' ? 'Shop' : 'Freelance'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.removeButton, { backgroundColor: theme.error + '20' }]}
            onPress={() => handleRemoveFavorite(favorite.mechanicId)}
          >
            <IconFallback name="favorite" size={20} color={theme.error} />
          </TouchableOpacity>
        </View>

        {/* Specialties */}
        <View style={styles.specialtiesContainer}>
          {favorite.specialties.slice(0, 3).map((specialty, index) => (
            <View key={index} style={[styles.specialtyTag, { backgroundColor: theme.surface }]}>
              <Text style={[styles.specialtyText, { color: theme.textSecondary }]}>
                {specialty}
              </Text>
            </View>
          ))}
          {favorite.specialties.length > 3 && (
            <View style={[styles.specialtyTag, { backgroundColor: theme.surface }]}>
              <Text style={[styles.specialtyText, { color: theme.textSecondary }]}>
                +{favorite.specialties.length - 3}
              </Text>
            </View>
          )}
        </View>

        {/* Location */}
        <View style={styles.locationContainer}>
          <IconFallback name="location-on" size={14} color={theme.textSecondary} />
          <Text style={[styles.locationText, { color: theme.textSecondary }]} numberOfLines={1}>
            {favorite.location}
          </Text>
        </View>

        {/* Availability */}
        <View style={styles.availabilityContainer}>
          <View style={[styles.availabilityIndicator, { 
            backgroundColor: favorite.isAvailable ? theme.success + '20' : theme.error + '20'
          }]}>
            <IconFallback 
              name={favorite.isAvailable ? 'check-circle' : 'cancel'} 
              size={12} 
              color={favorite.isAvailable ? theme.success : theme.error} 
            />
            <Text style={[styles.availabilityText, { 
              color: favorite.isAvailable ? theme.success : theme.error
            }]}>
              {favorite.isAvailable ? 'Available' : 'Unavailable'}
            </Text>
          </View>
          <Text style={[styles.addedDate, { color: theme.textSecondary }]}>
            Added {new Date(favorite.addedAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton, { backgroundColor: theme.surface }]}
          onPress={() => handleViewProfile(favorite)}
        >
          <IconFallback name="visibility" size={16} color={theme.textSecondary} />
          <Text style={[styles.actionButtonText, { color: theme.textSecondary }]}>
            View Profile
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.bookButton, { backgroundColor: theme.primary }]}
          onPress={() => handleBookService(favorite)}
          disabled={!favorite.isAvailable}
        >
          <IconFallback name="work" size={16} color="white" />
          <Text style={[styles.actionButtonText, { color: 'white' }]}>
            Book Service
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={[styles.emptyState, { backgroundColor: theme.cardBackground }]}>
      <IconFallback name="favorite-border" size={64} color={theme.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No Favorites Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        {activeTab === 'all' 
          ? "Save your favorite mechanics and shops to see them here."
          : activeTab === 'mechanics'
          ? "Save your favorite freelance mechanics to see them here."
          : "Save your favorite shops to see them here."
        }
      </Text>
      <TouchableOpacity
        style={[styles.exploreButton, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('Explore')}
      >
        <IconFallback name="search" size={20} color="white" />
        <Text style={[styles.exploreButtonText, { color: 'white' }]}>
          Explore Mechanics
        </Text>
      </TouchableOpacity>
    </View>
  );

  const getStats = () => {
    const stats = FavoritesService.getFavoriteStats(user?.id || 'CUSTOMER-20241201-143000-0001');
    return stats;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ModernHeader
          title="My Favorites"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading favorites...
          </Text>
        </View>
      </View>
    );
  }

  const stats = getStats();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      
      <ModernHeader
        title="My Favorites"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightActions={[
          { 
            icon: 'refresh', 
            onPress: handleRefresh 
          },
        ]}
      />

      {/* Stats Bar */}
      {stats.total > 0 && (
        <View style={[styles.statsBar, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.success }]}>{stats.mechanics}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Mechanics</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.info }]}>{stats.shops}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Shops</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.warning }]}>
              {stats.averageRating.toFixed(1)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Avg Rating</Text>
          </View>
        </View>
      )}

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: theme.cardBackground }]}>
        {['all', 'mechanics', 'shops'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              {
                backgroundColor: activeTab === tab ? theme.primary : 'transparent',
                borderBottomColor: activeTab === tab ? theme.primary : 'transparent',
              }
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === tab ? 'white' : theme.textSecondary }
            ]}>
              {tab === 'all' ? 'All' : tab === 'mechanics' ? 'Mechanics' : 'Shops'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      >
        <View style={styles.contentContainer}>
          {filteredFavorites.length === 0 ? (
            renderEmptyState()
          ) : (
            filteredFavorites.map(renderFavoriteCard)
          )}
        </View>
        
        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

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
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  favoriteCard: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mechanicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  mechanicDetails: {
    flex: 1,
  },
  mechanicName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    marginLeft: 4,
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  specialtyTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 6,
  },
  availabilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  availabilityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  addedDate: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  viewButton: {
    // Styled via backgroundColor in component
  },
  bookButton: {
    // Styled via backgroundColor in component
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
    borderRadius: 16,
    marginVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});
