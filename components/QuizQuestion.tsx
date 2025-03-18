import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useFonts, Inter_700Bold, Inter_500Medium } from '@expo-google-fonts/inter';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface QuizQuestionProps {
  question: {
    word: string;
    definition: string;
    options: string[];
    correctAnswer: number;
    hint: string;
  };
  showAnswer: boolean;
  selectedAnswer: number | null;
  onSelectAnswer: (index: number) => void;
  showHint: boolean;
  isActive: boolean;
}

export default function QuizQuestion({
  question,
  showAnswer,
  selectedAnswer,
  onSelectAnswer,
  showHint,
  isActive,
}: QuizQuestionProps) {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_500Medium,
  });

  if (!fontsLoaded) return null;

  const getOptionStyle = (index: number) => {
    if (!showAnswer) return {};

    if (index === question.correctAnswer) {
      return styles.correctOption;
    }
    if (index === selectedAnswer && index !== question.correctAnswer) {
      return styles.wrongOption;
    }
    return styles.disabledOption;
  };

  const getOptionTextStyle = (index: number) => {
    if (!showAnswer) return {};

    if (index === question.correctAnswer) {
      return styles.correctOptionText;
    }
    if (index === selectedAnswer && index !== question.correctAnswer) {
      return styles.wrongOptionText;
    }
    return styles.disabledOptionText;
  };

  return (
    <View style={styles.container}>
      <View style={styles.questionCard}>
        <Text style={styles.word}>{question.word}</Text>
        <Text style={styles.definition}>{question.definition}</Text>
        
        {showHint && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintLabel}>Hint:</Text>
            <Text style={styles.hintText}>{question.hint}</Text>
          </View>
        )}

        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <AnimatedPressable
              key={index}
              style={[
                styles.option,
                getOptionStyle(index),
              ]}
              onPress={() => isActive && onSelectAnswer(index)}
              disabled={!isActive}>
              <Text
                style={[
                  styles.optionText,
                  getOptionTextStyle(index),
                ]}>
                {option}
              </Text>
            </AnimatedPressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  questionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  word: {
    fontSize: 28,
    color: '#4B0082',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  definition: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  hintContainer: {
    backgroundColor: 'rgba(75, 0, 130, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  hintLabel: {
    fontSize: 14,
    color: '#4B0082',
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  hintText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter_500Medium',
    fontStyle: 'italic',
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(75, 0, 130, 0.2)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  optionText: {
    fontSize: 16,
    color: '#4B0082',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  correctOption: {
    backgroundColor: '#50C878',
    borderColor: '#50C878',
    transform: [{ scale: 1.02 }],
  },
  wrongOption: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  disabledOption: {
    opacity: 0.5,
    borderColor: '#ccc',
  },
  correctOptionText: {
    color: '#fff',
    fontFamily: 'Inter_700Bold',
  },
  wrongOptionText: {
    color: '#fff',
    fontFamily: 'Inter_700Bold',
  },
  disabledOptionText: {
    color: '#999',
  },
});