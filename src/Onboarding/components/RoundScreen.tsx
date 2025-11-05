import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface RoundScreenProps {
  roundNumber: number;
  imageUri: string;
  question: string;
  prefix?: string;
  highlight?: string;
  onPrev: () => void;
  onNext: () => void;
}

const RoundScreen: React.FC<RoundScreenProps> = ({
  roundNumber,
  imageUri,
  question,
  prefix,
  highlight,
  onPrev,
  onNext,
}) => {
  return (
    <View style={[styles.darkScreen, { width: screenWidth }]}>
      <Text style={styles.roundText}>
        Round<Text style={styles.roundAccent}> {roundNumber}</Text>
      </Text>

      <Image
        source={{ uri: imageUri }}
        style={styles.illustration}
        resizeMode="contain"
      />

      <Text style={styles.textCenter}>
        {prefix && <Text style={styles.whiteText}>{prefix} </Text>}
        {highlight && <Text style={styles.boldWhite}>{highlight} </Text>}
        <Text style={styles.pinkText}>{question}</Text>
      </Text>

      <View style={styles.navRow}>
        <TouchableOpacity style={styles.circleBtn} onPress={onPrev}>
          <Feather name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleBtnPink} onPress={onNext}>
          <Feather name="chevron-right" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RoundScreen;

const styles = StyleSheet.create({
  darkScreen: {
    backgroundColor: '#0D0D1C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    height: screenHeight,
  },
  roundText: { color: '#fff', fontSize: 36, fontWeight: '700' },
  roundAccent: { color: '#FF5277' },
  illustration: { width: '80%', height: 250, marginTop: 40 },
  textCenter: {
    textAlign: 'center',
    fontSize: 22,
    marginTop: 40,
    lineHeight: 30,
  },
  whiteText: { color: '#fff' },
  boldWhite: { color: '#fff', fontWeight: '700' },
  pinkText: { color: '#FF5277' },
  navRow: {
    flexDirection: 'row',
    width: '60%',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  circleBtn: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 40,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnPink: {
    backgroundColor: '#FF5277',
    borderRadius: 40,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
