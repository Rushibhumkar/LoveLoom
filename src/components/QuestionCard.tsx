// ---------------------------------------------
// QuestionCard.tsx — for quiz & guess questions
// ---------------------------------------------
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  question: {
    question_id: string;
    question_text: string;
    question_options: string;
  };
  onSelect: (option: string) => void;
  selected?: string;
  disabled?: boolean;
}

const QuestionCard: React.FC<Props> = ({
  question,
  onSelect,
  selected,
  disabled = false,
}) => {
  const options = JSON.parse(question.question_options || '[]');

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{question.question_text}</Text>

      {options.map((opt: string, i: number) => {
        const isSelected = selected === opt;
        return (
          <TouchableOpacity
            key={i}
            onPress={() => !disabled && onSelect(opt)}
            style={[
              styles.option,
              isSelected && {
                backgroundColor: '#FF4F72',
                borderColor: '#FF4F72',
              },
            ]}
          >
            <Text style={[styles.optionText, isSelected && { color: '#fff' }]}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default QuestionCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 10,
  },
  option: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    marginBottom: 8,
  },
  optionText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
});
