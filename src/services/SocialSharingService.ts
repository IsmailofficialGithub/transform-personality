import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform, Share } from 'react-native';
import ViewShot from 'react-native-view-shot';

export interface ShareContent {
  title: string;
  message: string;
  imageUri?: string;
  url?: string;
}

class SocialSharingService {
  
  // 📱 Share via native share sheet
  async shareViaSheet(content: ShareContent): Promise<boolean> {
    try {
      const shareOptions: any = {
        title: content.title,
        message: content.message,
      };

      if (content.url) {
        shareOptions.url = content.url;
      }

      const result = await Share.share(shareOptions);

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`Shared with activity type: ${result.activityType}`);
        } else {
          console.log('Shared successfully');
        }
        return true;
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
        return false;
      }

      return false;
    } catch (error) {
      console.error('Error sharing:', error);
      return false;
    }
  }

  // 📸 Share with image
  async shareWithImage(content: ShareContent, viewShotRef: any): Promise<boolean> {
    try {
      // Capture the view as image
      const uri = await viewShotRef.current.capture();
      
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        console.log('Sharing not available');
        return false;
      }

      // Share the image
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: content.title,
      });

      return true;
    } catch (error) {
      console.error('Error sharing image:', error);
      return false;
    }
  }

  // 🏆 Share achievement
  async shareAchievement(achievementTitle: string, description: string, days: number): Promise<boolean> {
    const content: ShareContent = {
      title: 'Achievement Unlocked! 🏆',
      message: `I just unlocked "${achievementTitle}" on my recovery journey! ${days} days strong! 💪\n\n${description}\n\n#Recovery #SelfImprovement #Progress`,
    };

    return await this.shareViaSheet(content);
  }

  // 🔥 Share streak milestone
  async shareStreak(days: number, habitName: string): Promise<boolean> {
    const milestoneEmoji = this.getMilestoneEmoji(days);
    
    const content: ShareContent = {
      title: `${days} Days Clean! ${milestoneEmoji}`,
      message: `${milestoneEmoji} Celebrating ${days} days clean from ${habitName}!\n\nEvery day is a victory. Keep going! 💪\n\n#Recovery #Milestone #SelfImprovement #${days}DaysStrong`,
    };

    return await this.shareViaSheet(content);
  }

  // 📊 Share weekly progress
  async shareWeeklyProgress(stats: {
    successRate: number;
    urgesOvercome: number;
    gamesPlayed: number;
    currentStreak: number;
  }): Promise<boolean> {
    const content: ShareContent = {
      title: 'Weekly Progress Report 📊',
      message: `My weekly recovery progress:\n\n📈 Success Rate: ${stats.successRate.toFixed(0)}%\n✅ Urges Overcome: ${stats.urgesOvercome}\n🎮 Games Played: ${stats.gamesPlayed}\n🔥 Current Streak: ${stats.currentStreak} days\n\nStaying strong! 💪\n\n#Progress #Recovery #SelfImprovement`,
    };

    return await this.shareViaSheet(content);
  }

  // 📸 Share transformation progress
  async shareTransformation(daysSince: number, beforeImageUri?: string, afterImageUri?: string): Promise<boolean> {
    const content: ShareContent = {
      title: 'My Transformation Journey 📸',
      message: `${daysSince} days into my recovery journey!\n\nEvery day brings positive changes. The journey continues! 💪\n\n#Transformation #Recovery #Progress #${daysSince}Days`,
    };

    return await this.shareViaSheet(content);
  }

  // 🎮 Share game achievement
  async shareGameScore(gameName: string, score: number, achievement?: string): Promise<boolean> {
    const content: ShareContent = {
      title: `${gameName} Achievement! 🎮`,
      message: `Just scored ${score} in ${gameName}!${achievement ? `\n\n${achievement}` : ''}\n\nUsing games to stay focused and overcome urges. 💪\n\n#Gaming #Focus #SelfControl`,
    };

    return await this.shareViaSheet(content);
  }

  // 💡 Share insight/tip
  async shareTip(tip: string, category: string): Promise<boolean> {
    const content: ShareContent = {
      title: '💡 Recovery Tip',
      message: `${tip}\n\nCategory: ${category}\n\n#RecoveryTips #SelfImprovement #Motivation`,
    };

    return await this.shareViaSheet(content);
  }

  // 🌟 Share motivational quote with progress
  async shareMotivation(quote: string, author: string, days: number): Promise<boolean> {
    const content: ShareContent = {
      title: 'Daily Motivation 🌟',
      message: `"${quote}"\n— ${author}\n\n${days} days strong on my recovery journey! 💪\n\n#Motivation #Recovery #Progress`,
    };

    return await this.shareViaSheet(content);
  }

  // 🎯 Share to specific platform (if deep links available)
  async shareToFacebook(content: ShareContent): Promise<boolean> {
    // Facebook sharing would require Facebook SDK
    // For now, use native share sheet
    return await this.shareViaSheet(content);
  }

  async shareToTwitter(content: ShareContent): Promise<boolean> {
    // Twitter sharing via URL scheme
    const text = encodeURIComponent(content.message);
    const twitterUrl = `twitter://post?message=${text}`;
    
    // Fallback to native share
    return await this.shareViaSheet(content);
  }

  async shareToInstagram(imageUri: string): Promise<boolean> {
    // Instagram sharing requires Instagram SDK or URL schemes
    // For now, copy image to clipboard and prompt user
    return await this.shareViaSheet({
      title: 'Share to Instagram',
      message: 'Image ready to share!',
      imageUri,
    });
  }

  async shareToWhatsApp(content: ShareContent): Promise<boolean> {
    // WhatsApp sharing via URL scheme
    const text = encodeURIComponent(content.message);
    const whatsappUrl = `whatsapp://send?text=${text}`;
    
    // Fallback to native share
    return await this.shareViaSheet(content);
  }

  // 🎨 Generate share image (for visual shares)
  async generateShareImage(data: {
    title: string;
    stats: Array<{ label: string; value: string }>;
    backgroundColor: string;
  }): Promise<string | null> {
    // This would require react-native-view-shot
    // Return null for now, implement with ViewShot component
    return null;
  }

  // 🏅 Get milestone emoji
  private getMilestoneEmoji(days: number): string {
    if (days >= 365) return '🏆';
    if (days >= 180) return '💎';
    if (days >= 90) return '🔥';
    if (days >= 60) return '⭐';
    if (days >= 30) return '🎯';
    if (days >= 7) return '💪';
    return '🌟';
  }

  // 📋 Copy to clipboard
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      // In React Native, you'd use @react-native-clipboard/clipboard
      // For now, just log
      console.log('Copied to clipboard:', text);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }

  // 🔗 Generate shareable link
  generateShareableLink(type: string, id: string): string {
    // This would be your app's deep link
    return `https://yourapp.com/share/${type}/${id}`;
  }

  // 📱 Check sharing availability
  async isSharingAvailable(): Promise<boolean> {
    return await Sharing.isAvailableAsync();
  }
}

export default new SocialSharingService();