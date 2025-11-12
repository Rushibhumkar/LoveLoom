// ----------------------------------------
// QuizScreen.tsx — Main question flow logic
// ----------------------------------------
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  BackHandler,
} from 'react-native';
import { useSocket } from '../../hooks/useSocket';
import { useNavigation } from '@react-navigation/native';
import { color } from '../../const/color';
import { testUrl } from '../../api/axiosInstance';

interface Question {
  question_id: string;
  question_text: string;
  question_options: string;
}

interface Props {
  route: {
    params: {
      roomId: string;
      userID: string;
      name: string;
      categoryId: string;
      role: 'host' | 'guest';
    };
  };
}

const QuizScreen: React.FC<Props> = ({ route }) => {
  const { roomId, userID, name, categoryId, role } = route.params;
  const navigation = useNavigation<any>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [partnerProgress, setPartnerProgress] = useState<number>(0);
  const [myProgress, setMyProgress] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(10);

  const [finished, setFinished] = useState(false);

  const { socket, emit } = useSocket({
    progress_update: p => {
      console.log('Progress Update:', p);
      if (p.userID === userID) {
        setMyProgress(p.progress);
      } else {
        setPartnerProgress(p.progress);
      }
      setTotalQuestions(p.total);
    },
    you_finished: p => {
      console.log('You finished:', p?.message);
    },
    both_finished: payload => {
      navigation.navigate('GuessScreen', {
        roomId,
        userID,
        questions,
        payload,
        name,
        categoryId,
      });
    },
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Leave Room',
        'Are you sure you want to leave the room?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes',
            style: 'destructive',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'HomeScreen' }],
              });
            },
          },
        ],
        { cancelable: true },
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => {
      backHandler.remove();
    };
  }, [navigation]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(
        `${testUrl}quiz/get-questions/${encodeURIComponent(categoryId)}`,
      );
      const data = await res.json();
      const q = data?.data?.questions?.slice(0, 10) || [];
      setQuestions(q);
      setTotalQuestions(q.length);
    } catch (e) {
      console.warn('Failed to fetch questions', e);
    }
  };

  const handleAnswer = (q: Question, option: string) => {
    const payload = {
      roomId,
      userID,
      question_id: q.question_id,
      answer: option,
      questionIndex: index + 1,
    };
    emit('submit_answer', payload, res => {
      console.log('Answer submitted:', res);
    });
    setAnswers(prev => [...prev, payload]);
    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      setFinished(true);
      // Alert.alert('You completed all questions. Waiting for partner...');
    }
  };

  const currentQ = questions[index];

  if (!questions.length)
    return (
      <View style={styles.center}>
        <Text>Loading questions...</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* <Text style={styles.progress}>
        Question {index + 1}/{questions.length}
      </Text> */}
      <Text style={styles.progress}>
        Your Progress: {myProgress}/{totalQuestions} | Partner:{' '}
        {partnerProgress}/{totalQuestions}
      </Text>

      <Text style={styles.question}>{currentQ.question_text}</Text>

      {JSON.parse(currentQ.question_options).map((opt: string, i: number) => (
        <TouchableOpacity
          key={i}
          style={[
            styles.option,
            selectedOption === opt && {
              backgroundColor: '#FF4F72',
              borderColor: '#FF4F72',
            },
          ]}
          onPress={() => {
            setSelectedOption(opt);
            handleAnswer(currentQ, opt);
          }}
        >
          <Text
            style={[
              styles.optText,
              selectedOption === opt && { color: '#fff' },
            ]}
          >
            {opt}
          </Text>
        </TouchableOpacity>
      ))}

      {finished && (
        <Text style={styles.waitText}>
          You completed all questions. Waiting for partner...
        </Text>
      )}
    </ScrollView>
  );
};

export default QuizScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  progress: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  option: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  optText: {
    color: '#101031',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 15,
  },

  waitText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#888',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
