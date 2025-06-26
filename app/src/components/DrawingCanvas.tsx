import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  PanResponder,
} from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { socketService } from '../services/socket';
import { DrawData } from '../types/game';

interface DrawingCanvasProps {
  width: number;
  height: number;
  disabled?: boolean;
}

interface Point {
  x: number;
  y: number;
}

interface DrawPath {
  path: string;
  color: string;
  width: number;
}

const COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#008000', '#000080'
];

const BRUSH_SIZES = [2, 5, 10, 15, 20];

export default function DrawingCanvas({ 
  width, 
  height, 
  disabled = false 
}: DrawingCanvasProps) {
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentBrushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showTools, setShowTools] = useState(false);
  
  const pathRef = useRef<string>('');
  const remotePathRef = useRef<string>(''); // Separate ref for remote drawing
  const lastPoint = useRef<Point | null>(null);
  const isDrawingRef = useRef<boolean>(false); // Immediate ref for touch handlers
  const hasMovedRef = useRef<boolean>(false); // Track if we've had move events

  useEffect(() => {
    // Listen for drawing data from other players
    socketService.onDrawing((drawData: DrawData) => {
      handleRemoteDrawing(drawData);
    });

    socketService.onClearCanvas(() => {
      setPaths([]);
    });
    
    // Clear canvas when game state updates with new round
    socketService.onGameStateUpdate((gameData: any) => {
      if (gameData.canvasCleared) {
        setPaths([]);
        setCurrentPath('');
        pathRef.current = '';
        remotePathRef.current = '';
      }
    });

    return () => {
      // Clean up listeners handled by socket service
    };
  }, []);

  const handleRemoteDrawing = (drawData: DrawData) => {
    // Convert normalized coordinates back to canvas coordinates
    const canvasX = drawData.x * width;
    const canvasY = drawData.y * height;
    
    if (drawData.type === 'start') {
      // Start new remote path
      remotePathRef.current = `M${canvasX},${canvasY}`;
    } else if (drawData.type === 'draw') {
      // Continue remote path
      remotePathRef.current += ` L${canvasX},${canvasY}`;
      setCurrentPath(remotePathRef.current);
    } else if (drawData.type === 'end') {
      // End remote path and add to paths
      const newPath: DrawPath = {
        path: remotePathRef.current,
        color: drawData.color || '#000000',
        width: drawData.size || 5,
      };
      setPaths(prev => [...prev, newPath]);
      setCurrentPath('');
      remotePathRef.current = '';
    }
  };

  const sendDrawData = (type: DrawData['type'], x: number, y: number) => {
    if (disabled) return;

    const drawData: DrawData = {
      type,
      x: x / width, // Normalize coordinates
      y: y / height,
      color: currentColor,
      size: currentBrushSize,
      timestamp: Date.now(),
    };

    socketService.sendDrawing(drawData);
  };

  // Create PanResponder for touch handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      
      // Add these to help with touch handling
      onStartShouldSetPanResponderCapture: () => !disabled,
      onMoveShouldSetPanResponderCapture: () => !disabled,
      
            onPanResponderGrant: (evt) => {
        if (disabled) return;
        
        const { locationX, locationY } = evt.nativeEvent;
        
        setIsDrawing(true);
        isDrawingRef.current = true; // Set ref immediately
        hasMovedRef.current = false; // Reset move tracking
        lastPoint.current = { x: locationX, y: locationY };
        
        // Start with a simple point
        pathRef.current = `M${locationX},${locationY}`;
        setCurrentPath(pathRef.current);
        sendDrawData('start', locationX, locationY);
        
        // Fallback for single taps (no move events)
        setTimeout(() => {
          if (isDrawingRef.current && !hasMovedRef.current && pathRef.current) {
            // Make it a small circle for visibility
            pathRef.current = `M${locationX-2},${locationY} A2,2 0 1,1 ${locationX+2},${locationY} A2,2 0 1,1 ${locationX-2},${locationY}`;
            const newPath: DrawPath = {
              path: pathRef.current,
              color: currentColor,
              width: currentBrushSize,
            };
            setPaths(prev => [...prev, newPath]);
            setCurrentPath('');
            pathRef.current = '';
            setIsDrawing(false);
            isDrawingRef.current = false;
            lastPoint.current = null;
          }
        }, 150);
      },
      
      onPanResponderMove: (evt) => {
        if (disabled || !isDrawingRef.current) {
          return;
        }
        
        const { locationX, locationY } = evt.nativeEvent;
        
        hasMovedRef.current = true; // Mark that we've moved
        
        if (lastPoint.current) {
          pathRef.current += ` L${locationX},${locationY}`;
          setCurrentPath(pathRef.current);
          sendDrawData('draw', locationX, locationY);
          lastPoint.current = { x: locationX, y: locationY };
        }
      },
      
      onPanResponderRelease: (evt) => {
        if (disabled || !isDrawingRef.current) {
          return;
        }
        
        const { locationX, locationY } = evt.nativeEvent;
        
        const newPath: DrawPath = {
          path: pathRef.current,
          color: currentColor,
          width: currentBrushSize,
        };
        setPaths(prev => [...prev, newPath]);
        setCurrentPath('');
        pathRef.current = '';
        setIsDrawing(false);
        isDrawingRef.current = false; // Clear ref too
        lastPoint.current = null;
        sendDrawData('end', locationX, locationY);
      },
      
      // Also handle termination
      onPanResponderTerminate: (evt) => {
        if (disabled || !isDrawing) return;
        
        const newPath: DrawPath = {
          path: pathRef.current,
          color: currentColor,
          width: currentBrushSize,
        };
        setPaths(prev => [...prev, newPath]);
        setCurrentPath('');
        pathRef.current = '';
        setIsDrawing(false);
        isDrawingRef.current = false; // Clear ref too
        lastPoint.current = null;
      },
    })
  ).current;

  const clearCanvas = () => {
    if (disabled) return;
    setPaths([]);
    setCurrentPath('');
    pathRef.current = '';
    socketService.clearCanvas();
  };

  const undoLastPath = () => {
    if (disabled || paths.length === 0) return;
    setPaths(prev => prev.slice(0, -1));
  };

  if (disabled && !showTools) {
    // Show minimal interface for non-drawers
    return (
      <View style={[styles.container, { width, height }]}>
        <Svg width={width} height={height} style={styles.svg}>
          <G>
            {/* Render all paths */}
            {paths.map((pathData, index) => (
              <Path
                key={index}
                d={pathData.path}
                stroke={pathData.color}
                strokeWidth={pathData.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
            {/* Render current path */}
            {currentPath && (
              <Path
                d={currentPath}
                stroke={currentColor}
                strokeWidth={currentBrushSize}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
          </G>
        </Svg>
        
        <View style={styles.disabledOverlay}>
          <Text style={styles.disabledText}>👀 Watch the drawer!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Drawing Tools */}
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.toolButton}
          onPress={() => setShowTools(!showTools)}
        >
          <Text style={styles.toolButtonText}>{showTools ? '▼' : '🎨'}</Text>
        </TouchableOpacity>
        
        {showTools && (
          <View style={styles.toolsPanel}>
            {/* Color Palette */}
            <View style={styles.colorPalette}>
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    currentColor === color && styles.selectedColor,
                    color === '#FFFFFF' && styles.whiteColorBorder,
                  ]}
                  onPress={() => setCurrentColor(color)}
                />
              ))}
            </View>
            
            {/* Brush Sizes */}
            <View style={styles.brushSizes}>
              {BRUSH_SIZES.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.brushButton,
                    currentBrushSize === size && styles.selectedBrush,
                  ]}
                  onPress={() => setBrushSize(size)}
                >
                  <View
                    style={[
                      styles.brushIndicator,
                      { width: size, height: size, backgroundColor: currentColor },
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={undoLastPath}>
                <Text style={styles.actionButtonText}>↶ Undo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={clearCanvas}>
                <Text style={styles.actionButtonText}>🗑️ Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Canvas */}
      <View 
        style={[
          styles.canvasContainer, 
          { width, height },
          isDrawing && styles.canvasActive
        ]}
        {...panResponder.panHandlers}
      >
        <Svg width={width} height={height} style={styles.svg}>
          <G>

            
            {/* Render all paths */}
            {paths.map((pathData, index) => (
              <Path
                key={index}
                d={pathData.path}
                stroke={pathData.color}
                strokeWidth={pathData.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
            {/* Render current path */}
            {currentPath && (
              <Path
                d={currentPath}
                stroke={currentColor}
                strokeWidth={currentBrushSize}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
          </G>
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  canvasContainer: {
    backgroundColor: 'white',
    position: 'relative',
  },
  svg: {
    backgroundColor: 'white',
  },
  toolbar: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
  },
  toolButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolButtonText: {
    color: 'white',
    fontSize: 16,
  },
  toolsPanel: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    maxWidth: 280,
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 4,
  },
  colorButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    margin: 2,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#8B5CF6',
  },
  whiteColorBorder: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  brushSizes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  brushButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  selectedBrush: {
    backgroundColor: '#8B5CF6',
  },
  brushIndicator: {
    borderRadius: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  canvasActive: {
    borderColor: '#8B5CF6',
    borderWidth: 3,
  },
}); 