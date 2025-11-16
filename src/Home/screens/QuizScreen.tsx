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
  Image,
  StatusBar,
} from 'react-native';
import { useSocket } from '../../hooks/useSocket';
import { useNavigation } from '@react-navigation/native';
import { color } from '../../const/color';
import { testUrl } from '../../api/axiosInstance';
import MainContainer from '../../components/MainContainer';
import { useRoomConnection } from '../../hooks/useRoomConnection';
import { sizes } from '../../const';
import { useTranslation } from 'react-i18next';

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
      selectedCategory?: string;
    };
  };
}

const QuizScreen: React.FC<Props> = ({ route }) => {
  const { t } = useTranslation();
  const { roomId, userID, name, categoryId, role, selectedCategory } =
    route.params;
  useRoomConnection(role, userID);
  console.log('selectedCategory', selectedCategory);
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
      console.log(
        '🎯 both_finished received from server =>',
        JSON.stringify(payload, null, 2),
      );
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
        t('leaveRoomTitle'),
        t('leaveRoomConfirmMsg'),
        [
          { text: t('cancelButton'), style: 'cancel' },
          {
            text: t('yesButton'),
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
        <StatusBar backgroundColor={'#1b2038'} barStyle={'light-content'} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            // backgroundColor: 'red',
          }}
        >
          <View>
            <Text
              style={{ color: '#c3c3c3ff', fontSize: 16, fontWeight: '600' }}
            >
              {myProgress}/{totalQuestions}
            </Text>
            <Text
              style={{ color: '#c3c3c3ff', fontSize: 16, fontWeight: '600' }}
            >
              {t('you')}
            </Text>
          </View>
          <Text
            style={{
              color: '#FF4F72',
              fontWeight: '600',
              fontSize: 22,
              width: '60%',
              textAlign: 'center',
            }}
          >
            {selectedCategory || ''}
          </Text>
          <View>
            <Text
              style={{
                color: '#c3c3c3ff',
                fontSize: 16,
                fontWeight: '600',
                textAlign: 'right',
              }}
            >
              {partnerProgress}/{totalQuestions}
            </Text>
            <Text
              style={{ color: '#c3c3c3ff', fontSize: 16, fontWeight: '600' }}
            >
              {t('partner')}
            </Text>
          </View>
        </View>

        <View
          style={{
            position: 'absolute',
            bottom: 0,
            width: sizes.width,
          }}
        >
          <Image
            source={require('../../assets/icons/hearts.jpg')}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              zIndex: 40,
              height: 120,
              width: 120,
            }}
          />
          <Text style={styles.question}>{currentQ.question_text}</Text>
          <View
            style={{
              backgroundColor: '#f5f5f5',
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              paddingHorizontal: 24,
              paddingVertical: finished ? sizes.height / 8 : sizes.height / 6,
            }}
          >
            {JSON.parse(currentQ.question_options).map(
              (opt: string, i: number) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.option,
                    selectedOption === opt && {
                      backgroundColor: '#f79aadff',
                      borderColor: '#f8bfcaff',
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
              ),
            )}
            {finished && (
              <Text style={styles.waitText}>
                🎉 {t('answeredEverything')} ⏳ {t('waitingForPartner')} 🤝
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </MainContainer>
  );
};

export default QuizScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#1b2038',
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
    zIndex: 80,
  },

  question: {
    marginTop: 40,
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 25,
    lineHeight: 28,
    paddingHorizontal: 22,
  },

  option: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#f8a3b4ff',
    borderRadius: 22,
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
