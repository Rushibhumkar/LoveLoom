import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import CustomAvatar from '../components/CustomAvatar';
import { getUserData, useUserData } from '../api/userApi';
import { myConsole } from '../utils/myConsole';
import { useTranslation } from 'react-i18next';
import { HOST } from '../api/axiosInstance';

// Drawer route types
type DrawerParamList = {
  HomeScreen: undefined;
  SettingsScreen: undefined;
  AboutUs: undefined;
  ContactUs: undefined;
};

type RootStackParamList = {
  Onboarding: undefined;
  Home: { screen?: keyof DrawerParamList };
};

interface Props {
  onLogout: () => void;
}

const DrawerContent: React.FC<Props> = ({ onLogout }) => {
  const { t } = useTranslation();

  // ✅ correct type for drawer navigation
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const { data: userRaw, loading, error } = useUserData();
  const user = userRaw?.data ? userRaw.data : userRaw;
  myConsole('data', user);

  myConsole('loading', loading);
  myConsole('error', error);
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <CustomAvatar
          imageUrl={
            user?.profilePic?.startsWith('http')
              ? user.profilePic
              : `${HOST}${user?.profilePic || ''}`
          }
          name={
            `${user?.userFirstName || ''} ${user?.userSurname || ''}`.trim() ||
            'User'
          }
          size={65}
        />

        <Text style={styles.name}>
          {`${user?.userFirstName || ''} ${user?.userSurname || ''}`.trim() ||
            'User'}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Menu items */}

      <TouchableOpacity
        style={styles.menuItem}
        // onPress={() =>
        //   navigation.navigate('Home', { screen: 'SettingsScreen' })
        // }
      >
        <MaterialIcons name="workspace-premium" size={20} color="#FF4F72" />
        <Text style={styles.menuText}>{t('premium')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        // onPress={() =>
        //   navigation.navigate('Home', { screen: 'SettingsScreen' })
        // }
      >
        <MaterialIcons name="history" size={20} color="#FF4F72" />
        <Text style={styles.menuText}>{t('history')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        // onPress={() =>
        //   navigation.navigate('Home', { screen: 'SettingsScreen' })
        // }
      >
        <MaterialIcons name="list-alt" size={20} color="#FF4F72" />
        <Text style={styles.menuText}>{t('profile')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() =>
          navigation.navigate('Home', { screen: 'SettingsScreen' })
        }
      >
        <Feather name="settings" size={20} color="#FF4F72" />
        <Text style={styles.menuText}>{t('settings')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Home', { screen: 'AboutUs' })}
      >
        <Feather name="info" size={20} color="#FF4F72" />
        <Text style={styles.menuText}>{t('aboutUs')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Home', { screen: 'ContactUs' })}
      >
        <MaterialIcons name="mail-outline" size={20} color="#FF4F72" />
        <Text style={styles.menuText}>{t('contactUs')}</Text>
      </TouchableOpacity>

      <View style={styles.dividerLight} />

      <TouchableOpacity
        style={styles.menuItem}
        onPress={async () => {
          Alert.alert(
            t('leaveRoomTitle'),
            t('leaveRoomConfirmMsg'),
            [
              { text: t('cancelButton'), style: 'cancel' },
              {
                text: t('yesButton'),
                style: 'destructive',
                onPress: async () => {
                  await AsyncStorage.removeItem('roomId'); // ✅ clear saved room
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }], // ✅ go back to home
                  });
                },
              },
            ],
            { cancelable: true },
          );
        }}
      >
        <Ionicons name="exit-outline" size={20} color="#FF4F72" />
        <Text style={styles.menuText}>{t('exitRoom')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
          Alert.alert(
            t('logoutTitle'),
            t('logoutConfirmMsg'),
            [
              { text: t('cancelButton'), style: 'cancel' },
              {
                text: t('logout'),
                style: 'destructive',
                onPress: async () => {
                  try {
                    await AsyncStorage.clear();
                    console.log('✅ AsyncStorage cleared');
                    onLogout();
                  } catch (error) {
                    console.log('❌ Error clearing storage:', error);
                  }
                },
              },
            ],
            { cancelable: true },
          );
        }}
      >
        <AntDesign name="logout" size={20} color="#FF4F72" />
        <Text style={[styles.menuText, { color: '#444' }]}>{t('logout')}</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.versionText}>{t('versionLabel')} 9.0.2</Text>
      </View>
    </SafeAreaView>
  );
};

export default DrawerContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4F3',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'flex-start',
    marginTop: 40,
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 50,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#F4C2C3',
    marginVertical: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
    paddingHorizontal: 8,
  },
  menuText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginLeft: 15,
  },
  dividerLight: {
    height: 1,
    backgroundColor: '#F0DADA',
    marginVertical: 10,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 15,
  },
  versionText: {
    color: '#888',
    fontSize: 12,
  },
});
