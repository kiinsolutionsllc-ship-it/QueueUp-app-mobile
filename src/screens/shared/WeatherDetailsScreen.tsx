import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { FadeIn } from '../../components/shared/Animations';


interface WeatherDetailsScreenProps {
  navigation: any;
}
export default function WeatherDetailsScreen({ navigation }: WeatherDetailsScreenProps) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const responsive = useResponsive();

  // Mock weather data
  const weatherData = {
    temperature: 72,
    condition: 'sunny',
    humidity: 45,
    windSpeed: 8,
    feelsLike: 75,
    uvIndex: 6,
    visibility: 10,
    pressure: 30.15,
    sunrise: '6:45 AM',
    sunset: '7:30 PM',
    hourly: [
      { time: 'Now', temp: 72, condition: 'sunny' },
      { time: '1PM', temp: 75, condition: 'sunny' },
      { time: '2PM', temp: 78, condition: 'partly-cloudy' },
      { time: '3PM', temp: 76, condition: 'partly-cloudy' },
      { time: '4PM', temp: 74, condition: 'cloudy' },
      { time: '5PM', temp: 72, condition: 'cloudy' },
    ],
  };

  const getWeatherIcon = (condition: any) => {
    switch (condition) {
      case 'sunny': return 'wb-sunny';
      case 'partly-cloudy': return 'partly-cloudy-day';
      case 'cloudy': return 'cloud';
      case 'rainy': return 'grain';
      case 'stormy': return 'thunderstorm';
      default: return 'wb-sunny';
    }
  };

  const getWeatherColor = (condition: any) => {
    switch (condition) {
      case 'sunny': return theme.warning;
      case 'partly-cloudy': return theme.textSecondary;
      case 'cloudy': return theme.textSecondary;
      case 'rainy': return theme.info;
      case 'stormy': return theme.error;
      default: return theme.warning;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={theme.text === '#F8FAFC' ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.background}
      />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <IconFallback name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Weather</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Current conditions
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Weather */}
        <FadeIn delay={200}>
          <View style={[styles.currentWeatherCard, { backgroundColor: theme.surface }]}>
            <View style={styles.currentWeatherHeader}>
              <IconFallback 
                name={getWeatherIcon(weatherData.condition)} 
                size={48} 
                color={getWeatherColor(weatherData.condition)} 
              />
              <View style={styles.currentWeatherInfo}>
                <Text style={[styles.temperature, { color: theme.text }]}>
                  {weatherData.temperature}°
                </Text>
                <Text style={[styles.condition, { color: theme.textSecondary }]}>
                  {weatherData.condition.charAt(0).toUpperCase() + weatherData.condition.slice(1)}
                </Text>
                <Text style={[styles.feelsLike, { color: theme.textSecondary }]}>
                  Feels like {weatherData.feelsLike}°
                </Text>
              </View>
            </View>
          </View>
        </FadeIn>

        {/* Weather Details */}
        <FadeIn delay={400}>
          <View style={styles.weatherDetails}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Details</Text>
            
            <View style={styles.detailsGrid}>
              <View style={[styles.detailItem, { backgroundColor: theme.surface }]}>
                <IconFallback name="opacity" size={20} color={theme.info} />
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {weatherData.humidity}%
                </Text>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                  Humidity
                </Text>
              </View>
              
              <View style={[styles.detailItem, { backgroundColor: theme.surface }]}>
                <IconFallback name="air" size={20} color={theme.textSecondary} />
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {weatherData.windSpeed} mph
                </Text>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                  Wind Speed
                </Text>
              </View>
              
              <View style={[styles.detailItem, { backgroundColor: theme.surface }]}>
                <IconFallback name="visibility" size={20} color={theme.success} />
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {weatherData.visibility} mi
                </Text>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                  Visibility
                </Text>
              </View>
              
              <View style={[styles.detailItem, { backgroundColor: theme.surface }]}>
                <IconFallback name="compress" size={20} color={theme.warning} />
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {weatherData.pressure}"
                </Text>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                  Pressure
                </Text>
              </View>
            </View>
          </View>
        </FadeIn>

        {/* Hourly Forecast */}
        <FadeIn delay={600}>
          <View style={styles.hourlyForecast}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Hourly Forecast</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hourlyContent}
            >
              {weatherData.hourly.map((hour, index) => (
                <View key={index} style={[styles.hourlyItem, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.hourlyTime, { color: theme.textSecondary }]}>
                    {hour.time}
                  </Text>
                  <IconFallback 
                    name={getWeatherIcon(hour.condition)} 
                    size={24} 
                    color={getWeatherColor(hour.condition)} 
                  />
                  <Text style={[styles.hourlyTemp, { color: theme.text }]}>
                    {hour.temp}°
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </FadeIn>

        {/* Sunrise/Sunset */}
        <FadeIn delay={800}>
          <View style={[styles.sunTimes, { backgroundColor: theme.surface }]}>
            <View style={styles.sunTimeItem}>
              <IconFallback name="wb-sunny" size={24} color={theme.warning} />
              <Text style={[styles.sunTimeLabel, { color: theme.textSecondary }]}>
                Sunrise
              </Text>
              <Text style={[styles.sunTimeValue, { color: theme.text }]}>
                {weatherData.sunrise}
              </Text>
            </View>
            
            <View style={styles.sunTimeItem}>
              <IconFallback name="nightlight-round" size={24} color={theme.info} />
              <Text style={[styles.sunTimeLabel, { color: theme.textSecondary }]}>
                Sunset
              </Text>
              <Text style={[styles.sunTimeValue, { color: theme.text }]}>
                {weatherData.sunset}
              </Text>
            </View>
          </View>
        </FadeIn>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 44, // Status bar height
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  currentWeatherCard: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    alignItems: 'center',
  },
  currentWeatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  currentWeatherInfo: {
    alignItems: 'center',
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  condition: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 4,
  },
  feelsLike: {
    fontSize: 14,
    marginTop: 2,
  },
  weatherDetails: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  detailValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  hourlyForecast: {
    marginVertical: 16,
  },
  hourlyContent: {
    paddingRight: 20,
    gap: 12,
  },
  hourlyItem: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
    gap: 8,
  },
  hourlyTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  hourlyTemp: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sunTimes: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    gap: 20,
  },
  sunTimeItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  sunTimeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  sunTimeValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
