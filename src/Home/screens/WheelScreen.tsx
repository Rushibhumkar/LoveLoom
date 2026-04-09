// ------------------------------------------------------
// WheelScreen.tsx — Category selection (Spin the Wheel)
// ------------------------------------------------------
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ToastAndroid,
  BackHandler,
  StatusBar,
} from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import CustomWheel, { CustomWheelRef } from '../../components/CustomWheel';
import { useSocket } from '../../hooks/useSocket';
import { color } from '../../const/color';
import { testUrl } from '../../api/axiosInstance';
import MainContainer from '../../components/MainContainer';
import { myConsole } from '../../utils/myConsole';
import { useRoomConnection } from '../../hooks/useRoomConnection';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { roomId, userID, name, role } = route.params;
  useRoomConnection(role, userID);
  myConsole('route.params.namemeee', route.params.name);
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
  const [isSpinning, setIsSpinning] = useState(false);
  const [ready, setReady] = useState(false);
  myConsole('selectedCategoryrrr', selectedCategory);
  // ✅ Fetch categories
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${testUrl}quiz/get-categories`);
        const data = await res.json();
        const arr =
          data?.data?.categories?.map((c: any) => ({
            id: c.category_id?.toString(),
            title: c.category_name,
          })) || [];
        setCategories(arr);
      } catch (err) {
        console.error('Error fetching categories:', err);
        Alert.alert('Error', 'Failed to fetch categories.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  // ✅ Socket listeners
  useEffect(() => {
    if (!socket) return;
    console.log('[SOCKET INIT] WheelScreen listeners mounted...');

    const handleWheelSpun = (payload: any) => {
      const chosen = payload?.chosenCategory;
      const index = payload?.index;
      setIsSpinning(true);
      setSelectedCategory('Spinning...');
      if (typeof index === 'number') wheelRef.current?.spinToSegment(index);

      setTimeout(() => {
        if (chosen) {
          setSelectedCategory(chosen.title);
          setSelectedCategoryId(chosen.id);
          ToastAndroid.show(`Selected: ${chosen.title}`, ToastAndroid.SHORT);
        }
        setIsSpinning(false);
      }, 4600);
    };

    const handleStartGame = (payload: any) => {
      console.log('[EVENT] start_game =>', payload);
      navigation.navigate('QuizScreen', {
        roomId,
        userID,
        name,
        categoryId: selectedCategoryId,
        selectedCategory,
        role,
      });
    };

    socket.on('wheel_spun', handleWheelSpun);
    socket.on('start_game', handleStartGame);

    return () => {
      console.log('[CLEANUP] Removing WheelScreen listeners');
      socket.off('wheel_spun', handleWheelSpun);
      socket.off('start_game', handleStartGame);
    };
  }, [socket, selectedCategoryId]);

  // ✅ Spin (only host)
  const handleSpin = () => {
    if (role !== 'host') {
      ToastAndroid.show(t('onlyHostCanSpin'), ToastAndroid.SHORT);
      return;
    }
    if (isSpinning) return;

    setIsSpinning(true);
    const available = categories.map(c => ({ id: c.id, title: c.title }));

    emit('spin_wheel', { roomId, categories: available }, (res: any) => {
      console.log('[ACK] spin_wheel =>', res);
      if (!res?.success) {
        setIsSpinning(false);
        Alert.alert(t('spinFailedTitle'), res?.message || t('tryAgain'));
      }
      const idx = res.index;
      wheelRef.current?.spinToSegment(idx);
      setSelectedCategory('Spinning...');
    });
  };

  // ✅ READY → go to Quiz
  const handleReadyClick = () => {
    if (!selectedCategoryId) {
      ToastAndroid.show(t('selectCategoryFirst'), ToastAndroid.SHORT);
      return;
    }

    setReady(true);
    emit('ready_start', { roomId, userID, name }, (res: any) => {
      if (res?.success) {
        ToastAndroid.show(t('youAreReady'), ToastAndroid.SHORT);

        if (interstitial.loaded) {
          interstitial.show();
        }

        navigation.navigate('QuizScreen', {
          roomId,
          userID,
          name,
          categoryId: selectedCategoryId,
          selectedCategory,
          role,
        });
      } else {
        Alert.alert(t('errorTitle'), res?.message || t('failedToStart'));
      }
    });
  };

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        t('leaveRoomTitle'),
        t('leaveRoomConfirmMsg'),
        [
          { text: t('cancelButton'), style: 'cancel' },
          {
            text: t('yesButton'),
            style: 'destructive',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            },
          },
        ],
        { cancelable: true },
      );

      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => {
      backHandler.remove();
    };
  }, [navigation]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={color.primary} />
      </View>
    );

  const segments =
    categories.length > 0
      ? categories.map(c => ({ text: c.title }))
      : [{ text: 'Loading...' }];

  return (
    <MainContainer>
      <StatusBar barStyle={'dark-content'} backgroundColor={'#a8d8ff'} />
      <View style={styles.container}>
        <TouchableOpacity
          style={{
            position: 'absolute',
            left: 16,
            // backgroundColor: 'red',
            top: 12,
          }}
          onPress={() => {
            navigation
              .getParent('DrawerRoot')
              ?.dispatch(DrawerActions.openDrawer());
          }}
        >
          <Feather name="menu" size={28} color="#0b0e1eff" />
        </TouchableOpacity>
        <Text style={styles.heading}>🎡 {t('spinTheWheelTitle')}</Text>
        <View style={styles.wheelContainer}>
          <CustomWheel
            ref={wheelRef}
            segments={segments}
            segColors={[
              '#FF69B4',
              '#BA55D3',
              '#87CEEB',
              // '#87CEFA',
              '#FFB6C1',
              '#DDA0DD',
              '#F0E68C',
              '#FFA07A',
            ]}
            duration={4500}
            onFinished={seg => {
              console.log('[LOCAL] Spin finished =>', seg.text);
              setSelectedCategory(seg.text);
            }}
            // ✅ show SPIN only for host
            showButton={role === 'host'}
            buttonText={isSpinning ? 'Spinning...' : 'SPIN'}
            onButtonPress={handleSpin}
          />
        </View>

        <Text style={styles.categoryText}>
          💖 {t('selectedCategoryLabel')}{' '}
          <Text style={styles.highlight}>
            {selectedCategory !== 'None yet'
              ? `✨ ${selectedCategory}`
              : t('notSelectedYet')}
          </Text>
        </Text>

        {selectedCategoryId && !ready && (
          <TouchableOpacity style={styles.readyBtn} onPress={handleReadyClick}>
            <Text style={styles.readyText}>🚀 {t('readyToPlayButton')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </MainContainer>
  );
};

export default WheelScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a8d8ff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#101031',
    marginBottom: 10,
  },
  wheelContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    marginTop: 20,
    color: '#444',
    textAlign: 'center',
  },
  highlight: {
    fontWeight: '700',
    color: '#FF4F72',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  readyBtn: {
    backgroundColor: '#FF4F72',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 25,
    shadowColor: '#000000ff',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  readyText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
