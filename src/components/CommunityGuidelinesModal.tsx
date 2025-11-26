import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { X, Handshake, Lock, Heart, AlertTriangle, ShieldAlert } from 'lucide-react-native';
import { useThemeStore } from '../store/themeStore';
import { SIZES } from '../utils/theme';
import { COMMUNITY_GUIDELINES } from '../constants/community';

// Icon mapping
const IconMap: Record<string, any> = {
    Handshake,
    Lock,
    Heart,
    AlertTriangle,
    ShieldAlert,
};

interface CommunityGuidelinesModalProps {
    visible: boolean;
    onClose: () => void;
}

export const CommunityGuidelinesModal = ({ visible, onClose }: CommunityGuidelinesModalProps) => {
    const colors = useThemeStore((state) => state.colors);
    const isDark = useThemeStore((state) => state.isDark);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: isDark ? colors.surface : '#FFF' }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: isDark ? colors.text : '#000' }]}>
                            Community Guidelines
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={isDark ? colors.text : '#000'} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <Text style={[styles.intro, { color: isDark ? colors.textSecondary : '#666' }]}>
                            Our community is a safe space for growth and support. Please follow these guidelines to help us maintain a positive environment.
                        </Text>

                        {COMMUNITY_GUIDELINES.map((guideline, index) => {
                            const IconComponent = IconMap[guideline.icon || 'Heart'];
                            return (
                                <View key={index} style={styles.guidelineItem}>
                                    <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.background : '#F5F5F5' }]}>
                                        {IconComponent && (
                                            <IconComponent size={24} color={colors.primary} />
                                        )}
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={[styles.guidelineTitle, { color: isDark ? colors.text : '#000' }]}>
                                            {guideline.title}
                                        </Text>
                                        <Text style={[styles.guidelineDescription, { color: isDark ? colors.textSecondary : '#666' }]}>
                                            {guideline.description}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.primary }]}
                            onPress={onClose}
                        >
                            <Text style={styles.buttonText}>I Understand</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: SIZES.padding,
        maxHeight: '85%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        marginBottom: 20,
    },
    intro: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 24,
    },
    guidelineItem: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    guidelineTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    guidelineDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    button: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
