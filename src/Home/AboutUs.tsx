import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

const AboutUs = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#101031" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('aboutUsTitle')}</Text>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>{t('aboutWelcomeTitle')}</Text>

        <Text style={styles.text}>{t('aboutDescription')}</Text>

        <Text style={styles.quote}>{t('aboutQuote')}</Text>

        <Text style={styles.thankYou}>{t('thankYou')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutUs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4F3',
  },
  header: {
    backgroundColor: '#101031',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 15,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 18,
  },
  text: {
    color: '#333',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'justify',
  },
  quote: {
    fontSize: 15,
    color: '#333',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  thankYou: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
});
