// --------------------------------------------------
// useQuiz.ts — manages fetching, answering, progress
// --------------------------------------------------
import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';
import { testUrl } from '../api/axiosInstance';

interface Question {
  question_id: string;
  question_text: string;
  question_options: string;
}

export const useQuiz = (roomId: string, userID: string, categoryId: string) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  const { emit } = useSocket();

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(
          `${testUrl}quiz/get-questions/${encodeURIComponent(categoryId)}`,
        );
        const data = await res.json();
        const q = data?.data?.questions?.slice(0, 10) || [];
        setQuestions(q);
      } catch (e) {
        console.warn('Failed to load questions', e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [categoryId]);

  // Handle answer selection
  const answerQuestion = (option: string) => {
    const q = questions[currentIndex];
    if (!q) return;

    const payload = {
      roomId,
      userID,
      question_id: q.question_id,
      answer: option,
      questionIndex: currentIndex + 1,
    };

    emit('submit_answer', payload);

    setAnswers(prev => [...prev, payload]);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setFinished(true);
    }
  };

  return {
    questions,
    currentIndex,
    loading,
    finished,
    currentQuestion: questions[currentIndex],
    answerQuestion,
  };
};
