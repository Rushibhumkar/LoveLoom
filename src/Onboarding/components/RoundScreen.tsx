import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { colors, spacing, typography } from '../../utils/theme';

const { width: screenWidth } = Dimensions.get('window');

interface RoundScreenProps {
  roundNumber: number;
  imageUri: any;
  leftText?: string;
  rightText?: string;
  onPrev: () => void;
  onNext: () => void;
}

const RoundScreen: React.FC<RoundScreenProps> = ({
  roundNumber,
  imageUri,
  leftText,
  rightText,
  onPrev,
  onNext,
}) => {
  return (
    <SafeAreaView
      style={[styles.screen, { width: screenWidth }]}
      edges={['top']}
    >
      {/* Round Number */}
      <Text style={styles.roundText}>
        Round<Text style={styles.roundAccent}> {roundNumber}</Text>
      </Text>

      {/* Illustration */}
      <Image
        source={typeof imageUri === 'string' ? { uri: imageUri } : imageUri}
        style={styles.illustration}
        resizeMode="contain"
      />

      {/* Left & Right Text */}
      {leftText && <Text style={styles.leftText}>{leftText}</Text>}
      {rightText && <Text style={styles.rightText}>{rightText}</Text>}

      {/* Navigation Buttons */}
      <TouchableOpacity style={styles.leftArrow} onPress={onPrev}>
        <Feather
          name="chevron-left"
          size={spacing.iconSize}
          color={colors.textPrimary}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.rightArrow} onPress={onNext}>
        <Feather
          name="chevron-right"
          size={spacing.iconSize}
          color={colors.textPrimary}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default RoundScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  roundText: {
    ...typography.roundNumber,
    color: colors.textPrimary,
    marginTop: 60,
  },
  roundAccent: {
    color: colors.primary,
  },
  illustration: {
    width: '80%',
    height: 250,
    marginTop: 50,
  },
  leftText: {
    position: 'absolute',
    bottom: '27%',
    left: 16,
    ...typography.leftText,
    color: colors.textPrimary,
  },
  rightText: {
    position: 'absolute',
    bottom: '22%',
    right: 16,
    ...typography.rightText,
    color: colors.primary,
    textAlign: 'right',
  },
  leftArrow: {
    position: 'absolute',
    bottom: 20,
    left: 22,
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
    borderRadius: spacing.buttonBorderRadius,
    width: spacing.buttonSize,
    height: spacing.buttonSize,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  rightArrow: {
    position: 'absolute',
    bottom: 20,
    right: 22,
    backgroundColor: colors.primary,
    borderRadius: spacing.buttonBorderRadius,
    width: spacing.buttonSize,
    height: spacing.buttonSize,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
});
