// --------------------------------------------------------
// HomeScreen.tsx — entry screen for room creation / joining
// LoveLoom Theme applied
// --------------------------------------------------------

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {
  useNavigation,
  DrawerActions,
  useFocusEffect,
} from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSocket } from '../hooks/useSocket';
import { getUserData } from '../api/userApi';
import { useRoomConnection } from '../hooks/useRoomConnection';
import { useTranslation } from 'react-i18next';
import { myConsole } from '../utils/myConsole';
import { colors, spacing } from '../utils/theme';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { ADMOB } from '../utils/admobConfig';

const HomeScreen = () => {
  const { t } = useTranslation();
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { emit } = useSocket();

  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUserData();
      myConsole('useruserss', user);
      if (user) {
        console.log('[INIT] Logged-in user loaded:', user);
        setPlayer({
          userID: user.userID,
          name: `${user.userFirstName || ''} ${user.userSurname || ''}`.trim(),
        });
      } else {
        console.warn('[WARN] No user data found in AsyncStorage');
      }
    };
    fetchUser();
  }, []);

  // ✅ Reset state when coming back from ResultScreen (Play Again)
  useFocusEffect(
    React.useCallback(() => {
      console.log('[NAV] HomeScreen focused — resetting state');
      setRoomCode('');
      setLoading(false);
      AsyncStorage.removeItem('roomId');
    }, []),
  );

  console.log('[INIT] Player object =>', player);

  // 🔹 CREATE ROOM
  const handleCreateRoom = async () => {
    if (loading) return;
    if (!player) {
      Alert.alert('User not found', 'Please login again.');
      console.warn('[ERROR] No player found in state');
      setLoading(false);
      return;
    }

    console.log('[ACTION] Create Room clicked');
    setLoading(true);

    const payload = { userID: player.userID, name: player.name };
    console.log('[EMIT] create_room =>', payload);

    emit('create_room', payload, async res => {
      console.log('[SOCKET_RESPONSE] create_room =>', res);
      setLoading(false);

      if (res?.success) {
        console.log('[ROOM] Room created successfully =>', res.roomId);
        await AsyncStorage.multiSet([
          ['roomId', res.roomId],
          ['role', 'host'],
        ]);

        console.log('[NAV] Navigating to ReadyToPlay (HOST waiting for GUEST)');
        navigation.navigate('ReadyToPlay', {
          roomId: res.roomId,
          host: { userID: player?.userID, name: player.name, avatar: null },
          guest: { userID: '', name: player?.name, avatar: null },
          role: 'host',
          waitingFor: 'guest',
        });
      } else {
        console.warn('[ERROR] Room creation failed =>', res);
        Alert.alert('Error', res?.message || 'Failed to create room');
      }
    });
  };

  // 🔹 JOIN ROOM
  const handleJoinRoom = async () => {
    console.log('[ACTION] Join Room clicked with code =>', roomCode);
    if (!roomCode.trim()) {
      console.warn('[VALIDATION] No room code entered');
      return Alert.alert('Enter a valid Room ID');
    }
    if (!player) {
      Alert.alert('User not found', 'Please login again.');
      console.warn('[ERROR] No player found in state');
      setLoading(false);
      return;
    }

    setLoading(true);
    const payload = {
      roomId: roomCode.trim(),
      userID: player.userID,
      name: player.name,
    };

    console.log('[EMIT] join_room =>', payload);

    emit('join_room', payload, async res => {
      console.log('[SOCKET_RESPONSE] join_room =>', res);
      setLoading(false);

      if (res?.success) {
        console.log('[ROOM] Joined room successfully =>', roomCode.trim());
        await AsyncStorage.multiSet([
          ['roomId', roomCode.trim()],
          ['role', 'guest'],
        ]);

        console.log(
          '[NAV] Navigating to ReadyToPlay (GUEST joined, waiting for HOST)',
        );
        navigation.navigate('ReadyToPlay', {
          roomId: roomCode.trim(),
          host: { userID: player?.userID, name: player.name, avatar: null },
          guest: { userID: player?.userID, name: player?.name, avatar: null },
          role: 'guest',
          waitingFor: 'host',
        });
      } else {
        console.warn('[ERROR] Join room failed =>', res);
        Alert.alert(
          'Join Failed',
          res?.message || 'Room not found or user not recognized',
        );
      }
    });
  };

  useRoomConnection('host', player?.userID || '');

  // 🔹 UI with LoveLoom Theme
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => {
                  navigation.dispatch(DrawerActions.openDrawer());
                }}
              >
                <Feather name="menu" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.logo}>
                Love<Text style={styles.logoAccent}>Loom</Text>
              </Text>
              {/* Empty view to balance the header */}
              <View style={{ width: 28 }} />
            </View>

            {/* Illustration */}
            <Image
              source={{
                uri: 'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
              }}
              resizeMode="contain"
              style={styles.image}
            />
            <Text style={styles.title}>{t('connectWithPartner')}</Text>

            {/* Actions */}
            <View style={styles.section}>
              <Text style={styles.subText}>{t('generateRoomHint')}</Text>

              <TouchableOpacity
                style={[styles.createRoomBtn, loading && styles.buttonDisabled]}
                onPress={handleCreateRoom}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Text style={styles.createRoomText}>
                  {loading ? t('creating') : t('createRoom')}
                </Text>
              </TouchableOpacity>

              <View style={styles.orContainer}>
                <View style={styles.line} />
                <Feather name="heart" size={14} color={colors.primary} />
                <Text style={styles.orText}>{t('or')}</Text>
                <Feather name="heart" size={14} color={colors.primary} />
                <View style={styles.line} />
              </View>

              <TextInput
                value={roomCode}
                onChangeText={text => {
                  setRoomCode(text);
                }}
                placeholder={t('roomCodePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
                textAlign="center"
              />

              <TouchableOpacity
                style={[styles.joinRoomBtn, loading && styles.buttonDisabled]}
                onPress={handleJoinRoom}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Text style={styles.joinRoomText}>
                  {loading ? t('joining') : t('joinRoom')}
                </Text>
              </TouchableOpacity>

              <Text style={styles.bottomText}>{t('enterPartnerRoomID')}</Text>
            </View>
          </View>
        </ScrollView>
        {!isKeyboardVisible && (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              paddingBottom: 20,
            }}
          >
            <BannerAd
              unitId={ADMOB.BANNER}
              size={BannerAdSize.BANNER}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  menuButton: {
    padding: 4,
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  logoAccent: {
    color: colors.primary,
  },
  image: {
    width: '85%',
    height: 220,
    marginTop: 30,
    borderRadius: 20,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 25,
  },
  section: {
    marginTop: 40,
    width: '85%',
    alignItems: 'center',
  },
  subText: {
    color: colors.textSecondary,
    fontSize: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  createRoomBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius || 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  createRoomText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
    width: '100%',
  },
  orText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginHorizontal: 6,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border || '#2E2E4E',
  },
  input: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius || 12,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  joinRoomBtn: {
    width: '100%',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: spacing.borderRadius || 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  joinRoomText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
