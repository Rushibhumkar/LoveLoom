import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AppNavigator from './src/AppNavigator';
import { getData } from './src/hooks/useAsyncStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './src/i18n';
import { WEB_CLIENT_ID } from './src/api/axiosInstance';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [langReady, setLangReady] = useState(false);

  // ✅ Configure Google Sign-In once
  useEffect(() => {
    console.log('[DEBUG] Configuring Google Sign-In...');
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });

    checkLoginStatus();
  }, []);

  // ✅ Load selected language
  useEffect(() => {
    (async () => {
      try {
        const savedLang = await getData('appLanguage');
        if (savedLang) {
          await i18n.changeLanguage(savedLang);
          console.log(`[DEBUG] Language loaded: ${savedLang}`);
        }
      } catch (err) {
        console.warn('[WARN] Language loading failed:', err);
      } finally {
        setLangReady(true);
      }
    })();
  }, []);

  // ✅ Check if user is already logged in
  const checkLoginStatus = async () => {
    try {
      console.log('[DEBUG] Checking login status...');
      const googleUser = await GoogleSignin.getCurrentUser();
      const token = await getData('authToken');

      if (token || googleUser) {
        console.log('[DEBUG] User already logged in');
        setIsLoggedIn(true);
      } else {
        console.log('[DEBUG] No active login found');
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('[ERROR] Checking login status failed:', error);
      setIsLoggedIn(false);
    }
  };

  // ✅ Called when user logs in (navigates to Home)
  const handleLogin = () => {
    console.log('[DEBUG] Login successful — navigating to HomeScreen...');
    setIsLoggedIn(true);
  };

  // ✅ Called when user logs out
  const handleLogout = async () => {
    try {
      console.log('[DEBUG] Logging out user...');
      await GoogleSignin.signOut();
      await AsyncStorage.clear();
      console.log('[DEBUG] Logged out and storage cleared.');
    } catch (e) {
      console.warn('Error signing out:', e);
    }
    setIsLoggedIn(false);
  };

  // ✅ Show loader while checking login or language setup
  if (isLoggedIn === null || !langReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0D0D1C',
        }}
      >
        <ActivityIndicator size="large" color="#FF5277" />
      </View>
    );
  }

  // ✅ Render main navigator
  return (
    <SafeAreaProvider>
      <AppNavigator
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
    </SafeAreaProvider>
  );
};

export default App;
