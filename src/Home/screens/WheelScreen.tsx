// --------------------------------------------
// ✅ WheelScreen.tsx — Category selection screen (Custom Wheel with Debug Logs)
// --------------------------------------------
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import CustomWheel, { CustomWheelRef } from '../../components/CustomWheel';
import { useSocket } from '../../hooks/useSocket';
import { color } from '../../const/color';
import { testUrl } from '../../api/axiosInstance';
import Clipboard from '@react-native-clipboard/clipboard';
import { ToastAndroid, Share } from 'react-native';
import ShareLib from 'react-native-share';

interface Props {
  route: {
    params: {
      roomId: string;
      userID: string;
      name: string;
      role: 'host' | 'guest';
    };
  };
}

const WheelScreen: React.FC<Props> = ({ route }) => {
  const { roomId, userID, name, role } = route.params;
  const navigation = useNavigation<any>();
  const { socket, emit } = useSocket();
  const wheelRef = useRef<CustomWheelRef>(null);

  const [categories, setCategories] = useState<{ id: string; title: string }[]>(
    [],
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('None yet');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [partnerReady, setPartnerReady] = useState(false);
  const [bothReady, setBothReady] = useState(false);
  const [userJoined, setUserJoined] = useState(false);

  // ------------------------------------------------
  // 🧩 SOCKET EVENTS
  // ------------------------------------------------
  useEffect(() => {
    if (!socket) {
      console.log('❌ Socket not initialized yet.');
      return;
    }

    console.log('✅ Socket connected, setting up listeners...');
    console.log(`[INIT] role=${role}, roomId=${roomId}, userID=${userID}`);

    socket.on('user_joined', data => {
      console.log('🟢 [SOCKET] user_joined:', data);
      if (role === 'host') {
        setUserJoined(true);
        // Alert.alert(
        //   'User Joined',
        //   `${data?.name || 'A player'} joined your room.`,
        // );
      }
    });

    socket.on('wheel_spun', payload => {
      console.log('🌀 [SOCKET] wheel_spun received:', payload);
      const { id, title, index } = payload?.chosenCategory || {};
      if (role === 'guest' && wheelRef.current) {
        console.log('🎯 Guest spinning to index:', index);
        setSelectedCategory('Spinning...');
        wheelRef.current.spinToSegment(index);
        setTimeout(() => {
          setSelectedCategory(title);
          setSelectedCategoryId(id);
          console.log('✅ Guest selected category:', title);
        }, 3000);
      }
    });

    socket.on('start_game', () => {
      console.log(
        '🚀 [SOCKET] start_game triggered, navigating to QuizScreen...',
      );
      navigation.navigate('QuizScreen', {
        roomId,
        userID,
        categoryId: selectedCategoryId,
        name,
        role,
      });
    });

    return () => {
      console.log('🔴 Cleaning up socket listeners...');
      socket.off('user_joined');
      socket.off('wheel_spun');
      socket.off('start_game');
    };
  }, [socket, selectedCategoryId]);

  // ------------------------------------------------
  // 🧠 FETCH CATEGORIES
  // ------------------------------------------------
  useEffect(() => {
    console.log('📦 Fetching categories from API...');
    (async () => {
      try {
        const res = await fetch(`${testUrl}quiz/get-categories`);
        const data = await res.json();
        console.log('✅ [API] Categories fetched:', data);
        const arr =
          data?.data?.categories?.map((c: any) => ({
            id: c.category_id?.toString(),
            title: c.category_name,
          })) || [];
        setCategories(arr);
      } catch (e) {
        console.log('❌ [API ERROR] Failed to fetch categories:', e);
        Alert.alert('Error', 'Failed to fetch categories.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ------------------------------------------------
  // 🎡 HANDLE SPIN — HOST ONLY
  // ------------------------------------------------
  const handleSpin = () => {
    if (role !== 'host') {
      console.log('⚠️ Non-host tried to spin.');
      return;
    }
    if (!categories.length) {
      console.log('⚠️ No categories to spin.');
      // return Alert.alert('No categories found.');
    }

    console.log('🎡 [ACTION] Host initiated spin...');
    const available = categories.map((c, i) => ({
      id: c.id,
      title: c.title,
      index: i,
    }));
    console.log('📜 [DATA] Available categories:', available);

    emit('spin_wheel', { roomId, categories: available }, (res: any) => {
      console.log('📨 [EMIT_ACK] spin_wheel response:', res);
      if (!res?.success) {
        console.log('❌ Spin failed, reason:', res?.message);
        return Alert.alert('Error', 'Spin failed.');
      }

      const chosen = res.chosenCategory;
      const chosenIndex = available.findIndex(c => c.id === chosen.id);
      console.log(
        '🎯 [SPIN RESULT] Chosen category:',
        chosen,
        'Index:',
        chosenIndex,
      );

      wheelRef.current?.spinToSegment(chosenIndex);

      setTimeout(() => {
        setSelectedCategory(chosen.title);
        setSelectedCategoryId(chosen.id);
        console.log('✅ [HOST] Final selected category:', chosen.title);

        emit('wheel_spun', {
          roomId,
          chosenCategory: { ...chosen, index: chosenIndex },
        });
        console.log('📡 [EMIT] wheel_spun sent to guests.');
      }, 3000);
    });
  };

  // ------------------------------------------------
  // ✅ READY HANDLER
  // ------------------------------------------------
  const handleReady = () => {
    if (!selectedCategoryId) {
      console.log('⚠️ Tried to ready up before selection.');
      return Alert.alert('Wait until selection.');
    }

    console.log('✅ [ACTION] Player marked ready.');
    setReady(true);
    emit('ready_start', { roomId, userID }, (res: any) => {
      console.log('📡 [EMIT_ACK] ready_start response:', res);
    });
  };

  // ------------------------------------------------
  // 🚀 START GAME WHEN BOTH READY
  // ------------------------------------------------
  useEffect(() => {
    if (ready && partnerReady && selectedCategoryId) {
      console.log('✅ [READY STATE] Both players ready. Starting game...');
      setBothReady(true);
      if (role === 'host') {
        emit('start_game', { roomId });
        console.log('📡 [EMIT] start_game sent by host.');
      }
    }
  }, [ready, partnerReady, selectedCategoryId]);

  // ------------------------------------------------
  // 🌀 LOADING
  // ------------------------------------------------
  if (loading) {
    console.log('⏳ Still loading categories...');
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={color.primary} />
        <Text style={{ color: '#555', marginTop: 10 }}>
          Loading categories...
        </Text>
      </View>
    );
  }

  const segments =
    categories.length > 0
      ? categories.map(c => ({ text: c.title }))
      : [{ text: 'Loading...' }];

  console.log('🧩 [UI] Segments to render:', segments.length);

  // ------------------------------------------------
  // 🎨 UI RENDER
  // ------------------------------------------------
  return (
    <View style={styles.container}>
      {role === 'host' && (
        <>
          {/* <View style={styles.roomInfo}>
            <Text style={styles.roomText}>Room ID: {roomId}</Text>
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Copied');
                console.log('📋 Room ID copied:', roomId);
              }}
              style={styles.copyIcon}
            >
              <Ionicons name="copy-outline" size={18} color="#101031" />
            </TouchableOpacity>
          </View>
          {!userJoined && (
            <Text style={styles.waitingText}>
              ⏳ Waiting for the other user...
            </Text>
          )} */}

          <View style={styles.roomInfo}>
            <Text style={styles.roomText}>Room ID: {roomId}</Text>

            {/* 📋 Copy to Clipboard */}
            <TouchableOpacity
              onPress={() => {
                Clipboard.setString(roomId);
                ToastAndroid.show(
                  'Room ID copied to clipboard',
                  ToastAndroid.SHORT,
                );
                console.log('📋 Copied Room ID:', roomId);
              }}
              style={styles.iconButton}
            >
              <Ionicons name="copy-outline" size={18} color="#101031" />
            </TouchableOpacity>

            {/* 📤 Share Room Code */}
            <TouchableOpacity
              onPress={async () => {
                try {
                  await ShareLib.open({
                    title: 'Share Room ID',
                    message: `Join my quiz room on CupidFlow!\nRoom ID: ${roomId}`,
                  });
                  console.log('✅ Shared Room ID:', roomId);
                } catch (err) {
                  console.log('❌ Share cancelled or failed:', err);
                }
              }}
              style={styles.iconButton}
            >
              <Ionicons name="share-social-outline" size={18} color="#101031" />
            </TouchableOpacity>
          </View>
        </>
      )}

      <Text style={styles.heading}>🎡 Spin the Wheel</Text>

      <View style={styles.wheelContainer}>
        <CustomWheel
          ref={wheelRef}
          segments={segments}
          segColors={[
            '#FF4F72',
            '#101031',
            '#6D8CEF',
            '#FFA500',
            '#008000',
            '#9B59B6',
          ]}
          duration={5000}
          onFinished={seg => {
            console.log('🏁 [WHEEL FINISHED] Selected segment:', seg.text);
            setSelectedCategory(seg.text);
          }}
          showButton={role === 'host'}
          buttonText="SPIN"
          onButtonPress={role === 'host' ? handleSpin : undefined}
        />
      </View>

      <Text style={styles.categoryText}>
        Selected Category:{' '}
        <Text style={styles.highlight}>
          {selectedCategory !== 'None yet' ? selectedCategory : '—'}
        </Text>
      </Text>

      {selectedCategoryId && (
        <TouchableOpacity
          style={[styles.readyBtn, ready && { opacity: 0.6 }]}
          onPress={handleReady}
          disabled={ready}
        >
          <Text style={styles.readyText}>
            {ready ? 'You are Ready (Waiting...)' : 'I am Ready'}
          </Text>
        </TouchableOpacity>
      )}

      {bothReady && (
        <Text style={[styles.partnerTextGreen, { marginBottom: 40 }]}>
          Starting Quiz...
        </Text>
      )}
    </View>
  );
};

export default WheelScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a8d8ffff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 30,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#101031',
  },
  wheelContainer: {
    marginTop: 30,
  },
  categoryText: {
    fontSize: 14,
    marginTop: 20,
    color: '#666',
  },
  highlight: {
    fontWeight: '700',
    color: '#FF4F72',
  },
  readyBtn: {
    marginTop: 25,
    backgroundColor: '#FF4F72',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 60,
    elevation: 5,
  },
  readyText: {
    fontWeight: '700',
    color: '#fff',
    fontSize: 16,
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  roomText: {
    fontSize: 14,
    color: '#101031',
    fontWeight: '600',
  },
  copyIcon: {
    marginLeft: 6,
    padding: 4,
  },
  iconButton: {
    marginLeft: 8,
    padding: 6,
    backgroundColor: '#ffffffaa',
    borderRadius: 8,
    elevation: 2,
  },
  waitingText: {
    fontSize: 13,
    color: '#6D6D8D',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  partnerTextGreen: {
    marginTop: 20,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
});
