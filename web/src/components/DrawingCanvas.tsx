import React, { useRef, useEffect, useState } from 'react';
import { Palette, Eraser, Trash2 } from 'lucide-react';
import { socketService } from '../services/socket';
import { DrawData } from '../types/game';

interface DrawingCanvasProps {
  isDrawer: boolean;
}

export default function DrawingCanvas({ isDrawer }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  // Debug drawer permissions
  console.log('🎨 Web Canvas - Drawing permissions:', {
    isDrawer: isDrawer,
    timestamp: new Date().toLocaleTimeString()
  });

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set initial canvas properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Listen for drawing data from other players
    socketService.onDrawing((drawData: DrawData) => {
      // Convert normalized coordinates (0-1) back to canvas coordinates
      const canvasDrawData = {
        ...drawData,
        x: drawData.x * canvas.width,
        y: drawData.y * canvas.height,
      };
      
      drawOnCanvas(ctx, canvasDrawData);
    });

    socketService.onClearCanvas(() => {
      clearCanvas();
    });
    
    // Clear canvas when game state updates with new round
    const checkForRoundChange = (gameData: any) => {
      if (gameData.canvasCleared) {
        clearCanvas();
      }
    };
    
    socketService.onGameStateUpdate(checkForRoundChange);

    return () => {
      socketService.offAll();
    };
  }, []);

  const drawOnCanvas = (ctx: CanvasRenderingContext2D, drawData: DrawData) => {
    ctx.globalCompositeOperation = drawData.color === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = drawData.color || '#000000';
    ctx.lineWidth = drawData.size || 3;

    if (drawData.type === 'start') {
      ctx.beginPath();
      ctx.moveTo(drawData.x, drawData.y);
    } else if (drawData.type === 'draw') {
      ctx.lineTo(drawData.x, drawData.y);
      ctx.stroke();
    }
  };

  const getCanvasPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;

    setIsDrawing(true);
    const pos = getCanvasPosition(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const drawData: DrawData = {
      type: 'start',
      x: pos.x,
      y: pos.y,
      color: tool === 'eraser' ? 'eraser' : currentColor,
      size: brushSize,
      timestamp: Date.now(),
    };

    // Draw locally with pixel coordinates
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawOnCanvas(ctx, drawData);
    }

    // Send normalized coordinates (0-1) for cross-platform compatibility
    const normalizedDrawData: DrawData = {
      ...drawData,
      x: pos.x / canvas.width,
      y: pos.y / canvas.height,
    };

    socketService.sendDrawing(normalizedDrawData);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawer) return;

    const pos = getCanvasPosition(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const drawData: DrawData = {
      type: 'draw',
      x: pos.x,
      y: pos.y,
      color: tool === 'eraser' ? 'eraser' : currentColor,
      size: brushSize,
      timestamp: Date.now(),
    };

    // Draw locally with pixel coordinates
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawOnCanvas(ctx, drawData);
    }

    // Send normalized coordinates (0-1) for cross-platform compatibility
    const normalizedDrawData: DrawData = {
      ...drawData,
      x: pos.x / canvas.width,
      y: pos.y / canvas.height,
    };

    socketService.sendDrawing(normalizedDrawData);
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawer) return;
    
    setIsDrawing(false);
    
    // Send 'end' event if we have a position, otherwise send last known position
    const pos = e ? getCanvasPosition(e) : { x: 0, y: 0 };
    const canvas = canvasRef.current;
    if (!canvas) return;

    const normalizedDrawData: DrawData = {
      type: 'end',
      x: pos.x / canvas.width,
      y: pos.y / canvas.height,
      color: tool === 'eraser' ? 'eraser' : currentColor,
      size: brushSize,
      timestamp: Date.now(),
    };

    socketService.sendDrawing(normalizedDrawData);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isDrawer) {
      socketService.clearCanvas();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Drawing Tools */}
      {isDrawer && (
        <div className="p-4 border-b bg-gray-50 space-y-3">
          {/* Color Palette */}
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-gray-600" />
            <div className="flex space-x-1">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setCurrentColor(color);
                    setTool('pen');
                  }}
                  className={`w-6 h-6 rounded border-2 transition-all ${
                    currentColor === color && tool === 'pen'
                      ? 'border-gray-800 scale-110'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Tools and Settings */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setTool('pen')}
                className={`p-2 rounded-lg transition-colors ${
                  tool === 'pen'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <Palette className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTool('eraser')}
                className={`p-2 rounded-lg transition-colors ${
                  tool === 'eraser'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <Eraser className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Size:</span>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-16"
                />
                <span className="text-sm font-medium w-6">{brushSize}</span>
              </div>

              <button
                onClick={clearCanvas}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                title="Clear canvas"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className={`border-2 border-gray-300 rounded-lg bg-white shadow-inner ${
            isDrawer ? 'cursor-crosshair' : 'cursor-not-allowed'
          }`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      {/* Status */}
      <div className="p-2 text-center text-sm text-gray-600 bg-gray-50">
        {isDrawer ? 'You are drawing!' : 'Watch and guess what is being drawn'}
      </div>
    </div>
  );
} 