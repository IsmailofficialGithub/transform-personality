import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-root-toast';
import {
  Camera,
  Image as ImageIcon,
  X,
  ClipboardList,
  ArrowLeft,
  PartyPopper,
  HeartHandshake,
  HelpCircle,
  Flame,
  MessageCircle,
  Globe
} from 'lucide-react-native';
import { useCommunityStore } from '../../store/communityStore';
import { useThemeStore } from '../../store/themeStore';
import { SIZES } from '../../utils/theme';
import { validatePostTitle, validatePostContent, POST_CATEGORIES } from '../../constants/community';
import type { Screen } from '../../navigation/AppNavigator';

// Icon mapping for dynamic rendering
const IconMap: Record<string, any> = {
  PartyPopper,
  HeartHandshake,
  HelpCircle,
  Flame,
  MessageCircle,
  Globe,
};

interface CreatePostScreenProps {
  onNavigate?: (screen: Screen) => void;
  onClose?: () => void;
}

export const CreatePostScreen = ({ onNavigate, onClose }: CreatePostScreenProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const { createPost } = useCommunityStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'success' | 'support' | 'question' | 'motivation' | 'general'>('general');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant photo library access');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset) => asset.uri);
        setImages([...images, ...newImages].slice(0, 5)); // Max 5 images
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Toast.show('Failed to pick image', { duration: Toast.durations.SHORT });
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera access');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]) {
        setImages([...images, result.assets[0].uri].slice(0, 5));
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Toast.show('Failed to take photo', { duration: Toast.durations.SHORT });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddImage = () => {
    Alert.alert(
      'Add Image',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Gallery', onPress: handlePickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSubmit = async () => {
    console.log('🚀 Submit button pressed');
    console.log('📝 Title:', title);
    console.log('📝 Content:', content);
    console.log('📂 Category:', category);
    console.log('🖼️ Images:', images.length);

    // Validate title
    const titleValidation = validatePostTitle(title);
    if (!titleValidation.valid) {
      console.log('❌ Title validation failed:', titleValidation.error);
      Toast.show(titleValidation.error || 'Invalid title', { duration: Toast.durations.SHORT });
      return;
    }

    // Validate content
    const contentValidation = validatePostContent(content);
    if (!contentValidation.valid) {
      console.log('❌ Content validation failed:', contentValidation.error);
      Toast.show(contentValidation.error || 'Invalid content', { duration: Toast.durations.SHORT });
      return;
    }

    console.log('✅ Validation passed, creating post...');
    setSubmitting(true);

    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        category,
        images: images.length > 0 ? images : undefined,
      };

      console.log('📤 Calling createPost with:', postData);

      const newPost = await createPost(postData);

      console.log('✅ Post created successfully!', newPost?.id);

      Toast.show('Post created successfully! 🎉', {
        duration: Toast.durations.LONG,
        position: Toast.positions.TOP,
      });

      // Reset form
      setTitle('');
      setContent('');
      setCategory('general');
      setImages([]);

      // Small delay to show success toast
      setTimeout(() => {
        if (onClose) {
          onClose();
        } else if (onNavigate) {
          onNavigate('community' as Screen);
        }
      }, 500);

    } catch (error: any) {
      console.error('❌ Error creating post:', error);

      let errorMessage = 'Failed to create post';

      if (error.message) {
        errorMessage = error.message;
      }

      // Handle specific error cases
      if (error.code === 'PGRST116') {
        errorMessage = 'Please complete your profile first';
      } else if (error.code === '23505') {
        errorMessage = 'Duplicate post detected';
      } else if (error.message?.includes('author_id')) {
        errorMessage = 'Profile setup required. Please check your profile.';
      } else if (error.message?.includes('foreign key')) {
        errorMessage = 'Please complete your profile setup first';
      }

      Toast.show(errorMessage, {
        duration: Toast.durations.LONG,
        position: Toast.positions.TOP,
      });

      Alert.alert(
        'Error Creating Post',
        errorMessage + '\n\nPlease try again or contact support if the problem persists.',
        [{ text: 'OK' }]
      );
    } finally {
      setSubmitting(false);
      console.log('🏁 Submit process completed');
    }
  };

  const canSubmit = title.trim().length >= 3 && content.trim().length >= 10 && !submitting;

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else if (onNavigate) {
      onNavigate('community' as Screen);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.background : '#F5F5F5' },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <LinearGradient
        colors={colors.gradientPurple}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={[
            styles.submitButton,
            !canSubmit && styles.submitButtonDisabled,
          ]}
          activeOpacity={0.7}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text
              style={[
                styles.submitButtonText,
                !canSubmit && styles.submitButtonTextDisabled,
              ]}
            >
              Post
            </Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Category Selector */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? colors.text : '#000' },
            ]}
          >
            Category
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {POST_CATEGORIES.map((cat) => {
              const IconComponent = IconMap[cat.icon || 'MessageCircle'];
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    category === cat.id && {
                      backgroundColor: colors.primary,
                    },
                    category !== cat.id && {
                      backgroundColor: isDark ? colors.surface : '#FFFFFF',
                    },
                  ]}
                  onPress={() => setCategory(cat.id)}
                  activeOpacity={0.7}
                  disabled={submitting}
                >
                  {IconComponent && (
                    <IconComponent
                      size={16}
                      color={category === cat.id ? '#FFF' : isDark ? colors.text : '#000'}
                      style={{ marginRight: 6 }}
                    />
                  )}
                  <Text
                    style={[
                      styles.categoryOptionText,
                      {
                        color:
                          category === cat.id
                            ? '#FFF'
                            : isDark
                              ? colors.text
                              : '#000',
                      },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? colors.text : '#000' },
            ]}
          >
            Title *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? colors.surface : '#FFFFFF',
                color: isDark ? colors.text : '#000',
                borderColor: isDark ? colors.border : '#E5E7EB',
              },
            ]}
            placeholder="Enter post title..."
            placeholderTextColor={isDark ? colors.textSecondary : '#999'}
            value={title}
            onChangeText={setTitle}
            maxLength={200}
            multiline={false}
            editable={!submitting}
          />
          <Text
            style={[
              styles.charCount,
              {
                color: title.length < 3 ? colors.error : colors.textSecondary
              },
            ]}
          >
            {title.length}/200 {title.length < 3 && '(min 3 chars)'}
          </Text>
        </View>

        {/* Content Input */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? colors.text : '#000' },
            ]}
          >
            Content *
          </Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: isDark ? colors.surface : '#FFFFFF',
                color: isDark ? colors.text : '#000',
                borderColor: isDark ? colors.border : '#E5E7EB',
              },
            ]}
            placeholder="Share your thoughts, experiences, or questions..."
            placeholderTextColor={isDark ? colors.textSecondary : '#999'}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            editable={!submitting}
          />
          <Text
            style={[
              styles.charCount,
              {
                color: content.length < 10 ? colors.error : colors.textSecondary
              },
            ]}
          >
            {content.length} characters {content.length < 10 && '(min 10 chars)'}
          </Text>
        </View>

        {/* Images */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? colors.text : '#000' },
            ]}
          >
            Images ({images.length}/5) - Optional
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imagesScroll}
          >
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                  disabled={submitting}
                >
                  <X size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity
                style={[
                  styles.addImageButton,
                  {
                    backgroundColor: isDark ? colors.surface : '#FFFFFF',
                    borderColor: isDark ? colors.border : '#E5E7EB',
                  },
                ]}
                onPress={handleAddImage}
                activeOpacity={0.7}
                disabled={submitting}
              >
                <Camera size={32} color={colors.primary} />
                <Text style={[styles.addImageLabel, { color: colors.textSecondary }]}>
                  Add Image
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Guidelines */}
        <View style={[styles.guidelinesBox, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
          <View style={styles.guidelinesHeader}>
            <ClipboardList size={20} color={isDark ? colors.text : '#000'} style={{ marginRight: 8 }} />
            <Text style={[styles.guidelinesTitle, { color: isDark ? colors.text : '#000' }]}>
              Community Guidelines
            </Text>
          </View>
          <Text style={[styles.guidelinesText, { color: colors.textSecondary }]}>
            • Be respectful and supportive{'\n'}
            • No explicit content or triggers{'\n'}
            • Protect your privacy and others'{'\n'}
            • Share constructive feedback only
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    minWidth: 70,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: SIZES.body,
    fontWeight: '700',
  },
  submitButtonTextDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.padding,
    paddingBottom: 40,
  },
  section: {
    marginBottom: SIZES.marginLarge,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    marginBottom: 12,
  },
  categoriesScroll: {
    marginHorizontal: -SIZES.padding,
    paddingHorizontal: SIZES.padding,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryOptionText: {
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  input: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    fontSize: SIZES.body,
    borderWidth: 1,
    minHeight: 50,
  },
  textArea: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    fontSize: SIZES.body,
    borderWidth: 1,
    minHeight: 150,
  },
  charCount: {
    fontSize: SIZES.tiny,
    marginTop: 4,
    textAlign: 'right',
  },
  imagesScroll: {
    marginHorizontal: -SIZES.padding,
    paddingHorizontal: SIZES.padding,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: SIZES.radius,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF5252',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageLabel: {
    fontSize: SIZES.tiny,
    fontWeight: '600',
    marginTop: 4,
  },
  guidelinesBox: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginTop: 8,
  },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  guidelinesTitle: {
    fontSize: SIZES.body,
    fontWeight: '700',
  },
  guidelinesText: {
    fontSize: SIZES.small,
    lineHeight: 20,
  },
});