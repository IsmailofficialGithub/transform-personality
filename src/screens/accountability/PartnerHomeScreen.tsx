import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SIZES } from '../../utils/theme';

interface Partner {
  id: string;
  name: string;
  code: string;
  addedDate: string;
  lastContact?: string;
}

export const PartnerHomeScreen = () => {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [myCode, setMyCode] = useState('');

  useEffect(() => {
    loadPartnerData();
    generateMyCode();
  }, []);

  const generateMyCode = async () => {
    let code = await AsyncStorage.getItem('my_partner_code');
    if (!code) {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
      await AsyncStorage.setItem('my_partner_code', code);
    }
    setMyCode(code);
  };

  const loadPartnerData = async () => {
    try {
      const stored = await AsyncStorage.getItem('accountability_partner');
      if (stored) {
        setPartner(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading partner:', error);
    }
  };

  const addPartner = () => {
    Alert.prompt(
      'Add Partner',
      'Enter your partner\'s code:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async (code) => {
            if (code && code.length === 6) {
              const newPartner: Partner = {
                id: Date.now().toString(),
                name: 'Partner', // Would be fetched from server
                code: code.toUpperCase(),
                addedDate: new Date().toISOString(),
              };
              
              await AsyncStorage.setItem('accountability_partner', JSON.stringify(newPartner));
              setPartner(newPartner);
              Alert.alert('Success', 'Partner added successfully!');
            } else {
              Alert.alert('Error', 'Invalid code');
            }
          },
        },
      ]
    );
  };

  const shareMyCode = async () => {
    try {
      await Share.share({
        message: `Join me as my accountability partner on Transform! Use my code: ${myCode}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const sendSOS = () => {
    if (!partner) {
      Alert.alert('No Partner', 'Add an accountability partner first');
      return;
    }
    
    Alert.alert(
      'SOS Sent!',
      'Your partner has been notified that you need support',
      [{ text: 'OK' }]
    );
  };

  const shareProgress = () => {
    if (!partner) {
      Alert.alert('No Partner', 'Add an accountability partner first');
      return;
    }
    
    Alert.alert(
      'Progress Shared!',
      'Your partner can now see your latest progress',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🤝 Accountability Partner</Text>
        <Text style={styles.headerSubtitle}>Stay strong together</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* My Code */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your Partner Code</Text>
          <Text style={styles.codeValue}>{myCode}</Text>
          <TouchableOpacity style={styles.shareButton} onPress={shareMyCode}>
            <Text style={styles.shareButtonText}>Share Code 📤</Text>
          </TouchableOpacity>
        </View>

        {/* Partner Status */}
        {partner ? (
          <View style={styles.partnerCard}>
            <View style={styles.partnerHeader}>
              <Text style={styles.partnerIcon}>👤</Text>
              <View style={styles.partnerInfo}>
                <Text style={styles.partnerName}>{partner.name}</Text>
                <Text style={styles.partnerDate}>
                  Connected since {new Date(partner.addedDate).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionButton} onPress={sendSOS}>
                <Text style={styles.actionButtonText}>🆘 Send SOS</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={shareProgress}>
                <Text style={styles.actionButtonText}>📊 Share Progress</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.noPartnerCard}>
            <Text style={styles.noPartnerIcon}>👥</Text>
            <Text style={styles.noPartnerTitle}>No Partner Yet</Text>
            <Text style={styles.noPartnerText}>
              Add an accountability partner to stay motivated together
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={addPartner}>
              <Text style={styles.addButtonText}>+ Add Partner</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* How It Works */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 How It Works</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>1.</Text>
            <Text style={styles.infoText}>Share your code with a friend</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>2.</Text>
            <Text style={styles.infoText}>They add you using the code</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>3.</Text>
            <Text style={styles.infoText}>Support each other on your journey</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>4.</Text>
            <Text style={styles.infoText}>Send SOS alerts when struggling</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  scrollContent: {
    padding: 20,
  },
  codeCard: {
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
  },
  codeLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  codeValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 4,
    marginBottom: 16,
  },
  shareButton: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  partnerCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  partnerIcon: {
    fontSize: 48,
    marginRight: 12,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  partnerDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#6C5CE7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  noPartnerCard: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 12,
    marginBottom: 20,
  },
  noPartnerIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  noPartnerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  noPartnerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  addButton: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 12,
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoBullet: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6C5CE7',
    marginRight: 12,
    width: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
});