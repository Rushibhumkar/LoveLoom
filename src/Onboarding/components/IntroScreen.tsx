import React, { useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MainContainer from '../../components/MainContainer';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { storeData } from '../../hooks/useAsyncStorage';

const { width: screenWidth } = Dimensions.get('window');

interface IntroScreenProps {
  onNext: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onNext }) => {
  const [isLangModalVisible, setLangModalVisible] = useState(true); // show at first launch
  const { t } = useTranslation();

  const changeLanguage = async (lang: 'en' | 'hi') => {
    i18n.changeLanguage(lang);
    await storeData('appLanguage', lang); // store selected language
    setLangModalVisible(false);
  };
  return (
    <MainContainer>
      <View style={{ width: screenWidth }}>
        <ImageBackground
          source={{
            uri: 'https://images.stockcake.com/public/0/c/6/0c66db9c-7066-496b-9c1b-9daa65d7e01f_large/silhouette-love-moment-stockcake.jpg',
          }}
          style={styles.bgImage}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <Text style={styles.logo}>
              Cupid<Text style={styles.logoAccent}>Flow</Text>
            </Text>
            <View
              style={{
                position: 'absolute',
                bottom: '20%',
                right: 16,
                alignItems: 'flex-end',
              }}
            >
              <Text style={styles.mainTitle}>SHARE EVERYTHING</Text>
              <Text style={styles.subTitle}>without saying</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
            <Feather name="arrow-right" size={28} color="#fff" />
          </TouchableOpacity>
        </ImageBackground>
        <Modal visible={isLangModalVisible} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Language</Text>

              <TouchableOpacity
                style={[styles.langButton, { marginBottom: 12 }]}
                onPress={() => changeLanguage('en')}
              >
                <Text style={styles.langText}>English</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.langButton}
                onPress={() => changeLanguage('hi')}
              >
                <Text style={styles.langText}>हिंदी</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </MainContainer>
  );
};

export default IntroScreen;

const styles = StyleSheet.create({
  bgImage: { height: '100%', width: screenWidth, justifyContent: 'flex-end' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', padding: 20 },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
  },
  logoAccent: { color: '#FF5277' },
  mainTitle: {
    fontSize: 28,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: '#fff',
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 18,
    color: '#ffb3c1',
    letterSpacing: 1.1,
    marginTop: 8,
    textAlign: 'center',
  },
  nextBtn: {
    backgroundColor: '#FF5277',
    width: 55,
    height: 55,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    right: 22,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1E293B',
  },
  langButton: {
    width: '100%',
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#FF5277',
    borderRadius: 12,
    alignItems: 'center',
  },
  langText: {
    fontSize: 16,
    color: '#FF5277',
    fontWeight: '600',
  },
});
