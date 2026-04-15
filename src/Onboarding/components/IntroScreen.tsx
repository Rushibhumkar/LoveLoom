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
  const [isLangModalVisible, setLangModalVisible] = useState(true);
  const { t } = useTranslation();

  const changeLanguage = async (lang: 'en' | 'hi') => {
    i18n.changeLanguage(lang);
    await storeData('appLanguage', lang);
    setLangModalVisible(false);
  };

  return (
    <MainContainer>
      <View style={{ width: screenWidth }}>
        <ImageBackground
          source={{
            uri: 'https://images.pexels.com/photos/1181695/pexels-photo-1181695.jpeg?auto=compress&cs=tinysrgb&w=1600',
          }}
          style={styles.bgImage}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>
                Love<Text style={styles.logoAccent}>Loom</Text>
              </Text>
              <View style={styles.heartIcon}>
                <Feather name="heart" size={20} color="#FF6B8B" />
              </View>
            </View>
            <View style={styles.textGroup}>
              <Text style={styles.mainTitle}>DEEPEN YOUR BOND</Text>
              <Text style={styles.subTitle}>Spin, laugh, love together 💖</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
            <Feather name="arrow-right" size={28} color="#fff" />
          </TouchableOpacity>
        </ImageBackground>

        <Modal visible={isLangModalVisible} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <Feather
                name="heart"
                size={28}
                color="#FF6B8B"
                style={styles.modalHeart}
              />
              <Text style={styles.modalTitle}>Choose Your Language</Text>
              <Text style={styles.modalSubtitle}>
                Select your preferred language to begin
              </Text>

              <TouchableOpacity
                style={[styles.langButton, { marginBottom: 12 }]}
                onPress={() => changeLanguage('en')}
                activeOpacity={0.8}
              >
                <Text style={styles.langText}>English</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.langButton}
                onPress={() => changeLanguage('hi')}
                activeOpacity={0.8}
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
  bgImage: {
    height: '100%',
    width: screenWidth,
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 20,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    position: 'relative',
  },
  logo: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoAccent: {
    color: '#FF6B8B',
  },
  heartIcon: {
    marginLeft: 8,
    marginTop: 4,
  },
  textGroup: {
    alignItems: 'flex-end',
    marginBottom: '20%',
    paddingRight: 8,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#FFFFFF',
    textAlign: 'right',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subTitle: {
    fontSize: 18,
    color: '#FFD1DC',
    letterSpacing: 0.5,
    marginTop: 8,
    textAlign: 'right',
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  nextBtn: {
    backgroundColor: '#FF6B8B',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 24,
    right: 24,
    shadowColor: '#FF5277',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: '#FFF9FB',
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#FF6B8B',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    borderWidth: 1,
    borderColor: '#FFE2E8',
  },
  modalHeart: {
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
    color: '#2D1B2E',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#9B7E8C',
    marginBottom: 28,
    textAlign: 'center',
    fontWeight: '500',
  },
  langButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: 'center',
    backgroundColor: '#FFF0F3',
    borderWidth: 1.5,
    borderColor: '#FFB7C5',
  },
  langText: {
    fontSize: 17,
    color: '#FF5277',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
