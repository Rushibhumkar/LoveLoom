import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { storeData, storeDataJson } from '../../hooks/useAsyncStorage';
import MainContainer from '../../components/MainContainer';
import { useTranslation } from 'react-i18next';
import { API_AXIOS, WEB_CLIENT_ID } from '../../api/axiosInstance';
import axios from 'axios';
import { myConsole } from '../../utils/myConsole';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FinalScreenProps {
  onPrev: () => void;
  onLogin: () => void;
}

const FinalScreen: React.FC<FinalScreenProps> = ({ onPrev, onLogin }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  console.log('reached');

  const handleGoogleLogin = async () => {
    try {
      console.log('[DEBUG] Starting Google Sign-In...');
      setLoading(true);

      // Ensure Google Play Services are available
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Trigger Google Sign-In
      const signInResult = await GoogleSignin.signIn();

      // Debug logs to inspect the sign-in result
      console.log(
        '[DEBUG] Full Google signInResult:',
        JSON.stringify(signInResult, null, 2),
      );
      console.log('[DEBUG] Extracted idToken:', signInResult?.data?.idToken);
      console.log('[DEBUG] User object:', signInResult?.data?.user);

      const idToken = signInResult?.data?.idToken;
      const user = signInResult?.data?.user;

      // Check if token is missing → frontend issue
      if (!idToken) {
        console.error(
          '[ERROR] No ID token from Google — problem is FRONTEND (React Native side).',
        );
        throw new Error('Google Sign-In failed — no ID token received.');
      }

      console.log('[DEBUG] Got valid idToken, proceeding to backend...');
      console.log('[DEBUG] Google User Info:', user);

      const response = await API_AXIOS.post('/users/google-login', {
        credential: idToken,
      });

      console.log(
        '[DEBUG] Backend raw response:',
        JSON.stringify(response.data, null, 2),
      );

      // ✅ If backend confirms success
      if (response.data?.status) {
        const { accessToken, refreshToken, userData } = response.data.data;
        myConsole('userDasdfdsf', userData?.data);

        await storeData('authToken', accessToken);
        await storeData('refreshToken', refreshToken);
        await storeDataJson('user', userData);

        console.log('[DEBUG] Tokens and user saved locally ✅');
        onLogin();
        return;
      }

      throw new Error(response.data?.msg || 'Google Sign-In failed');
    } catch (error: any) {
      // Log full error trace
      console.error('[TRACE ERROR ORIGIN]', error.stack);
      console.log('[ERROR] Google Sign-In or Backend Error:', error);
      console.log(
        '[ERROR DETAILS]',
        error.response?.data || error.message || JSON.stringify(error, null, 2),
      );

      // Handle known Google Sign-In errors
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Cancelled', 'Google Sign-In was cancelled.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Play services not available or outdated.');
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.msg ||
            error.message ||
            'Something went wrong during Google Sign-In.',
        );
      }
    } finally {
      console.log('[DEBUG] Google Sign-In process completed.');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[DEBUG] Configuring Google Sign-In...');
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  return (
    <MainContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { width: screenWidth }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.logo}>
              Cupid<Text style={styles.logoAccent}>Flow</Text>
            </Text>
            <Text style={styles.tagline}>{t('tagline')}</Text>
          </View>

          {/* Illustration Section */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require('../../assets/images/onboarding3.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* Footer Section */}
          <View style={styles.footer}>
            <View style={styles.footerContent}>
              <Text style={styles.welcomeText}>
                {t('madeWith')} <Text style={styles.heart}>💖</Text>
                {'\n'}
                {t('forAmazing')}{' '}
                <Text style={styles.highlight}>{t('couples')}</Text>
              </Text>

              {/* Login Buttons Container */}
              <View style={styles.buttonsContainer}>
                {/* Credentials Login Button */}

                {/* Google Login Button */}
                <TouchableOpacity
                  style={[
                    styles.googleButton,
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={handleGoogleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <View style={styles.buttonContent}>
                      <AntDesign name="google" size={20} color="#fff" />
                      <Text style={styles.googleText}>
                        {t('continueWithGoogle')}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Username Login Bottom Sheet */}
          {/* {showLoginBottom && (
            <UsernameLoginBottom
              onClose={() => setShowLoginBottom(false)}
              onLogin={onLogin}
            />
          )} */}
        </ScrollView>
      </KeyboardAvoidingView>
    </MainContainer>
  );
};

export default FinalScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0D0D1C',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  logo: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
  },
  logoAccent: {
    color: '#FF5277',
  },
  tagline: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  illustration: {
    width: screenWidth * 0.85,
    height: screenHeight * 0.3,
    maxHeight: 280,
  },
  footer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  footerContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 32,
  },
  heart: {
    color: '#FF5277',
  },
  highlight: {
    color: '#FF5277',
    fontWeight: '800',
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  credentialsButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF5277',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#FF5277',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  googleButton: {
    backgroundColor: '#FF5277',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#FF5277',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  credentialsText: {
    color: '#FF5277',
    fontSize: 16,
    fontWeight: '600',
  },
  googleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 16,
  },
  guestButton: {
    paddingVertical: 12,
  },
  guestText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  termsText: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    width: '90%',
  },
  link: {
    color: '#FF5277',
    fontWeight: '500',
  },
});
