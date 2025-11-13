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
import MainContainer from '../../components/MainContainer';

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
  console.log('roomiddd', roomId);
  console.log('ueriddd', userID);
  console.log('nameee', name);
  console.log('categoryidd', categoryId);
  console.log('roleee', role);
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
      // console.log(
      //   '🎯 both_finished received from server =>',
      //   JSON.stringify(payload, null, 2),
      // );
      navigation.navigate('GuessScreen', {
        roomId,
        userID,
        questions,
        payload,
        name,
        categoryId,
        role,
      });
    },
  });

  // in useEffect(() => { if (!socket) return; ... }, [socket])
  useEffect(() => {
    if (!socket) return;
    console.log('🧩 Setting up both_finished listener for socket:', socket.id);
    socket.on('both_finished', payload => {
      // console.log(
      //   '🎯 Socket both_finished triggered:',
      //   JSON.stringify(payload, null, 2),
      // );
      navigation.navigate('GuessScreen', {
        roomId,
        userID,
        questions,
        payload,
        name,
        categoryId,
        role,
      });
    });
    socket.on('progress_update', p => console.log('📡 progress_update =>', p));
    socket.on('you_finished', p => console.log('📡 you_finished =>', p));
    return () => {
      console.log('🧹 Cleaning up socket listeners');
      socket.off('both_finished');
      socket.off('progress_update');
      socket.off('you_finished');
    };
  }, [socket]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    setSelectedOption(null);
  }, [index]);

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
                routes: [{ name: 'Home' }],
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

  // const handleAnswer = (q: Question, option: string) => {
  //   const payload = {
  //     roomId,
  //     userID,
  //     question_id: q.question_id,
  //     answer: option,
  //     questionIndex: index + 1,
  //   };
  //   emit('submit_answer', payload, res => {
  //     console.log('Answer submitted:', res);
  //   });
  //   setAnswers(prev => [...prev, payload]);
  //   if (index + 1 < questions.length) {
  //     setIndex(index + 1);
  //   } else {
  //     setFinished(true);
  //     console.log(
  //       '✅ All questions answered — waiting for server to detect both finished',
  //     );

  //     // Don't emit finish_game, just you_finished (like web)
  //     emit('you_finished', {
  //       roomId,
  //       userID,
  //       message: 'You completed all questions. Wait for partner.',
  //     });

  //     // Add debug line
  //     console.log(
  //       '📤 Emitted you_finished event -> waiting for both_finished from server',
  //     );
  //   }
  // };

  const handleAnswer = (q: Question, option: string) => {
    const payload = {
      roomId,
      userID,
      question_id: q.question_id,
      answer: option,
      questionIndex: index + 1,
    };
    emit('submit_answer', payload, res =>
      console.log('Answer submitted:', res),
    );
    setAnswers(prev => [...prev, payload]);

    // ✅ clear selection so same option text in next question isn't pre-selected
    setSelectedOption(null);

    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      setFinished(true);
      emit('you_finished', {
        roomId,
        userID,
        message: 'You completed all questions. Wait for partner.',
      });
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
    <MainContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.progress}>
          🧠 You: {myProgress}/{totalQuestions} | 💞 Partner: {partnerProgress}/
          {totalQuestions}
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
            🎉 You've answered everything! ⏳ Waiting for your partner to
            finish... 🤝
          </Text>
        )}
      </ScrollView>
    </MainContainer>
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
    fontSize: 15,
    color: '#FF4F72',
    marginBottom: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  waitText: {
    marginTop: 30,
    textAlign: 'center',
    color: '#FF4F72',
    fontSize: 15,
    letterSpacing: 0.4,
  },

  question: {
    marginTop: 40,
    fontSize: 20,
    fontWeight: '700',
    color: '#101031',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 28,
  },

  option: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#FF4F72',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 14,
    shadowColor: '#FF4F72',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    transition: 'all 0.3s',
  },
  optText: {
    color: '#101031',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
