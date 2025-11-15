// hooks/useRoomConnection.ts
import { useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useSocket } from './useSocket';
import { myConsole } from '../utils/myConsole';

export const useRoomConnection = (role: 'host' | 'guest', userID: string) => {
  const { socket, emit } = useSocket();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!socket) return;

    const handleReconnect = async () => {
      const savedRoomId = await AsyncStorage.getItem('roomId');
      if (savedRoomId) {
        myConsole('🔄 Reconnecting to room:', savedRoomId);
        emit(
          'reconnect_room',
          { roomId: savedRoomId, userID, role },
          (res: any) => {
            myConsole('🧩 Reconnect response =>', res);
            if (!res?.success) {
              AsyncStorage.removeItem('roomId');
              Alert.alert('Room expired', 'Please create or join again.');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            }
          },
        );
      }
    };

    // When socket connects (first or after disconnection)
    socket.on('connect', handleReconnect);

    // Opposite user left
    socket.on('guest_left', () => {
      Alert.alert('Guest Left', 'Your guest has left the room.');
      //   AsyncStorage.removeItem('roomId');
      //   navigation.reset({
      //     index: 0,
      //     routes: [{ name: 'Home' }],
      //   });
    });

    socket.on('host_left', () => {
      Alert.alert('Host Left', 'Your host has left the room.');
      //   AsyncStorage.removeItem('roomId');
      //   navigation.reset({
      //     index: 0,
      //     routes: [{ name: 'Home' }],
      //   });
    });

    // Cleanup
    return () => {
      socket.off('connect', handleReconnect);
      socket.off('guest_left');
      socket.off('host_left');
    };
  }, [socket, role, userID]);
};
