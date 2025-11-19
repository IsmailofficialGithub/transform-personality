import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../utils/theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const buttonHeight = size === 'small' ? 40 : size === 'large' ? 56 : 48;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
    }).start();
  };

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FFF' : COLORS.primary}
        />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'secondary' && { color: COLORS.text },
            variant === 'outline' && { color: COLORS.primary },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </>
  );

  const gradientColors =
    variant === 'primary'
      ? COLORS.gradientPurple
      : variant === 'secondary'
      ? [COLORS.surfaceLight, COLORS.surface]
      : ['transparent', 'transparent'];

  const containerStyle = [
    styles.button,
    {
      height: buttonHeight,
      opacity: disabled ? 0.6 : 1,
    },
    variant === 'outline' && styles.outline,
    variant === 'secondary' && styles.secondary,
    style,
  ];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
      >
        {variant === 'primary' ? (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[containerStyle, SHADOWS.medium]}
          >
            {renderContent()}
          </LinearGradient>
        ) : (
          <Animated.View style={[containerStyle, SHADOWS.light]}>
            {renderContent()}
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  text: {
    fontSize: SIZES.body,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  secondary: {
    backgroundColor: COLORS.surface,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
});
