// ------------------------------------------------------
// ReadyToPlay.tsx — Waiting screen before the quiz starts
// Modern UI with flexbox only
// ------------------------------------------------------
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ToastAndroid,
  Alert,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Clipboard from '@react-native-clipboard/clipboard';
import ShareLib from 'react-native-share';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useSocket } from '../../hooks/useSocket';
import MainContainer from '../../components/MainContainer';
import { myConsole } from '../../utils/myConsole';
import { useRoomConnection } from '../../hooks/useRoomConnection';
import Feather from 'react-native-vector-icons/Feather';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '../../utils/theme'; // adjust path as needed

interface PlayerData {
  userID: string;
  name: string;
  avatar?: string | null;
}

interface Props {
  route: {
    params: {
      roomId: string;
      host: PlayerData;
      guest: PlayerData;
      role: 'host' | 'guest';
      waitingFor: string;
    };
  };
}

const ReadyToPlay: React.FC<Props> = ({ route }) => {
  const { roomId, host, guest, role, waitingFor } = route.params;
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { socket } = useSocket();
  useRoomConnection(role, role === 'host' ? host.userID : guest.userID);
  console.log('routeparmsss', route.params);
  const [hostData, setHostData] = useState<PlayerData>(host);
  const [guestData, setGuestData] = useState<PlayerData>(guest);
  const [waitingText, setWaitingText] = useState(
    role === 'host' ? t('waitingForGuest') : t('waitingForHost'),
  );

  myConsole('waitingForffff', waitingFor);
  myConsole('waitingtesxdttt', waitingText);
  const hasNavigated = useRef(false);

  // ------------------------------------------------------
  // SOCKET EVENT HANDLERS
  // ------------------------------------------------------
  useEffect(() => {
    if (!socket) return;
    console.log(`[SOCKET] ReadyToPlay mounted for role=${role}`);

    socket.on('user_joined', (data: any) => {
      console.log('[EVENT] user_joined =>', data);

      // HOST → navigate when guest joins
      if (role === 'host' && !hasNavigated.current) {
        const joinedGuest: PlayerData = {
          userID: data?.userID || '',
          name:
            `${data?.userFirstName || ''} ${data?.userSurname || ''}`.trim() ||
            data?.name ||
            'Guest',
          avatar: data?.userAvatar || null,
        };
        setGuestData(joinedGuest);
        setWaitingText(t('guestJoinedStart'));
        hasNavigated.current = true;

        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'WheelScreen',
              params: {
                roomId,
                userID: host.userID,
                name: host.name,
                role,
              },
            },
          ],
        });
      }

      // GUEST → navigate when host confirms join
      if (role === 'guest' && !hasNavigated.current) {
        setHostData({
          userID: data?.hostId || data?.userID || '',
          name:
            data?.hostName ||
            data?.name ||
            `${data?.userFirstName || ''} ${data?.userSurname || ''}`.trim() ||
            'Host',
          avatar: data?.hostAvatar || null,
        });
        setWaitingText('Host found! Starting game...');

        // Wait until socket reconnects (if it does) before navigating
        setTimeout(() => {
          if (socket.connected && !hasNavigated.current) {
            hasNavigated.current = true;
            console.log('[NAVIGATE] Guest -> WheelScreen, socket:', socket.id);
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'WheelScreen',
                  params: {
                    roomId,
                    userID: guest.userID,
                    name: guest.name,
                    role,
                  },
                },
              ],
            });
          } else {
            console.warn('[WAIT] Socket not ready yet, delaying navigation...');
          }
        }, 500);
      }
    });

    socket.on('joined_room', data => {
      console.log('[EVENT] joined_room =>', data);
    });

    socket.on('guest_left', () => {
      Alert.alert(t('guestLeftTitle'));
      setWaitingText(t('guestLeftWaiting'));
      hasNavigated.current = false;
    });

    socket.on('host_left', () => {
      Alert.alert(t('hostLeftTitle'));
      navigation.goBack();
      hasNavigated.current = false;
    });

    return () => {
      socket.off('user_joined');
      socket.off('joined_room');
      socket.off('guest_left');
      socket.off('host_left');
    };
  }, [socket, role]);

  // ✅ Auto-navigate guest immediately after join (no waiting for host)
  useEffect(() => {
    if (role === 'guest' && !hasNavigated.current) {
      setTimeout(() => {
        if (socket.connected) {
          hasNavigated.current = true;
          console.log('[AUTO] Guest joined → navigating to WheelScreen');
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'WheelScreen',
                params: {
                  roomId,
                  userID: guest.userID,
                  name: guest.name,
                  role,
                },
              },
            ],
          });
        }
      }, 500);
    }
  }, [role, socket]);

  // ------------------------------------------------------
  // UTILS
  // ------------------------------------------------------
  const handleCopy = () => {
    Clipboard.setString(roomId);
    ToastAndroid.show('Room ID copied!', ToastAndroid.SHORT);
  };

  const handleShare = async () => {
    try {
      await ShareLib.open({
        title: 'Share Room ID',
        message: `${roomId}`,
      });
    } catch {
      ToastAndroid.show('Share cancelled.', ToastAndroid.SHORT);
    }
  };

  return (
    <MainContainer>
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background}
        />

        {/* Header with menu button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              navigation
                .getParent('DrawerRoot')
                ?.dispatch(DrawerActions.openDrawer());
            }}
          >
            <Feather name="menu" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('readyToPlayTitle')}</Text>
          <View style={{ width: 32 }} />
        </View>

        <Text style={styles.subtitle}>{t('readyToPlaySubtitle')}</Text>

        {/* VS Card */}
        <View style={styles.vsCard}>
          <View style={styles.player}>
            <Image
              source={{
                uri:
                  hostData.avatar ||
                  'https://cdn-icons-png.flaticon.com/512/149/149071.png',
              }}
              style={styles.avatar}
            />
            <Text style={styles.name}>{hostData.name || t('host')}</Text>
          </View>

          <View style={styles.vsBadge}>
            <Text style={styles.vsText}>{t('vs')}</Text>
          </View>

          <View style={styles.player}>
            <Image
              source={{
                uri:
                  guestData.avatar ||
                  'https://cdn-icons-png.flaticon.com/512/149/149071.png',
              }}
              style={styles.avatar}
            />
            <Text style={styles.name}>
              {waitingFor === 'guest'
                ? t('guest')
                : guestData.name || t('guest')}
            </Text>
          </View>
        </View>

        {/* Room ID Section (Host only) */}
        {role === 'host' && (
          <View style={styles.roomCard}>
            <Text style={styles.roomLabel}>{t('roomIdLabel')}</Text>
            <Text style={styles.roomCode}>{roomId}</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={handleCopy}
                style={styles.actionButton}
              >
                <Ionicons
                  name="copy-outline"
                  size={18}
                  color={colors.textPrimary}
                />
                <Text style={styles.buttonText}>{t('copyCode')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                style={styles.actionButton}
              >
                <Ionicons
                  name="share-social-outline"
                  size={18}
                  color={colors.textPrimary}
                />
                <Text style={styles.buttonText}>{t('shareCode')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Waiting Message */}
        <Text style={styles.waitText}>{waitingText}</Text>
      </View>
    </MainContainer>
  );
};

export default ReadyToPlay;

// ------------------------------------------------------
// Modern Styles (flexbox only, no absolute positioning)
// ------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  menuButton: {
    padding: 8,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
  },
  vsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundLight,
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 20,
    width: '100%',
    marginBottom: 32,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  player: {
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.primary,
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  vsBadge: {
    backgroundColor: colors.primary,
    borderRadius: 40,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  vsText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  roomCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  roomLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  roomCode: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  waitText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
