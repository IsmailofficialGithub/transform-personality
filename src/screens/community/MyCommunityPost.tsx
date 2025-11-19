import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";

import {
  CommunityPost,
  communityService,
} from "../../services/CommunityService";
import { SIZES } from "../../utils/theme";

interface MyCommunityPostProps {
  postId: string;
  onBack?: () => void;     // made optional → prevents crash
  onPostDeleted?: () => void;
}

export const MyCommunityPost = ({
  postId,
  onBack = () => {},
  onPostDeleted = () => {},
}: MyCommunityPostProps) => {
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  // ----------------------------------------
  // FETCH USER POST
  // ----------------------------------------
  const fetchPost = async () => {
    setLoading(false);
    try {
      const allMyPosts = await communityService.getUserPosts();

      const found = allMyPosts.find((p) => p.id === postId);

      if (!found) {
        setPost(null);
      } else {
        setPost(found);
        setTitle(found.title);
        setContent(found.content);
      }
    } catch (error) {
      console.log("Fetch error:", error);
      Alert.alert("Error", "Could not load your post.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) fetchPost();
  }, [postId]);

  // ----------------------------------------
  // UPDATE POST
  // ----------------------------------------
  const handleUpdatePost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Warning", "Title and content cannot be empty.");
      return;
    }

    setUpdateLoading(true);

    try {
      const updated = await communityService.updatePost(postId, {
        title,
        content,
      });

      setPost(updated);
      setIsEditing(false);
      Alert.alert("Success", "Post updated successfully!");
    } catch (error) {
      console.log("Update error:", error);
      Alert.alert("Error", "Failed to update post.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // ----------------------------------------
  // DELETE POST
  // ----------------------------------------
  const handleDeletePost = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },

        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await communityService.deletePost(postId);
              Alert.alert("Deleted", "Post deleted successfully.");
              onPostDeleted();
            } catch (error) {
              console.log("Delete error:", error);
              Alert.alert("Error", "You can only delete your own post.");
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // --------------------------------------------------------------------
  // UI STATES
  // --------------------------------------------------------------------

  if (loading)
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your post...</Text>
      </View>
    );

  if (!post)
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Post not found.</Text>

        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
    );

  // --------------------------------------------------------------------
  // MAIN UI
  // --------------------------------------------------------------------
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>My Post</Text>

        {/* EDIT MODE */}
        {isEditing ? (
          <View style={styles.card}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Post title"
            />

            <Text style={styles.label}>Content</Text>
            <TextInput
              style={[styles.input, styles.contentInput]}
              value={content}
              onChangeText={setContent}
              placeholder="Post content"
              multiline
            />

            <TouchableOpacity
              style={[styles.actionButton, styles.updateButton]}
              onPress={handleUpdatePost}
              disabled={updateLoading}
            >
              <Text style={styles.buttonText}>
                {updateLoading ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                setTitle(post.title);
                setContent(post.content);
                setIsEditing(false);
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // VIEW MODE
          <View style={styles.card}>
            <Text style={styles.viewTitle}>{post.title}</Text>
            <Text style={styles.viewContent}>{post.content}</Text>

            <View style={styles.metadata}>
              <Text style={styles.metaText}>Category: {post.category}</Text>
              <Text style={styles.metaText}>
                Likes: {post.likes_count} • Comments: {post.comments_count}
              </Text>
              <Text style={styles.metaText}>
                Posted: {new Date(post.created_at).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDeletePost}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.backButtonFixed} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
};

// --------------------------------------------------------------------
// STYLES
// --------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    paddingTop: 60,
  },
  backupButton: {
    position: "absolute",
    top: SIZES.padding * 2,
    right: SIZES.padding * 2,
    backgroundColor: "#007AFF",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  screenTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 20,
  },

  // LOADING / ERROR
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#777",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },

  // CARD
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },

  // VIEW MODE
  viewTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  viewContent: {
    fontSize: 16,
    marginBottom: 15,
    lineHeight: 22,
  },
  metadata: {
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingTop: 12,
    marginBottom: 20,
  },
  metaText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },

  // EDIT MODE
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  contentInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },

  // BUTTONS
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    padding: 14,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: "center",
  },
  updateButton: {
    backgroundColor: "#28A745",
    marginBottom: 10,
    marginHorizontal: 0,
  },
  cancelButton: {
    backgroundColor: "#6C757D",
  },
  editButton: {
    backgroundColor: "#007AFF",
  },
  deleteButton: {
    backgroundColor: "#DC3545",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },

  // BACK BUTTON
  backButtonFixed: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
});
