// ---------------------------------------
// ResultScreen.tsx — Final Results Display
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
      <Text style={styles.title}>🎯 {t('finalScores')}</Text>

      {/* Host Card */}
      <View style={styles.card}>
        <Text style={styles.nameText}>
          <Text style={styles.roleText}>{t('hostLabel')} </Text>
          <Text style={styles.highlight}>{result.hostName}</Text>
        </Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>{t('scoreLabel')}</Text>
          <Text style={styles.scoreValue}>{result.hostScore}</Text>
        </View>
      </View>

      {/* Guest Card */}
      <View style={styles.card}>
        <Text style={styles.nameText}>
          <Text style={styles.roleText}>{t('guestLabel')} </Text>
          <Text style={styles.highlight}>{result.guestName}</Text>
        </Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#101031',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 24,
    marginVertical: 14,
    width: '85%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  nameText: {
    fontSize: 18,
    color: '#101031',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  roleText: {
    color: '#6D6D8D',
    fontWeight: '500',
    fontSize: 14,
  },
  highlight: {
    color: '#FF4F72',
    fontWeight: '700',
  },
  scoreContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 50,
    paddingVertical: 18,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6D6D8D',
    fontWeight: '500',
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#4CAF50',
    marginTop: 6,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#888',
    fontSize: 16,
  },
  playAgainBtn: {
    backgroundColor: '#FF4F72',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  playAgainText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
