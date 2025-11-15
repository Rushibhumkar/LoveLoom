// ---------------------------------------------------
// GuessScreen.tsx — Guess your partner’s answers phase
// ---------------------------------------------------
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSocket } from '../../hooks/useSocket';
import { color } from '../../const/color';
import { testUrl } from '../../api/axiosInstance';
import { useRoomConnection } from '../../hooks/useRoomConnection';
import MainContainer from '../../components/MainContainer';

interface Props {
  route: {
    params: {
      roomId: string;
      userID: string;
      name: string;
      payload: {
        hostAnswers: any[];
        guestAnswers: any[];
        categoryId?: string;
        chosenCategory?: { id?: string };
        category?: { id?: string };
      };
      role: 'host' | 'guest';
      categoryId: string;
    };
  };
}

const { width } = Dimensions.get('window');

const GuessScreen: React.FC<Props> = ({ route }) => {
  const { roomId, userID, payload, categoryId, role } = route.params;
  useRoomConnection(role, userID);

  const resolvedCategoryId =
    categoryId ||
    payload?.categoryId ||
    payload?.chosenCategory?.id ||
    payload?.category?.id;

  const navigation = useNavigation<any>();

  const [questions, setQuestions] = useState<any[]>([]);
  const [guesses, setGuesses] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress] = useState(new Animated.Value(0));
  const [lockedQuestions, setLockedQuestions] = useState<string[]>([]);

  const { socket, emit } = useSocket({
    guess_submitted: p => {
      console.log('[SOCKET] Partner submitted guesses =>', p);
    },
    final_result: data => {
      console.log('[SOCKET] Final result =>', data);
      const host = data?.host || {};
      const guest = data?.guest || {};
      navigation.navigate('ResultScreen', {
        result: {
          hostName: host.name,
          hostScore: host.score,
          guestName: guest.name,
          guestScore: guest.score,
        },
        roomId,
        userID,
        categoryId,
        role,
      });
    },
  });

  const hostAnswers = payload?.hostAnswers || [];
  const guestAnswers = payload?.guestAnswers || [];
  const partnerAnswers =
    hostAnswers[0]?.userID === userID ? guestAnswers : hostAnswers;

  useEffect(() => {
    console.log('📦 Incoming Payload =>', payload);
    console.log('🧩 Host Answers:', hostAnswers);
    console.log('🧩 Guest Answers:', guestAnswers);
    console.log('🧠 Partner Answers to Display:', partnerAnswers);

    setQuestions([]);
    setGuesses([]);
    setSubmitted(false);
    setCurrentIndex(0);
    setLoading(true);
    fetchQuestions(resolvedCategoryId);
  }, [resolvedCategoryId]);

  useEffect(() => {
    // Update progress animation when currentIndex changes
    Animated.timing(progress, {
      toValue: ((currentIndex + 1) / uniquePartnerAnswers.length) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentIndex]);

  const fetchQuestions = async (id: string) => {
    console.log('🌐 Fetching questions for category =>', resolvedCategoryId);
    try {
      const res = await fetch(
        `${testUrl}quiz/get-questions/${encodeURIComponent(
          resolvedCategoryId,
        )}`,
      );

      const data = await res.json();
      const qArr = data?.data?.questions || [];
      console.log('✅ Questions fetched =>', qArr.length, qArr);
      setQuestions(qArr);
    } catch (err) {
      console.error('❌ Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuessSelect = (questionId: string, option: string) => {
    console.log(`[ACTION] Guess selected => QID=${questionId} | OPT=${option}`);
    setGuesses(prev => {
      const updated = prev.filter(g => g.question_id !== questionId);
      return [...updated, { question_id: questionId, guessedAnswer: option }];
    });
  };

  const handleSubmit = () => {
    if (guesses.length < uniquePartnerAnswers.length) {
      Alert.alert(
        'Incomplete',
        'Please answer all questions before submitting.',
      );
      return;
    }

    console.log('🚀 Submitting guesses =>', guesses);
    emit('submit_guess', { roomId, userID, guesses }, (res: any) => {
      console.log('[SOCKET_RESPONSE] submit_guess =>', res);
      setSubmitted(true);
    });
  };

  const goNext = () => {
    if (currentIndex < uniquePartnerAnswers.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // ✅ Ensure unique partner answers by question_id
  const uniquePartnerAnswers = partnerAnswers.filter(
    (obj, index, self) =>
      index ===
      self.findIndex(o => String(o.question_id) === String(obj.question_id)),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={color.primary} />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  if (uniquePartnerAnswers.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.noAnswersText}>
          ⚠️ No partner answers received yet.
        </Text>
      </View>
    );
  }

  const currentPartnerAnswer = uniquePartnerAnswers[currentIndex];
  const qid = String(currentPartnerAnswer.question_id);
  const question =
    questions.find(
      q =>
        String(q.question_id) === qid ||
        String(q.questionID) === qid ||
        String(q.questionId) === qid,
    ) || {};

  // Parse options
  let options: string[] = [];
  try {
    if (typeof question.question_options === 'string') {
      options = JSON.parse(question.question_options);
    } else if (Array.isArray(question.question_options)) {
      options = question.question_options;
    }
  } catch (e) {
    console.warn('⚠️ Error parsing options for question', qid, e);
  }

  const currentGuess = guesses.find(
    g => g.question_id === currentPartnerAnswer.question_id,
  );
  const progressWidth = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <MainContainer>
      <View style={styles.container}>
        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.title}>Guess Your Partner's Answers</Text>
          <Text style={styles.subtitle}>
            Question {currentIndex + 1} of {uniquePartnerAnswers.length}
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <Animated.View
              style={[styles.progressFill, { width: progressWidth }]}
            />
          </View>
        </View>

        {/* Question Card */}
        <View style={styles.card}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>Q{currentIndex + 1}</Text>
            <View style={styles.questionIndicator}>
              {uniquePartnerAnswers.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicatorDot,
                    index === currentIndex && styles.indicatorDotActive,
                    index < currentIndex && styles.indicatorDotCompleted,
                  ]}
                />
              ))}
            </View>
          </View>

          <Text style={styles.questionText}>
            {question.question_text || 'Question not found'}
          </Text>

          <Text style={styles.instruction}>What did your partner answer?</Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {options.length > 0 ? (
              options.map((option, index) => {
                const isSelected = currentGuess?.guessedAnswer === option;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() =>
                      handleGuessSelect(
                        currentPartnerAnswer.question_id,
                        option,
                      )
                    }
                    style={[styles.option, isSelected && styles.optionSelected]}
                  >
                    <View style={styles.optionContent}>
                      <View
                        style={[
                          styles.optionIndicator,
                          isSelected && styles.optionIndicatorSelected,
                        ]}
                      >
                        {isSelected && (
                          <View style={styles.optionIndicatorInner} />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.noOptionsText}>
                No options available for this question
              </Text>
            )}
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigation}>
          {/* <TouchableOpacity
          style={[
            styles.navButton,
            styles.backButton,
            currentIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={goBack}
          disabled={currentIndex === 0}
        >
          <Text
            style={[
              styles.navButtonText,
              styles.backButtonText,
              currentIndex === 0 && styles.navButtonTextDisabled,
            ]}
          >
            Back
          </Text>
        </TouchableOpacity> */}
          <View />

          {currentIndex < uniquePartnerAnswers.length - 1 ? (
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.nextButton,
                !currentGuess && styles.navButtonDisabled,
              ]}
              onPress={goNext}
              disabled={!currentGuess}
            >
              <Text
                style={[
                  styles.navButtonText,
                  styles.nextButtonText,
                  !currentGuess && styles.navButtonTextDisabled,
                ]}
              >
                Next
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.submitButton,
                (!currentGuess || submitted) && styles.navButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!currentGuess || submitted}
            >
              <Text
                style={[
                  styles.navButtonText,
                  styles.submitButtonText,
                  (!currentGuess || submitted) && styles.navButtonTextDisabled,
                ]}
              >
                {submitted ? 'Waiting for partner...' : 'Submit All'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </MainContainer>
  );
};

export default GuessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF4F72',
    borderRadius: 3,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF4F72',
  },
  questionIndicator: {
    flexDirection: 'row',
    gap: 6,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  indicatorDotActive: {
    backgroundColor: '#FF4F72',
  },
  indicatorDotCompleted: {
    backgroundColor: '#10B981',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 28,
    marginBottom: 12,
  },
  instruction: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  optionSelected: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FF4F72',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIndicatorSelected: {
    borderColor: '#FF4F72',
    backgroundColor: '#FF4F72',
  },
  optionIndicatorInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  optionText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  optionTextSelected: {
    color: '#FF4F72',
    fontWeight: '600',
  },
  noOptionsText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontStyle: 'italic',
    fontSize: 14,
    marginVertical: 20,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#F1F5F9',
  },
  nextButton: {
    backgroundColor: '#FF4F72',
  },
  submitButton: {
    backgroundColor: '#10B981',
  },
  navButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonText: {
    color: '#64748B',
  },
  nextButtonText: {
    color: '#FFFFFF',
  },
  submitButtonText: {
    color: '#FFFFFF',
  },
  navButtonTextDisabled: {
    color: '#94A3B8',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    color: '#64748B',
    marginTop: 12,
    fontSize: 16,
  },
  noAnswersText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 16,
  },
});
