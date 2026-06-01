// ---------------------------------------
// ResultScreen.tsx — Final Results Display
// Romantic UI with love colors
// ---------------------------------------
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSocket } from '../../hooks/useSocket';
import { myConsole } from '../../utils/myConsole';
import { useRoomConnection } from '../../hooks/useRoomConnection';
import { useTranslation } from 'react-i18next';

interface ResultData {
  hostName: string;
  hostScore: number;
  guestName: string;
  guestScore: number;
}

const ResultScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const { roomId, userID, name, role, categoryId } = route.params || {};

  const result: ResultData = route.params?.result;
  const navigation = useNavigation<any>();
  const { socket, emit } = useSocket();
  useRoomConnection(role, userID);
  myConsole('route.params', route.params);

  useEffect(() => {
    console.log('🏁 Final result received on ResultScreen =>', result);
  }, [result]);

  const handlePlayAgain = () => {
    if (!roomId) {
      Alert.alert(t('roomNotFoundTitle'), t('roomNotFoundMsg'));
      return;
    }

    console.log('🔁 Play Again clicked => emitting restart_game');
    emit('restart_game', { roomId }, (res: any) => {
      console.log('[ACK] restart_game =>', res);
      if (res?.success) {
        if (route.params.role === 'host') {
          Alert.alert(t('gameRestartedTitle'), t('gameRestartedMsg'));
        }

        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'WheelScreen',
              params: {
                roomId,
                userID,
                name:
                  route.params.role === 'guest'
                    ? route.params.result.guestName
                    : route.params.result.hostName,
                role: role || (result.hostName === name ? 'host' : 'guest'),
                categoryId: null,
              },
            },
          ],
        });
      } else {
        Alert.alert(t('restartFailedTitle'), res?.message || t('tryAgain'));
      }
    });
  };

  if (!result) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>⚠️ No result data available.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative heart header */}
      <View style={styles.header}>
        <Text style={styles.title}>💖 {t('finalScores')} 💖</Text>
      </View>

      {/* Host Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.roleBadge}>{t('hostLabel')}</Text>
          <Text style={styles.nameText}>{result.hostName}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>{t('scoreLabel')}</Text>
          <Text style={styles.scoreValue}>{result.hostScore}</Text>
        </View>
      </View>

      {/* VS divider */}
      <View style={styles.vsDivider}>
        <View style={styles.vsLine} />
        <Text style={styles.vsText}>✨ VS ✨</Text>
        <View style={styles.vsLine} />
      </View>

      {/* Guest Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.roleBadge}>{t('guestLabel')}</Text>
          <Text style={styles.nameText}>{result.guestName}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>{t('scoreLabel')}</Text>
          <Text style={styles.scoreValue}>{result.guestScore}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.playAgainBtn} onPress={handlePlayAgain}>
        <Text style={styles.playAgainText}>🔁 {t('playAgain')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ResultScreen;

// Romantic color palette (no external theme)
const loveColors = {
  background: '#FFF0F5', // lavender blush – soft romantic
  cardBg: '#FFFFFF', // pure white
  primary: '#FF8DA1', // love pink
  primaryDark: '#E86F8B',
  textPrimary: '#5D3A4A', // deep rose
  textSecondary: '#B5838D',
  accentGold: '#FFD700',
  correctGreen: '#A8E6CF',
  shadow: '#FFB7C5',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: loveColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: loveColors.primary,
    textAlign: 'center',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: loveColors.cardBg,
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 24,
    marginVertical: 10,
    width: '85%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: loveColors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  roleBadge: {
    backgroundColor: loveColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 40,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 12,
    overflow: 'hidden',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: loveColors.textPrimary,
  },
  scoreContainer: {
    backgroundColor: '#FEF4F6',
    borderRadius: 60,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
    borderWidth: 1,
    borderColor: loveColors.primary,
  },
  scoreLabel: {
    fontSize: 14,
    color: loveColors.textSecondary,
    fontWeight: '600',
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: 44,
    fontWeight: '800',
    color: loveColors.correctGreen,
    marginTop: 4,
    textAlign: 'center',
  },
  vsDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    width: '60%',
  },
  vsLine: {
    flex: 1,
    height: 1,
    backgroundColor: loveColors.primary,
    opacity: 0.5,
  },
  vsText: {
    fontSize: 14,
    fontWeight: '700',
    color: loveColors.primary,
    marginHorizontal: 12,
    letterSpacing: 1,
  },
  playAgainBtn: {
    backgroundColor: loveColors.primary,
    borderRadius: 60,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: loveColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  playAgainText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: loveColors.background,
  },
  errorText: {
    color: loveColors.textSecondary,
    fontSize: 16,
  },
});
