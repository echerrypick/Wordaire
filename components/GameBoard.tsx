import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useFonts, Inter_700Bold } from '@expo-google-fonts/inter';

const CELL_SIZE = Math.floor(Dimensions.get('window').width * 0.12);
const CELL_PADDING = 4;

interface GameBoardProps {
  letters: string[];
  selectedCells: number[];
  onCellPress: (index: number) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function Cell({ 
  letter, 
  index, 
  isSelected, 
  onPress 
}: { 
  letter: string; 
  index: number; 
  isSelected: boolean; 
  onPress: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isSelected ? 1.1 : 1, {
          damping: 10,
          stiffness: 100,
        }),
      },
    ],
    backgroundColor: withTiming(
      isSelected ? '#8A2BE2' : 'rgba(255, 255, 255, 0.9)',
      { duration: 200 }
    ),
  }));

  return (
    <AnimatedPressable
      key={`${index}-${letter}`}
      style={[styles.cell, animatedStyle]}
      onPress={onPress}>
      <Text
        style={[
          styles.cellText,
          isSelected && styles.selectedCellText,
        ]}>
        {letter}
      </Text>
    </AnimatedPressable>
  );
}

export default function GameBoard({ letters, selectedCells, onCellPress }: GameBoardProps) {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.board}>
      {letters.map((letter, index) => (
        <Cell
          key={`${index}-${letter}`}
          letter={letter}
          index={index}
          isSelected={selectedCells.includes(index)}
          onPress={() => onCellPress(index)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: CELL_PADDING,
    padding: CELL_PADDING,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cellText: {
    fontSize: CELL_SIZE * 0.5,
    fontFamily: 'Inter_700Bold',
    color: '#4B0082',
  },
  selectedCellText: {
    color: '#fff',
  },
});