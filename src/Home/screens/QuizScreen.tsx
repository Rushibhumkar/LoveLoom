// ----------------------------------------
// QuizScreen.tsx — Main question flow logic
// Modern UI with flexbox only
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
import { myConsole } from '../../utils/myConsole';
import { colors, spacing } from '../../utils/theme';

interface Question {
  question_id: string;
  question_text: string;
  question_options: string[];
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

  useEffect(() => {
    if (!socket) return;
    console.log('🧩 Setting up both_finished listener for socket:', socket.id);
    socket.on('both_finished', payload => {
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

      myConsole('data', data);
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
    emit('submit_answer', payload, res =>
      console.log('Answer submitted:', res),
    );
    setAnswers(prev => [...prev, payload]);

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
  myConsole('currentQqq', currentQ);

  if (!currentQ) return null;

  myConsole('questionsss', questions);

  const options =
    typeof currentQ.question_options === 'string'
      ? JSON.parse(currentQ.question_options)
      : currentQ.question_options;

  if (!questions.length)
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.textPrimary }}>Loading questions...</Text>
      </View>
    );

  return (
    <MainContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StatusBar
          backgroundColor={colors.background}
          barStyle="light-content"
        />

        {/* Header: Progress and Category */}
        <View style={styles.header}>
          <View style={styles.progressColumn}>
            <Text style={styles.progressNumber}>
              {myProgress}/{totalQuestions}
            </Text>
            <Text style={styles.progressLabel}>{t('you')}</Text>
          </View>

          <Text style={styles.categoryTitle}>{selectedCategory || ''}</Text>

          <View style={[styles.progressColumn, { alignItems: 'flex-end' }]}>
            <Text style={styles.progressNumber}>
              {partnerProgress}/{totalQuestions}
            </Text>
            <Text style={styles.progressLabel}>{t('partner')}</Text>
          </View>
        </View>

        {/* Question Section */}
        <View style={styles.questionSection}>
          <Text style={styles.questionText}>{currentQ.question_text}</Text>
        </View>

        {/* Options Card (bottom part) */}
        <View style={styles.optionsCard}>
          {options?.map((opt: string, i: number) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.optionButton,
                selectedOption === opt && styles.optionButtonSelected,
              ]}
              onPress={() => {
                setSelectedOption(opt);
                handleAnswer(currentQ, opt);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedOption === opt && styles.optionTextSelected,
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}

          {finished && (
            <Text style={styles.waitText}>
              🎉 {t('answeredEverything')} ⏳ {t('waitingForPartner')} 🤝
            </Text>
          )}
        </View>
      </ScrollView>
    </MainContainer>
  );
};

export default QuizScreen;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  progressColumn: {
    flexShrink: 1,
  },
  progressNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 4,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    flexShrink: 1,
    paddingHorizontal: 8,
  },
  questionSection: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 24,
  },
  questionText: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 36,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  optionsCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
    marginTop: 'auto', // pushes card to bottom
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  optionButton: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 60,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  optionTextSelected: {
    color: colors.textPrimary,
  },
  waitText: {
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  heartContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  heartsImage: {
    width: 80,
    height: 80,
    opacity: 0.8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
