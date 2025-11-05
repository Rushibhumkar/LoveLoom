import React, { useRef } from 'react';
import { Dimensions, ScrollView, StyleSheet } from 'react-native';
import IntroScreen from './components/IntroScreen';
import RoundScreen from './components/RoundScreen';
import FinalScreen from './components/FinalScreen';

const { width: screenWidth } = Dimensions.get('window');

interface LovifyScreenProps {
  onLogin: () => void;
}

const LovifyScreen: React.FC<LovifyScreenProps> = ({ onLogin }) => {
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (index: number) => {
    scrollRef.current?.scrollTo({ x: screenWidth * index, animated: true });
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      <IntroScreen onNext={() => handleScroll(1)} />

      <RoundScreen
        roundNumber={1}
        imageUri="https://img.freepik.com/free-vector/boy-girl-with-chat-bubble-message_24877-53848.jpg?semt=ais_hybrid&w=740&q=80"
        question="What do you like?"
        onPrev={() => handleScroll(0)}
        onNext={() => handleScroll(2)}
      />

      <RoundScreen
        roundNumber={2}
        imageUri="https://img.freepik.com/free-vector/couple-talking-online-chatting_24877-53846.jpg?semt=ais_hybrid&w=740&q=80"
        question="Partner has to Guess"
        prefix="Then, your"
        highlight="Partner"
        onPrev={() => handleScroll(1)}
        onNext={() => handleScroll(3)}
      />

      <FinalScreen onPrev={() => handleScroll(2)} onLogin={onLogin} />
    </ScrollView>
  );
};

export default LovifyScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1C' },
});
