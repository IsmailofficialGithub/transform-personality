import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SIZES } from '../../utils/theme';
import { useThemeStore } from '../../store/themeStore';

const { width } = Dimensions.get('window');

interface ProgressPhoto {
  id: string;
  uri: string;
  timestamp: string;
  daysClean: number;
  note?: string;
}

export const SelfieProgressScreen = () => {
  const colors = useThemeStore((state) => state.colors);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const stored = await AsyncStorage.getItem('progressPhotos');
      if (stored) {
        setPhotos(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const savePhotos = async (newPhotos: ProgressPhoto[]) => {
    try {
      await AsyncStorage.setItem('progressPhotos', JSON.stringify(newPhotos));
      setPhotos(newPhotos);
    } catch (error) {
      console.error('Error saving photos:', error);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take progress photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newPhoto: ProgressPhoto = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        timestamp: new Date().toISOString(),
        daysClean: calculateDaysClean(),
      };

      const updatedPhotos = [newPhoto, ...photos];
      savePhotos(updatedPhotos);

      Alert.alert('Success', 'Progress photo saved!');
    }
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery permission is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newPhoto: ProgressPhoto = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        timestamp: new Date().toISOString(),
        daysClean: calculateDaysClean(),
      };

      const updatedPhotos = [newPhoto, ...photos];
      savePhotos(updatedPhotos);
    }
  };

  const deletePhoto = (id: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this progress photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedPhotos = photos.filter(p => p.id !== id);
            savePhotos(updatedPhotos);
          },
        },
      ]
    );
  };

  const calculateDaysClean = (): number => {
    // This would come from your habit store
    return 0;
  };

  const handleAddPhoto = () => {
    Alert.alert(
      'Add Progress Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickPhoto },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient
        colors={colors.gradientPurple}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerEmoji}>📸</Text>
        <Text style={styles.headerTitle}>Progress Photos</Text>
        <Text style={styles.headerSubtitle}>
          Track your transformation visually
        </Text>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Add Photo Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.surface }]}
          onPress={handleAddPhoto}
        >
          <LinearGradient
            colors={colors.gradientPurple}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButtonGradient}
          >
            <Text style={styles.addButtonIcon}>📷</Text>
            <Text style={styles.addButtonText}>Take Progress Photo</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Tips */}
        <View style={[styles.tipCard, { backgroundColor: colors.surface }]}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={[styles.tipTitle, { color: colors.text }]}>
              Photo Tips
            </Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              • Take photos weekly in same lighting{'\n'}
              • Use same pose and location{'\n'}
              • Photos help motivate during tough times{'\n'}
              • You'll love seeing your transformation
            </Text>
          </View>
        </View>

        {/* Photo Timeline */}
        {photos.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No progress photos yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Take your first photo to start tracking your visual transformation
            </Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            <Text style={[styles.timelineTitle, { color: colors.text }]}>
              Your Journey ({photos.length} {photos.length === 1 ? 'Photo' : 'Photos'})
            </Text>
            
            {photos.map((photo, index) => (
              <View key={photo.id} style={styles.photoItem}>
                <View style={styles.photoContainer}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.photoOverlay}
                  >
                    <Text style={styles.photoDays}>
                      Day {photo.daysClean}
                    </Text>
                    <Text style={styles.photoDate}>
                      {new Date(photo.timestamp).toLocaleDateString()}
                    </Text>
                  </LinearGradient>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deletePhoto(photo.id)}
                  >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
                
                {index === 0 && photos.length > 1 && (
                  <Text style={[styles.latestBadge, { backgroundColor: colors.primary }]}>
                    Latest
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Before/After Comparison */}
        {photos.length >= 2 && (
          <View style={styles.comparisonSection}>
            <Text style={[styles.comparisonTitle, { color: colors.text }]}>
              🔄 Before & After
            </Text>
            <View style={styles.comparisonContainer}>
              <View style={styles.comparisonItem}>
                <Image
                  source={{ uri: photos[photos.length - 1].uri }}
                  style={styles.comparisonPhoto}
                  resizeMode="cover"
                />
                <Text style={[styles.comparisonLabel, { color: colors.textSecondary }]}>
                  Before (Day {photos[photos.length - 1].daysClean})
                </Text>
              </View>
              
              <View style={styles.comparisonArrow}>
                <Text style={styles.arrowIcon}>→</Text>
              </View>
              
              <View style={styles.comparisonItem}>
                <Image
                  source={{ uri: photos[0].uri }}
                  style={styles.comparisonPhoto}
                  resizeMode="cover"
                />
                <Text style={[styles.comparisonLabel, { color: colors.textSecondary }]}>
                  After (Day {photos[0].daysClean})
                </Text>
              </View>
            </View>
            
            <Text style={[styles.comparisonProgress, { color: colors.success }]}>
              ✨ {photos[0].daysClean - photos[photos.length - 1].daysClean} days of progress!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SIZES.paddingLarge,
    paddingTop: SIZES.paddingLarge + 20,
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 56,
    marginBottom: SIZES.margin,
  },
  headerTitle: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: SIZES.body,
    color: 'rgba(255,255,255,0.9)',
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 120,
  },
  addButton: {
    borderRadius: SIZES.radiusLarge,
    overflow: 'hidden',
    marginBottom: SIZES.marginLarge,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.paddingLarge,
  },
  addButtonIcon: {
    fontSize: 32,
    marginRight: SIZES.margin,
  },
  addButtonText: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tipCard: {
    flexDirection: 'row',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.marginLarge,
  },
  tipIcon: {
    fontSize: 32,
    marginRight: SIZES.margin,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipText: {
    fontSize: SIZES.small,
    lineHeight: 20,
  },
  emptyState: {
    padding: SIZES.paddingLarge * 2,
    borderRadius: SIZES.radiusLarge,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SIZES.margin,
  },
  emptyText: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: SIZES.body,
    textAlign: 'center',
  },
  timeline: {
    marginBottom: SIZES.marginLarge,
  },
  timelineTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    marginBottom: SIZES.margin,
  },
  photoItem: {
    marginBottom: SIZES.margin,
    position: 'relative',
  },
  photoContainer: {
    width: '100%',
    height: width * 0.8,
    borderRadius: SIZES.radiusLarge,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SIZES.padding,
  },
  photoDays: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  photoDate: {
    fontSize: SIZES.small,
    color: 'rgba(255,255,255,0.9)',
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 82, 82, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 20,
  },
  latestBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  comparisonSection: {
    marginTop: SIZES.marginLarge,
  },
  comparisonTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    marginBottom: SIZES.margin,
    textAlign: 'center',
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  comparisonItem: {
    flex: 1,
  },
  comparisonPhoto: {
    width: '100%',
    height: width * 0.4,
    borderRadius: SIZES.radius,
  },
  comparisonLabel: {
    fontSize: SIZES.small,
    textAlign: 'center',
    marginTop: 8,
  },
  comparisonArrow: {
    marginHorizontal: SIZES.marginSmall,
  },
  arrowIcon: {
    fontSize: 32,
  },
  comparisonProgress: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});