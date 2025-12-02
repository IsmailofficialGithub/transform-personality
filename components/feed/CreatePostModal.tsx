import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Alert, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../services/supabase';
import { X, Send } from 'lucide-react-native';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export default function CreatePostModal({ visible, onClose, onPostCreated }: CreatePostModalProps) {
  const theme = useTheme();
  const { user, profile } = useAuthStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'success' | 'support' | 'question' | 'motivation' | 'general'>('general');
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!user || !profile) {
      Alert.alert('Error', 'You must be logged in to post');
      return;
    }

    if (!title.trim() || title.length < 3) {
      Alert.alert('Error', 'Title must be at least 3 characters');
      return;
    }

    if (!content.trim() || content.length < 10) {
      Alert.alert('Error', 'Content must be at least 10 characters');
      return;
    }

    setLoading(true);
    try {
      // Get user_profiles id from user_id
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!userProfile) {
        Alert.alert('Error', 'Profile not found');
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('community_posts')
        .insert({
          author_id: userProfile.id,
          title: title.trim(),
          content: content.trim(),
          category,
        });

      if (error) {
        throw error;
      }

      setTitle('');
      setContent('');
      setCategory('general');
      onPostCreated();
      onClose();
      Alert.alert('Success', 'Post created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'success', label: 'Success Story' },
    { value: 'support', label: 'Support' },
    { value: 'question', label: 'Question' },
    { value: 'motivation', label: 'Motivation' },
    { value: 'general', label: 'General' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.base.background }]}>
          <View style={[styles.header, { borderBottomColor: theme.base.border }]}>
            <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Create Post</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text.secondary }]}>Title</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.base.card,
                    color: theme.text.primary,
                    borderColor: theme.base.border,
                  },
                ]}
                placeholder="Enter post title..."
                placeholderTextColor={theme.text.tertiary}
                value={title}
                onChangeText={setTitle}
                maxLength={200}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text.secondary }]}>Content</Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: theme.base.card,
                    color: theme.text.primary,
                    borderColor: theme.base.border,
                  },
                ]}
                placeholder="What's on your mind?"
                placeholderTextColor={theme.text.tertiary}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text.secondary }]}>Category</Text>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor: category === cat.value ? theme.primary : theme.base.card,
                        borderColor: theme.base.border,
                      },
                    ]}
                    onPress={() => setCategory(cat.value as any)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        {
                          color: category === cat.value ? theme.text.inverse : theme.text.primary,
                        },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.base.border }]}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.cancelButton, { backgroundColor: theme.base.card }]}
            >
              <Text style={[styles.buttonText, { color: theme.text.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePost}
              disabled={loading || !title.trim() || !content.trim()}
              style={[
                styles.postButton,
                {
                  backgroundColor:
                    loading || !title.trim() || !content.trim() ? theme.base.border : theme.primary,
                },
              ]}
            >
              <Send size={20} color={loading || !title.trim() || !content.trim() ? theme.text.tertiary : theme.text.inverse} />
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: loading || !title.trim() || !content.trim() ? theme.text.tertiary : theme.text.inverse,
                  },
                ]}
              >
                {loading ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 20,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  postButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

