// --------------------------------------------------------
// HomeScreen.tsx — entry screen for room creation / joining
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
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-4770155226662571/1156444855';

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
});

const HomeScreen = () => {
  const { t } = useTranslation();
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { emit } = useSocket();

  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        console.log('Ad Loaded');
      },
    );

    interstitial.load();

    return unsubscribe;
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
        if (interstitial.loaded) {
          interstitial.show();
        }
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
        if (interstitial.loaded) {
          interstitial.show();
        }
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

  // 🔹 UI
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#101031" />

      {/* ✅ Added wrapper for keyboard handling */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={{ position: 'absolute', left: 0 }}
                onPress={() => {
                  // console.log('[UI] Drawer menu opened');
                  navigation.dispatch(DrawerActions.openDrawer());
                }}
              >
                <Feather name="menu" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.logo}>
                Cupid<Text style={styles.logoAccent}>Flow</Text>
              </Text>
            </View>

            {/* Illustration */}
            <Image
              source={{
                uri: 'https://img.freepik.com/free-vector/boy-girl-with-chat-bubble-message_24877-53848.jpg?semt=ais_hybrid&w=740&q=80',
              }}
              resizeMode="contain"
              style={styles.image}
            />

            <Text style={styles.title}>{t('connectWithPartner')}</Text>

            {/* Actions */}
            <View style={styles.section}>
              <Text style={styles.subText}>{t('generateRoomHint')}</Text>

              <TouchableOpacity
                style={[styles.createRoomBtn, loading && { opacity: 0.6 }]}
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
                <Text style={styles.orText}>{t('or')}</Text>
                <View style={styles.line} />
              </View>

              <TextInput
                value={roomCode}
                onChangeText={text => {
                  // console.log('[INPUT] Room code changed =>', text);
                  setRoomCode(text);
                }}
                placeholder={t('roomCodePlaceholder')}
                placeholderTextColor="#A5A5B5"
                style={styles.input}
                textAlign="center"
              />

              <TouchableOpacity
                style={[styles.joinRoomBtn, loading && { opacity: 0.6 }]}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#101031' },
  container: { flex: 1, alignItems: 'center' },
  header: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    alignSelf: 'center',
  },
  logoAccent: { color: '#FF4F72' },
  image: { width: '85%', height: 220, marginTop: 30 },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 25,
  },
  section: { marginTop: 40, width: '85%', alignItems: 'center' },
  subText: {
    color: '#BFBFD3',
    fontSize: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  createRoomBtn: {
    width: '100%',
    backgroundColor: '#FF4F72',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  createRoomText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
    width: '100%',
  },
  orText: { color: '#D9D9E3', fontSize: 12, marginHorizontal: 8 },
  line: { flex: 1, height: 1, backgroundColor: '#2E2E4E' },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#101031',
    paddingVertical: 12,
    marginBottom: 18,
  },
  joinRoomBtn: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#FF4F72',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  joinRoomText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  bottomText: { color: '#A5A5B5', fontSize: 12, marginTop: 8 },
});
