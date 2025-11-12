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
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSocket } from '../../hooks/useSocket';
import { color } from '../../const/color';
import { testUrl } from '../../api/axiosInstance';

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

      categoryId: string;
    };
  };
}

const GuessScreen: React.FC<Props> = ({ route }) => {
  const { roomId, userID, payload, categoryId } = route.params;
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

    fetchQuestions(resolvedCategoryId);
  }, [resolvedCategoryId]);

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
    if (!guesses.length) {
      Alert.alert('Make at least one guess');
      return;
    }
    console.log('🚀 Submitting guesses =>', guesses);
    emit('submit_guess', { roomId, userID, guesses }, (res: any) => {
      console.log('[SOCKET_RESPONSE] submit_guess =>', res);
      Alert.alert('Submitted successfully!', 'Waiting for partner...');
      setSubmitted(true);
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={color.primary} />
        <Text style={{ color: '#555', marginTop: 10 }}>
          Loading questions...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Guess your partner’s answers</Text>

      {partnerAnswers && partnerAnswers.length > 0 ? (
        partnerAnswers.map((pa: any, idx: number) => {
          const qid = String(pa.question_id);
          const q =
            questions.find(
              q =>
                String(q.question_id) === qid ||
                String(q.questionID) === qid ||
                String(q.questionId) === qid,
            ) || {};
          // parse options
          let opts: string[] = [];
          try {
            if (typeof q.question_options === 'string') {
              opts = JSON.parse(q.question_options);
            } else if (Array.isArray(q.question_options)) {
              opts = q.question_options;
            }
          } catch (e) {
            console.warn('⚠️ Error parsing options for question', qid, e);
          }

          console.log(
            `[RENDER] Q${idx + 1}:`,
            q.question_text,
            '| options:',
            opts,
            '| partnerAns:',
            pa,
          );

          return (
            <View key={`${qid}-${idx}`} style={styles.card}>
              <Text style={styles.question}>
                {idx + 1}. {q.question_text || 'Question not found'}
              </Text>

              {opts.length > 0 ? (
                opts.map((opt, oidx) => {
                  const isSelected = Boolean(
                    guesses.find(
                      g =>
                        g.question_id === pa.question_id &&
                        g.guessedAnswer === opt,
                    ),
                  );
                  return (
                    <TouchableOpacity
                      key={oidx}
                      onPress={() => handleGuessSelect(pa.question_id, opt)}
                      style={[
                        styles.option,
                        isSelected && { backgroundColor: '#FF4F72' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.optText,
                          isSelected && { color: '#fff' },
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={{ color: '#999', fontStyle: 'italic' }}>
                  No options available for this question
                </Text>
              )}
            </View>
          );
        })
      ) : (
        <Text style={{ textAlign: 'center', color: '#888', marginTop: 50 }}>
          ⚠️ No partner answers received yet.
        </Text>
      )}

      <TouchableOpacity
        style={[styles.submitBtn, submitted && { backgroundColor: '#ccc' }]}
        disabled={submitted}
        onPress={handleSubmit}
      >
        <Text style={styles.submitText}>
          {submitted ? 'Waiting for partner...' : 'Submit Guess'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default GuessScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    color: '#101031',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
  },
  question: {
    fontWeight: '600',
    marginBottom: 10,
    color: '#222',
  },
  option: {
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  optText: {
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: '#FF4F72',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
