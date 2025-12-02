import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../services/supabase';
import { Chess, Play, Trophy, Crown } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_SIZE = Math.min(SCREEN_WIDTH - 40, 400);
const CELL_SIZE = BOARD_SIZE / 8;

type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king' | null;
type PieceColor = 'white' | 'black';

interface Piece {
  type: PieceType;
  color: PieceColor;
}

type Board = (Piece | null)[][];

export default function SpaceChessTactics() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [board, setBoard] = useState<Board>([]);
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('white');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    if (user) {
      loadHighScore();
    }
  }, [user]);

  const loadHighScore = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('game_scores')
      .select('score')
      .eq('user_id', user.id)
      .eq('game_type', 'space_chess_tactics')
      .single();
    if (data) {
      setHighScore(data.score || 0);
    }
  };

  const initializeBoard = (): Board => {
    const newBoard: Board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Place pawns
    for (let x = 0; x < 8; x++) {
      newBoard[1][x] = { type: 'pawn', color: 'black' };
      newBoard[6][x] = { type: 'pawn', color: 'white' };
    }
    
    // Place other pieces
    const backRow: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    for (let x = 0; x < 8; x++) {
      newBoard[0][x] = { type: backRow[x], color: 'black' };
      newBoard[7][x] = { type: backRow[x], color: 'white' };
    }
    
    return newBoard;
  };

  const isValidMove = (from: { x: number; y: number }, to: { x: number; y: number }): boolean => {
    const piece = board[from.y][from.x];
    if (!piece) return false;
    if (piece.color !== currentPlayer) return false;
    
    const target = board[to.y][to.x];
    if (target && target.color === piece.color) return false;
    
    // Simple move validation (simplified chess rules)
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    
    switch (piece.type) {
      case 'pawn':
        const direction = piece.color === 'white' ? -1 : 1;
        if (from.x === to.x && !target) {
          return to.y === from.y + direction || (from.y === (piece.color === 'white' ? 6 : 1) && to.y === from.y + 2 * direction);
        }
        return dx === 1 && dy === 1 && target !== null;
      case 'rook':
        return (dx === 0 || dy === 0);
      case 'knight':
        return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
      case 'bishop':
        return dx === dy;
      case 'queen':
        return (dx === 0 || dy === 0) || (dx === dy);
      case 'king':
        return dx <= 1 && dy <= 1;
      default:
        return false;
    }
  };

  const handleCellPress = (x: number, y: number) => {
    if (gameState !== 'playing') return;
    
    if (selectedCell) {
      if (selectedCell.x === x && selectedCell.y === y) {
        setSelectedCell(null);
        return;
      }
      
      if (isValidMove(selectedCell, { x, y })) {
        const newBoard = board.map((row) => [...row]);
        const piece = newBoard[selectedCell.y][selectedCell.x];
        const target = newBoard[y][x];
        
        if (target) {
          setScore(score + (target.type === 'king' ? 1000 : target.type === 'queen' ? 100 : 50));
        }
        
        newBoard[y][x] = piece;
        newBoard[selectedCell.y][selectedCell.x] = null;
        setBoard(newBoard);
        setSelectedCell(null);
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
      } else {
        setSelectedCell({ x, y });
      }
    } else {
      const piece = board[y][x];
      if (piece && piece.color === currentPlayer) {
        setSelectedCell({ x, y });
      }
    }
  };

  const startGame = () => {
    setGameState('playing');
    setBoard(initializeBoard());
    setSelectedCell(null);
    setCurrentPlayer('white');
    setScore(0);
  };

  const endGame = () => {
    setGameState('gameover');
    saveGameData();
  };

  const saveGameData = async () => {
    if (!user) return;
    const { data: existing } = await supabase
      .from('game_scores')
      .select('score')
      .eq('user_id', user.id)
      .eq('game_type', 'space_chess_tactics')
      .single();
    
    if (!existing || score > existing.score) {
      await supabase
        .from('game_scores')
        .upsert({
          user_id: user.id,
          game_type: 'space_chess_tactics',
          score,
        }, {
          onConflict: 'user_id,game_type'
        });
      setHighScore(score);
    }
  };

  const getPieceEmoji = (piece: Piece | null): string => {
    if (!piece) return '';
    const emojis = {
      white: { pawn: '♙', rook: '♖', knight: '♘', bishop: '♗', queen: '♕', king: '♔' },
      black: { pawn: '♟', rook: '♜', knight: '♞', bishop: '♝', queen: '♛', king: '♚' },
    };
    return emojis[piece.color][piece.type];
  };

  if (gameState === 'menu') {
    return (
      <View style={[styles.container, { backgroundColor: theme.base.background }]}>
        <View style={styles.menuContainer}>
          <Chess size={64} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Space Chess Tactics</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Strategic chess gameplay
          </Text>
          {highScore > 0 && (
            <Text style={[styles.highScore, { color: theme.text.secondary }]}>
              High Score: {highScore}
            </Text>
          )}
          <TouchableOpacity
            onPress={startGame}
            style={[styles.button, { backgroundColor: theme.primary }]}
          >
            <Play size={24} color={theme.text.inverse} />
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Start Game</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (gameState === 'gameover') {
    return (
      <View style={[styles.container, { backgroundColor: theme.base.background }]}>
        <View style={styles.menuContainer}>
          <Trophy size={64} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Game Over</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Final Score: {score}
          </Text>
          <TouchableOpacity
            onPress={startGame}
            style={[styles.button, { backgroundColor: theme.primary }]}
          >
            <Play size={24} color={theme.text.inverse} />
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setGameState('menu')}
            style={[styles.button, { backgroundColor: theme.base.card, marginTop: 10 }]}
          >
            <Text style={[styles.buttonText, { color: theme.text.primary }]}>Main Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.base.background }]}>
      <View style={styles.gameHeader}>
        <View style={styles.stats}>
          <Text style={[styles.statText, { color: theme.text.primary }]}>Score: {score}</Text>
          <View style={styles.playerIndicator}>
            <Crown size={16} color={currentPlayer === 'white' ? theme.text.primary : theme.text.tertiary} />
            <Text style={[styles.statText, { color: theme.text.primary }]}>
              {currentPlayer === 'white' ? 'White' : 'Black'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={endGame}
          style={[styles.endButton, { backgroundColor: theme.status.error }]}
        >
          <Text style={[styles.endButtonText, { color: theme.text.inverse }]}>End</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.boardContainer}>
        {board.map((row, y) =>
          row.map((piece, x) => {
            const isSelected = selectedCell?.x === x && selectedCell?.y === y;
            const isLight = (x + y) % 2 === 0;
            
            return (
              <TouchableOpacity
                key={`${x}-${y}`}
                style={[
                  styles.cell,
                  {
                    backgroundColor: isSelected
                      ? theme.primary
                      : isLight
                      ? theme.base.card
                      : theme.base.surface,
                  },
                ]}
                onPress={() => handleCellPress(x, y)}
              >
                {piece && (
                  <Text style={styles.pieceEmoji}>{getPieceEmoji(piece)}</Text>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuContainer: {
    alignItems: 'center',
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  highScore: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    minWidth: 150,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  stats: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
  },
  playerIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  endButton: {
    padding: 10,
    borderRadius: 8,
  },
  endButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  boardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    alignSelf: 'center',
    marginTop: 20,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieceEmoji: {
    fontSize: 32,
  },
});

