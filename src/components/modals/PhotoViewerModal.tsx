import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
  Image,
} from 'react-native';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import { useTheme } from '../../contexts/ThemeContext';
import IconFallback from '../shared/IconFallback';

interface PhotoViewerModalProps {
  visible: boolean;
  onClose: () => void;
  photos: Array<{
    id: string;
    uri: string;
    caption?: string;
    author: string;
    authorType: 'customer' | 'mechanic';
    timestamp: string;
  }>;
  initialIndex: number;
  onDeletePhoto?: (photoId: string) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function PhotoViewerModal({ 
  visible, 
  onClose, 
  photos, 
  initialIndex, 
  onDeletePhoto 
}: PhotoViewerModalProps) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showControls, setShowControls] = useState(true);
  
  // Animation values
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const currentPhoto = photos[currentIndex];

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  const handleSwipeLeft = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetImageTransform();
    }
  };

  const handleSwipeRight = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetImageTransform();
    }
  };

  const resetImageTransform = () => {
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
  };

  const handleDeletePhoto = () => {
    if (!onDeletePhoto || !currentPhoto) return;

    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDeletePhoto(currentPhoto.id);
            if (currentIndex > 0) {
              setCurrentIndex(currentIndex - 1);
            } else if (photos.length > 1) {
              setCurrentIndex(0);
            } else {
              onClose();
            }
          }
        }
      ]
    );
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale } }],
    { useNativeDriver: true }
  );

  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onPinchHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      scale.setValue(event.nativeEvent.scale);
    }
  };

  const onPanHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      translateX.setValue(event.nativeEvent.translationX);
      translateY.setValue(event.nativeEvent.translationY);
    }
  };

  if (!visible || !currentPhoto) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={[styles.container, { backgroundColor: 'rgba(0, 0, 0, 0.95)' }]}>
        {/* Header Controls */}
        {showControls && (
          <Animated.View style={[styles.header, { opacity }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconFallback name="close" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.photoCounter}>
                {currentIndex + 1} of {photos.length}
              </Text>
            </View>
            <View style={styles.headerRight}>
              {onDeletePhoto && (
                <TouchableOpacity onPress={handleDeletePhoto} style={styles.deleteButton}>
                  <IconFallback name="delete" size={24} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        )}

        {/* Photo Container */}
        <TouchableOpacity 
          style={styles.photoContainer} 
          activeOpacity={1}
          onPress={toggleControls}
        >
          <PinchGestureHandler
            onGestureEvent={onPinchGestureEvent}
            onHandlerStateChange={onPinchHandlerStateChange}
          >
            <Animated.View style={styles.pinchContainer}>
              <PanGestureHandler
                onGestureEvent={onPanGestureEvent}
                onHandlerStateChange={onPanHandlerStateChange}
              >
                <Animated.View style={styles.panContainer}>
                  <Animated.Image
                    source={{ uri: currentPhoto.uri }}
                    style={[
                      styles.photo,
                      {
                        transform: [
                          { scale },
                          { translateX },
                          { translateY },
                        ],
                      },
                    ]}
                    resizeMode="contain"
                  />
                </Animated.View>
              </PanGestureHandler>
            </Animated.View>
          </PinchGestureHandler>
        </TouchableOpacity>

        {/* Navigation Arrows */}
        {showControls && photos.length > 1 && (
          <>
            {currentIndex > 0 && (
              <TouchableOpacity 
                style={[styles.navButton, styles.navButtonLeft]}
                onPress={handleSwipeRight}
              >
                <IconFallback name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            )}
            {currentIndex < photos.length - 1 && (
              <TouchableOpacity 
                style={[styles.navButton, styles.navButtonRight]}
                onPress={handleSwipeLeft}
              >
                <IconFallback name="arrow-forward" size={24} color="white" />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Photo Info */}
        {showControls && (
          <Animated.View style={[styles.photoInfo, { opacity }]}>
            <View style={styles.photoInfoContent}>
              {currentPhoto.caption && (
                <Text style={styles.photoCaption} numberOfLines={3}>
                  {currentPhoto.caption}
                </Text>
              )}
              <View style={styles.photoMeta}>
                <Text style={styles.photoAuthor}>
                  {currentPhoto.author} ({currentPhoto.authorType})
                </Text>
                <Text style={styles.photoTimestamp}>
                  {formatTimestamp(currentPhoto.timestamp)}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Swipe Indicators */}
        {photos.length > 1 && (
          <View style={styles.swipeIndicators}>
            {photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.3)',
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  photoCounter: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinchContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: screenWidth,
    height: screenHeight * 0.7,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  navButtonLeft: {
    left: 20,
  },
  navButtonRight: {
    right: 20,
  },
  photoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    zIndex: 10,
  },
  photoInfoContent: {
    alignItems: 'center',
  },
  photoCaption: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  photoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  photoAuthor: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  photoTimestamp: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  swipeIndicators: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    zIndex: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
