import { useState, useEffect, useCallback } from "react";

const useCanvasDrawing = (canvasRef) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [penColor, setPenColor] = useState("#000000");
  const [penSize, setPenSize] = useState(5);

  const getCanvasContext = useCallback(() => {
    return canvasRef.current ? canvasRef.current.getContext("2d") : null;
  }, [canvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = getCanvasContext();
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = penColor;
    context.lineWidth = penSize;
  }, [canvasRef, getCanvasContext, penColor, penSize]);

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(canvas.toDataURL());
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [canvasRef, history, historyIndex]);

  const getTouchPosition = (nativeEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    const touch = nativeEvent.touches ? nativeEvent.touches[0] : nativeEvent;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = useCallback(
    (event) => {
      const pos = getTouchPosition(event.nativeEvent);
      if (!pos) return;
      const { x, y } = pos;

      const context = getCanvasContext();
      if (!context) return;
      context.beginPath();
      context.moveTo(x, y);
      setIsDrawing(true);
    },
    [getCanvasContext]
  );

  const draw = useCallback(
    (event) => {
      if (!isDrawing) return;
      const pos = getTouchPosition(event.nativeEvent);
      if (!pos) return;
      const { x, y } = pos;

      const context = getCanvasContext();
      if (!context) return;
      context.lineTo(x, y);
      context.stroke();
    },
    [isDrawing, getCanvasContext]
  );

  const finishDrawing = useCallback(() => {
    if (!isDrawing) return;
    const context = getCanvasContext();
    if (!context) return;
    context.closePath();
    setIsDrawing(false);
    saveHistory();
  }, [isDrawing, getCanvasContext, saveHistory]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = getCanvasContext();
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    saveHistory();
  }, [canvasRef, getCanvasContext, saveHistory]);

  const redrawFromHistory = useCallback(
    (index) => {
      if (index < 0 || index >= history.length) return;
      const canvas = canvasRef.current;
      const context = getCanvasContext();
      if (!canvas || !context) return;
      const img = new Image();
      img.src = history[index];
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
      };
    },
    [canvasRef, getCanvasContext, history]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      redrawFromHistory(newIndex);
    }
  }, [historyIndex, redrawFromHistory]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      redrawFromHistory(newIndex);
    }
  }, [historyIndex, history.length, redrawFromHistory]);

  return {
    isDrawing,
    startDrawing,
    draw,
    finishDrawing,
    clearCanvas,
    undo,
    redo,
    setPenColor,
    setPenSize,
  };
};

export default useCanvasDrawing;

