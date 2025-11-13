// ------------------------------------------------------
// ReadyToPlay.tsx — Waiting screen before the quiz starts
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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Clipboard from '@react-native-clipboard/clipboard';
import ShareLib from 'react-native-share';
import { useNavigation } from '@react-navigation/native';
import { useSocket } from '../../hooks/useSocket';
import MainContainer from '../../components/MainContainer';
import { myConsole } from '../../utils/myConsole';

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
  const { socket } = useSocket();
  console.log('routeparmsss', route.params);
  const [hostData, setHostData] = useState<PlayerData>(host);
  const [guestData, setGuestData] = useState<PlayerData>(guest);
  const [waitingText, setWaitingText] = useState(
    role === 'host' ? 'Waiting for guest to join...' : 'Waiting for host...',
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
        setWaitingText('Guest joined! Starting game...');
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
      Alert.alert('Guest left the room.');
      setWaitingText('Guest left. Waiting for another guest...');
      hasNavigated.current = false;
    });

    socket.on('host_left', () => {
      Alert.alert('Host left. Room closed.');
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
        message: `Join my Lovify room!\nRoom ID: ${roomId}`,
      });
    } catch {
      ToastAndroid.show('Share cancelled.', ToastAndroid.SHORT);
    }
  };

  // ------------------------------------------------------
  // UI
  // ------------------------------------------------------
  return (
    <MainContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Are you ready to play?</Text>
        <Text style={styles.subtitle}>True fun begins with true love 💞</Text>

        {role === 'host' && (
          <View style={styles.roomRow}>
            <Text style={styles.roomText}>Room ID: {roomId}</Text>
            <TouchableOpacity onPress={handleCopy} style={styles.iconBtn}>
              <Ionicons name="copy-outline" size={18} color="#101031" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
              <Ionicons name="share-social-outline" size={18} color="#101031" />
            </TouchableOpacity>
          </View>
        )}

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
            <Text style={styles.name}>{hostData.name || 'Host'}</Text>
          </View>

          <Text style={styles.vsText}>VS</Text>

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
              {waitingFor === 'guest' ? 'Guest' : ''}
            </Text>
          </View>
        </View>

        <Text style={styles.waitText}>{waitingText}</Text>
      </View>
    </MainContainer>
  );
};

export default ReadyToPlay;

// ------------------------------------------------------
// Styles
// ------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefafc',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#101031',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#707070',
    marginBottom: 30,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  roomText: {
    fontSize: 14,
    color: '#101031',
    fontWeight: '600',
  },
  iconBtn: {
    marginLeft: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
    padding: 6,
  },
  vsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8e8ed9',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 40,
  },
  player: { alignItems: 'center', marginHorizontal: 10 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 8,
  },
  name: { color: '#fff', fontSize: 14, fontWeight: '600' },
  vsText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginHorizontal: 12,
  },
  waitText: { color: '#888', fontSize: 13, marginTop: 10 },
});
