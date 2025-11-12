// ---------------------------------------
// ResultCard.tsx — final result component
// ---------------------------------------
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  name: string;
  score: number;
  role?: string;
}

const ResultCard: React.FC<Props> = ({ name, score, role }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>
        {role ? `${role}: ` : ''}
        <Text style={styles.highlight}>{name}</Text>
      </Text>
      <Text style={styles.score}>{score}</Text>
    </View>
  );
};

export default ResultCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
    width: '90%',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    color: '#101031',
    fontWeight: '600',
  },
  highlight: {
    color: '#FF4F72',
    fontWeight: '700',
  },
  score: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
    marginTop: 6,
  },
});
