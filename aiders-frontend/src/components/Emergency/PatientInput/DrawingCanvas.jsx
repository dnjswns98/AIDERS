import React from 'react';
import { useCanvasDrawing } from '../../../hooks/useCanvasDrawing'; 
import DrawingTools from './DrawingTools';

const DrawingCanvas = ({ drawingMode, setDrawingMode, value, onChange, name }) => {
  const { canvasRef, clearCanvas } = useCanvasDrawing(
    drawingMode, 
    'drawing', 
    value, 
    onChange, 
    name
  );

  return (
    <div className="relative border border-gray-300 rounded-md shadow-sm overflow-hidden h-64">
      <canvas
        ref={canvasRef}
        className="bg-white"
        style={{ touchAction: 'none', width: '100%', height: '100%' }}
      />
      <DrawingTools 
        drawingMode={drawingMode}
        setDrawingMode={setDrawingMode}
        onClear={clearCanvas}
      />
    </div>
  );
};

export default DrawingCanvas;
