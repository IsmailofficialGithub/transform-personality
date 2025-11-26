import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PatternMasterGame } from './PatternMasterGame';
import { MemoryMatchGame } from './MemoryMatchGame';
import { BreathPacerGame } from './BreathPacerGame';
import { ReactionTimeGame } from './ReactionTimeGame';
import { UrgeFighterGame } from './UrgeFighterGame';
import { FocusMasterGame } from './FocusMasterGame';
import { ZenGardenGame } from './ZenGardenGame';

interface GamePlayScreenProps {
  gameId: string;
  onBack: () => void;
  onComplete: (score: number) => void;
}

export const GamePlayScreen = ({ gameId, onBack, onComplete }: GamePlayScreenProps) => {
  // Route to the correct game based on gameId
  switch (gameId) {
    case 'pattern-master':
      return <PatternMasterGame onComplete={onComplete} onBack={onBack} />;

    case 'memory-match':
      return <MemoryMatchGame onComplete={onComplete} onBack={onBack} />;

    case 'breath-pacer':
      return <BreathPacerGame onComplete={onComplete} onBack={onBack} />;

    case 'reaction-time':
      return <ReactionTimeGame onComplete={onComplete} onBack={onBack} />;

    case 'urge-fighter':
      return <UrgeFighterGame onComplete={onComplete} onBack={onBack} />;

    case 'focus-master':
      return <FocusMasterGame onComplete={onComplete} onBack={onBack} />;

    case 'zen-garden':
      return <ZenGardenGame onComplete={onComplete} onBack={onBack} />;

    default:
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Game not found: {gameId}</Text>
          <Text style={styles.errorHint}>Please go back and try again</Text>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF5252',
    marginBottom: 10,
  },
  errorHint: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
});