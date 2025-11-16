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
import UsernameLoginBottom from '../../components/UsernameLoginBottom';
import { storeData, storeDataJson } from '../../hooks/useAsyncStorage';
import MainContainer from '../../components/MainContainer';
import { useTranslation } from 'react-i18next';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FinalScreenProps {
  onPrev: () => void;
  onLogin: () => void;
}

const FinalScreen: React.FC<FinalScreenProps> = ({ onPrev, onLogin }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showLoginBottom, setShowLoginBottom] = useState(false);

  console.log('reached');

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      // Ensure play services available
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Try sign-in
      const { data } = await GoogleSignin.signIn();

      // ✅ Dummy handling for now — no backend
      console.log('Google User Info:', data);
      Alert.alert(
        'Welcome!',
        `Hello ${data?.user.name || 'User'} 👋\nEmail: ${data?.user.email}`,
      );
      onLogin();
    } catch (error: any) {
      console.log('Google Sign-In Error:', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Cancelled', 'Google Sign-In was cancelled.');
      } else {
        Alert.alert('Error', 'Something went wrong during Google Sign-In.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // 🔑 from Firebase console
      offlineAccess: true,
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
                <TouchableOpacity
                  style={styles.credentialsButton}
                  onPress={() => setShowLoginBottom(true)}
                >
                  <View style={styles.buttonContent}>
                    <Feather name="user" size={20} color="#FF5277" />
                    <Text style={styles.credentialsText}>
                      {t('loginWithCredentials')}
                    </Text>
                  </View>
                  <Feather name="arrow-right" size={18} color="#FF5277" />
                </TouchableOpacity>

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

                {/* Divider */}
                {/* <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t('or')}</Text>
                  <View style={styles.dividerLine} />
                </View> */}

                {/* Guest Option */}
                {/* <TouchableOpacity style={styles.guestButton}>
                  <Text style={styles.guestText}>{t('continueAsGuest')}</Text>
                </TouchableOpacity> */}
              </View>

              {/* Terms & Conditions */}
              {/* <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.link}>Privacy Policy</Text> and{' '}
                <Text style={styles.link}>Terms & Conditions</Text>
              </Text> */}

              {/* <Text style={styles.termsText}>
                {t('privacyPolicy')} & {t('termsConditions')}
              </Text> */}
            </View>
          </View>

          {/* Username Login Bottom Sheet */}
          {showLoginBottom && (
            <UsernameLoginBottom
              onClose={() => setShowLoginBottom(false)}
              onLogin={onLogin}
            />
          )}
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
