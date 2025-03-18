import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withSequence 
} from 'react-native-reanimated';
import { useFonts, Inter_700Bold, Inter_500Medium } from '@expo-google-fonts/inter';
import CountdownTimer from '@/components/CountdownTimer';
import QuizQuestion from '@/components/QuizQuestion';

// Quiz data structure
const QUIZ_LEVELS = [
  {
    name: 'Easy',
    questions: [
      {
        word: 'EPHEMERAL',
        definition: 'Lasting for a very short time',
        options: ['Permanent', 'Temporary', 'Lasting', 'Eternal'],
        correctAnswer: 1,
        hint: 'Think of something that quickly fades away',
      },
      {
        word: 'BENEVOLENT',
        definition: 'Kind and generous',
        options: ['Cruel', 'Caring', 'Harsh', 'Mean'],
        correctAnswer: 1,
        hint: 'Someone who helps others without expecting anything in return',
      },
      {
        word: 'AMBIGUOUS',
        definition: 'Open to more than one interpretation',
        options: ['Clear', 'Vague', 'Direct', 'Simple'],
        correctAnswer: 1,
        hint: 'When something could mean different things',
      },
      {
        word: 'UBIQUITOUS',
        definition: 'Present, appearing, or found everywhere',
        options: ['Rare', 'Everywhere', 'Nowhere', 'Sometimes'],
        correctAnswer: 1,
        hint: 'Like smartphones in modern society',
      },
      {
        word: 'SERENDIPITY',
        definition: 'Finding something good without looking for it',
        options: ['Planning', 'Accident', 'Lucky find', 'Searching'],
        correctAnswer: 2,
        hint: 'A happy accident',
      },
    ],
    timeLimit: 30,
    pointsPerQuestion: 100,
  },
  {
    name: 'Medium',
    questions: [
      {
        word: 'ELOQUENT',
        definition: 'Fluent or persuasive in speaking or writing',
        options: ['Stuttering', 'Articulate', 'Silent', 'Mumbling'],
        correctAnswer: 1,
        hint: 'Someone who speaks beautifully and effectively',
      },
      {
        word: 'TENACIOUS',
        definition: 'Persistent and determined',
        options: ['Weak', 'Strong', 'Giving up', 'Lazy'],
        correctAnswer: 1,
        hint: 'Never letting go, like a bulldog',
      },
      {
        word: 'PARADIGM',
        definition: 'A typical example or pattern of something',
        options: ['Exception', 'Model', 'Anomaly', 'Deviation'],
        correctAnswer: 1,
        hint: 'A standard way of thinking about something',
      },
      {
        word: 'SYCOPHANT',
        definition: 'A person who acts obsequiously toward someone important',
        options: ['Leader', 'Critic', 'Yes-person', 'Rebel'],
        correctAnswer: 2,
        hint: 'Someone who agrees with everything a powerful person says',
      },
      {
        word: 'MERCURIAL',
        definition: 'Subject to sudden or unpredictable changes of mood',
        options: ['Stable', 'Changing', 'Steady', 'Consistent'],
        correctAnswer: 1,
        hint: 'Like the weather in spring',
      },
    ],
    timeLimit: 25,
    pointsPerQuestion: 150,
  },
  {
    name: 'Hard',
    questions: [
      {
        word: 'EPHEMERAL',
        definition: 'Lasting for a very short time',
        options: ['Eternal', 'Fleeting', 'Permanent', 'Fixed'],
        correctAnswer: 1,
        hint: "Like morning dew or a butterfly's life",
      },
      {
        word: 'CACOPHONY',
        definition: 'A harsh mixture of sounds',
        options: ['Harmony', 'Discord', 'Melody', 'Silence'],
        correctAnswer: 1,
        hint: 'Like a busy street during rush hour',
      },
      {
        word: 'PERSPICACIOUS',
        definition: 'Having a ready insight into and understanding of things',
        options: ['Confused', 'Perceptive', 'Dull', 'Unaware'],
        correctAnswer: 1,
        hint: 'Someone who quickly understands complex situations',
      },
      {
        word: 'INEFFABLE',
        definition: 'Too great or extreme to be expressed or described in words',
        options: ['Speakable', 'Simple', 'Indescribable', 'Clear'],
        correctAnswer: 2,
        hint: 'When words fail to capture the magnitude',
      },
      {
        word: 'QUOTIDIAN',
        definition: 'Of or occurring every day; daily',
        options: ['Rare', 'Special', 'Routine', 'Unusual'],
        correctAnswer: 2,
        hint: 'Like your morning coffee routine',
      },
    ],
    timeLimit: 20,
    pointsPerQuestion: 200,
  },
];

export default function WordQuizGame() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_500Medium,
  });

  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameActive, setIsGameActive] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);

  const currentQuiz = QUIZ_LEVELS[currentLevel];
  const question = currentQuiz.questions[currentQuestion];

  const handleAnswer = (index: number) => {
    if (!isGameActive || showAnswer) return;

    setSelectedAnswer(index);
    setShowAnswer(true);

    if (index === question.correctAnswer) {
      const streakBonus = Math.floor(streakCount / 3) * 50;
      setScore(prev => prev + currentQuiz.pointsPerQuestion + streakBonus);
      setStreakCount(prev => prev + 1);
    } else {
      // Deduct points for wrong answer, but don't go below 0
      setScore(prev => Math.max(0, prev - Math.floor(currentQuiz.pointsPerQuestion * 0.5)));
      setStreakCount(0);
    }

    // Move to next question after delay
    setTimeout(() => {
      const isLastQuestion = currentQuestion === currentQuiz.questions.length - 1;
      const isLastLevel = currentLevel === QUIZ_LEVELS.length - 1;

      if (!isLastQuestion) {
        setCurrentQuestion(prev => prev + 1);
        setShowAnswer(false);
        setSelectedAnswer(null);
        setShowHint(false);
      } else if (!isLastLevel) {
        setRoundComplete(true);
        setIsGameActive(false);
      } else {
        // Game completed
        setRoundComplete(true);
        setIsGameActive(false);
      }
    }, 2000);
  };

  const handleTimeUp = () => {
    setIsGameActive(false);
    setShowAnswer(true);
    setScore(0); // Reset score when timer expires
  };

  const startNextLevel = () => {
    if (currentLevel < QUIZ_LEVELS.length - 1) {
      setCurrentLevel(prev => prev + 1);
      setCurrentQuestion(0);
      setIsGameActive(true);
      setShowAnswer(false);
      setSelectedAnswer(null);
      setShowHint(false);
      setRoundComplete(false);
    } else {
      // Reset the game
      setCurrentLevel(0);
      setCurrentQuestion(0);
      setScore(0);
      setIsGameActive(true);
      setShowAnswer(false);
      setSelectedAnswer(null);
      setShowHint(false);
      setRoundComplete(false);
      setStreakCount(0);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient colors={['#8A2BE2', '#4B0082']} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>{score}</Text>
            <Text style={styles.levelInfo}>
              Level {currentLevel + 1} - Question {currentQuestion + 1}/
              {currentQuiz.questions.length}
            </Text>
          </View>
          <View style={styles.statsContainer}>
            <CountdownTimer
              seconds={currentQuiz.timeLimit}
              onTimeUp={handleTimeUp}
              isRunning={isGameActive && !showAnswer}
            />
            {streakCount > 0 && (
              <Text style={styles.streak}>🔥 {streakCount}</Text>
            )}
          </View>
        </View>

        <QuizQuestion
          question={question}
          showAnswer={showAnswer}
          selectedAnswer={selectedAnswer}
          onSelectAnswer={handleAnswer}
          showHint={showHint}
          isActive={isGameActive && !showAnswer}
        />

        {!showHint && isGameActive && !showAnswer && (
          <Pressable
            style={styles.hintButton}
            onPress={() => setShowHint(true)}>
            <Text style={styles.hintButtonText}>Show Hint</Text>
          </Pressable>
        )}

        {!isGameActive && !roundComplete && (
          <View style={styles.completionContainer}>
            <Text style={styles.timeUpText}>Time's Up!</Text>
            <Pressable
              style={styles.nextButton}
              onPress={() => {
                setCurrentQuestion(0);
                setIsGameActive(true);
                setShowAnswer(false);
                setSelectedAnswer(null);
                setShowHint(false);
              }}>
              <Text style={styles.nextButtonText}>Play Again</Text>
            </Pressable>
          </View>
        )}

        {roundComplete && (
          <View style={styles.completionContainer}>
            <Text style={styles.completionText}>Level Complete!</Text>
            <Pressable
              style={styles.nextButton}
              onPress={startNextLevel}>
              <Text style={styles.nextButtonText}>
                {currentLevel === QUIZ_LEVELS.length - 1 ? 'Play Again' : 'Next Level'}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  scoreContainer: {
    alignItems: 'flex-start',
  },
  score: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Inter_700Bold',
  },
  levelInfo: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter_500Medium',
    opacity: 0.9,
  },
  statsContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  streak: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter_700Bold',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  hintButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignSelf: 'center',
    marginTop: 20,
  },
  hintButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  completionContainer: {
    alignItems: 'center',
    marginTop: 20,
    gap: 16,
  },
  completionText: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  timeUpText: {
    fontSize: 24,
    color: '#FF4B4B',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#9932CC',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    borderWidth: 3,
    borderTopColor: 'rgba(255, 255, 255, 0.5)',
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
    borderRightColor: 'rgba(138, 43, 226, 0.5)',
    borderBottomColor: 'rgba(138, 43, 226, 0.8)',
    transform: [
      { translateY: -2 },
      { perspective: 1000 },
      { rotateX: '10deg' }
    ],
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
});