import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import globalModelManager from "../../services/globalModelManager";

const HandwritingTextInput = ({
  value = "",
  onChange,
  placeholder = "내용을 입력하세요",
  label = "입력 항목",
  disabled = false,
  required = false,
}) => {
  const [mode, setMode] = useState("typing");
  const [typingText, setTypingText] = useState(value);
  const [handwritingBase64, setHandwritingBase64] = useState("");
  const [recognizedText, setRecognizedText] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [conversionError, setConversionError] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelError, setModelError] = useState(null);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 200 });
  const drawingTimerRef = useRef(null);
  const lastDrawTimeRef = useRef(null);
  const lastPosRef = useRef({ offsetX: 0, offsetY: 0 });

  useEffect(() => {
    const checkModelStatus = async () => {
      try {
        const isLoaded = globalModelManager.isLoaded || false;
        const hasSession = globalModelManager.session !== null;
        setIsModelLoaded(isLoaded && hasSession);
        setModelError(null);
        if (!isLoaded || !hasSession) {
          try {
            await globalModelManager.initialize();
            const newIsLoaded = globalModelManager.isLoaded || false;
            const newHasSession = globalModelManager.session !== null;
            setIsModelLoaded(newIsLoaded && newHasSession);
          } catch (initError) {
            console.error(
              `❌ [HandwritingTextInput] "${label}" 모델 초기화 실패:`,
              initError
            );
            setModelError(initError.message);
            setIsModelLoaded(false);
            setConversionError("AI 모델 로딩에 실패했습니다.");
          }
        }
      } catch (error) {
        console.error(
          `❌ [HandwritingTextInput] "${label}" globalModelManager 상태 확인 실패:`,
          error
        );
        setModelError(error.message);
        setIsModelLoaded(false);
        setConversionError("AI 모델 연결에 실패했습니다.");
      }
    };
    checkModelStatus();
  }, [label]);

  useEffect(() => {
    if (value !== typingText) {
      setTypingText(value);
    }
  }, [value, typingText, label]);

  const updateCanvasSize = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const newWidth = Math.min(Math.max(containerWidth - 32, 300), 800);
    const newHeight = Math.max(newWidth * 0.25, 150);
    setCanvasSize((prev) => {
      if (
        Math.abs(prev.width - newWidth) > 10 ||
        Math.abs(prev.height - newHeight) > 10
      ) {
        return { width: newWidth, height: newHeight };
      }
      return prev;
    });
  }, [label]);

  useEffect(() => {
    updateCanvasSize();
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener("resize", updateCanvasSize);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [updateCanvasSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const context = canvas.getContext("2d");
    const pixelRatio = window.devicePixelRatio || 1;
    if (pixelRatio > 1) {
      canvas.style.width = canvasSize.width + "px";
      canvas.style.height = canvasSize.height + "px";
      canvas.width = canvasSize.width * pixelRatio;
      canvas.height = canvasSize.height * pixelRatio;
      context.scale(pixelRatio, pixelRatio);
    }
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#000000";
    context.lineWidth = 4;
    context.imageSmoothingEnabled = true;
    contextRef.current = context;
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, [mode, canvasSize, label]);

  const getEventPos = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };

    const rect = canvas.getBoundingClientRect();

    // 터치 이벤트와 마우스 이벤트 구분
    let clientX, clientY;
    if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;

    // context 설정은 여기서 하지 말고 다른 곳에서 처리
    // const context = contextRef.current; // 이 부분을 제거하거나 적절히 수정

    return { offsetX, offsetY };
  }, []);

  const startDrawing = useCallback(
    (event) => {
      if (disabled || !isModelLoaded) return;

      // 터치 이벤트인 경우에만 preventDefault 호출
      if (event.type === "touchstart") {
        event.preventDefault();
      } else if (event.type === "mousedown") {
        event.preventDefault();
      }

      const { offsetX, offsetY } = getEventPos(event);
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
      lastPosRef.current = { offsetX, offsetY };
      setIsDrawing(true);
      lastDrawTimeRef.current = Date.now();

      if (drawingTimerRef.current) {
        clearTimeout(drawingTimerRef.current);
        drawingTimerRef.current = null;
      }
    },
    [disabled, isModelLoaded, getEventPos, label]
  );

  const draw = useCallback(
    (event) => {
      if (!isDrawing || disabled || !isModelLoaded) return;

      // 조건부 preventDefault
      if (event.type === "touchmove") {
        event.preventDefault();
      }

      const { offsetX, offsetY } = getEventPos(event);
      const ctx = contextRef.current;
      const lastPos = lastPosRef.current;

      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(lastPos.offsetX, lastPos.offsetY);
      ctx.quadraticCurveTo(
        (lastPos.offsetX + offsetX) / 2,
        (lastPos.offsetY + offsetY) / 2,
        offsetX,
        offsetY
      );
      ctx.stroke();

      lastPosRef.current = { offsetX, offsetY };
      lastDrawTimeRef.current = Date.now();
    },
    [isDrawing, disabled, isModelLoaded, getEventPos]
  );

  const finishDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    contextRef.current.closePath();
    if (drawingTimerRef.current) {
      clearTimeout(drawingTimerRef.current);
    }
    drawingTimerRef.current = setTimeout(async () => {
      const timeSinceLastDraw = Date.now() - (lastDrawTimeRef.current || 0);
      if (timeSinceLastDraw < 1000) return;
      await performTextConversion();
    }, 1000);
  }, [isDrawing, label]);

  const performTextConversion = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      setConversionError(null);
      setIsProcessing(true);
      const base64String = canvas.toDataURL("image/png", 0.8);
      setHandwritingBase64(base64String);
      const convertedText = await globalModelManager.predict(base64String);
      if (convertedText && convertedText.trim()) {
        const cleanedText = convertedText.trim();
        setRecognizedText(cleanedText);
        setShowPreview(true);
      } else {
        setRecognizedText("");
        setShowPreview(true);
        setConversionError("인식된 텍스트가 없습니다.");
      }
    } catch (error) {
      console.error(
        `❌ [HandwritingTextInput] "${label}" globalModelManager 변환 실패:`,
        error
      );
      setConversionError("필기 인식에 실패했습니다. 다시 시도해주세요.");
      setShowPreview(true);
    } finally {
      setIsProcessing(false);
    }
  }, [label]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    if (drawingTimerRef.current) {
      clearTimeout(drawingTimerRef.current);
      drawingTimerRef.current = null;
    }
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    setHandwritingBase64("");
    setRecognizedText("");
    setShowPreview(false);
    setConversionError(null);
  }, [label]);

  const switchToTyping = useCallback(() => {
    if (recognizedText && recognizedText.trim()) {
      setTypingText(recognizedText);
      onChange?.(recognizedText);
    }
    setMode("typing");
  }, [recognizedText, onChange, label]);

  const switchToHandwriting = useCallback(() => {
    setMode("handwriting");
    if (typingText && typingText.trim()) {
      setRecognizedText(typingText);
      setShowPreview(true);
    }
  }, [typingText, label]);

  const handleTypingChange = useCallback(
    (event) => {
      const newValue = event.target.value;
      setTypingText(newValue);
      onChange?.(newValue);
    },
    [onChange]
  );

  const handlePreviewEdit = useCallback((event) => {
    const newValue = event.target.value;
    setRecognizedText(newValue);
  }, []);

  const applyPreviewToTyping = useCallback(() => {
    if (recognizedText) {
      setTypingText(recognizedText);
      onChange?.(recognizedText);
      setMode("typing");
    }
  }, [recognizedText, onChange, label]);

  const triggerManualConversion = useCallback(async () => {
    if (!handwritingBase64 && canvasRef.current) {
      await performTextConversion();
    } else if (recognizedText) {
      setShowPreview(true);
    }
  }, [handwritingBase64, recognizedText, performTextConversion, label]);

  useEffect(() => {
    return () => {
      if (drawingTimerRef.current) {
        clearTimeout(drawingTimerRef.current);
      }
    };
  }, [label]);

  const isInputDisabled = useMemo(() => {
    return disabled || !isModelLoaded;
  }, [disabled, isModelLoaded]);

  return (
    <div
      ref={containerRef}
      className="w-full space-y-4 border border-gray-300 rounded-lg p-4 bg-gray-50"
    >
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center space-x-2 text-xs">
          <span
            className={`px-2 py-1 rounded ${
              isModelLoaded
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isModelLoaded ? "✅ AI 준비" : "❌ AI 로딩 중"}
          </span>
          {isProcessing && (
            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
              🔄 변환 중
            </span>
          )}
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          type="button"
          onClick={switchToTyping}
          className={`px-4 py-2 rounded-md transition-colors ${
            mode === "typing"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          ⌨️ 타이핑 모드
        </button>
        <button
          type="button"
          onClick={switchToHandwriting}
          disabled={isInputDisabled}
          className={`px-4 py-2 rounded-md transition-colors ${
            mode === "handwriting"
              ? "bg-green-600 text-white"
              : isInputDisabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          🖋️ 필기 모드 {isInputDisabled && "(AI 로딩 중)"}
        </button>
      </div>

      {mode === "typing" && (
        <div className="space-y-2">
          <textarea
            value={typingText}
            onChange={handleTypingChange}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical min-h-[100px] disabled:bg-gray-100 disabled:text-gray-500"
            rows={4}
          />
          <div className="text-xs text-gray-500">{typingText.length}글자</div>
        </div>
      )}

      {mode === "handwriting" && (
        <div className="space-y-4">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className={`border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair ${
                isInputDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:border-gray-400"
              }`}
              style={{
                width: `${canvasSize.width}px`,
                height: `${canvasSize.height}px`,
                touchAction: "none",
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={finishDrawing}
              onMouseLeave={finishDrawing}
              onTouchStart={(e) => {
                e.preventDefault(); // 여기서 preventDefault 처리
                startDrawing(e);
              }}
              onTouchMove={(e) => {
                e.preventDefault(); // 여기서 preventDefault 처리
                draw(e);
              }}
              onTouchEnd={finishDrawing}
            />
            {!handwritingBase64 && !isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-gray-400 text-center">
                  <p className="text-lg">🖋️ 마우스나 터치로 글씨를 써주세요</p>
                  <p className="text-sm mt-1">
                    필기 완료 1초 후 자동으로 텍스트 변환됩니다
                  </p>
                  {canvasSize && (
                    <p className="text-xs mt-2 opacity-75">
                      캔버스 크기: {canvasSize.width} × {canvasSize.height}px
                    </p>
                  )}
                </div>
              </div>
            )}
            {isProcessing && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">
                    🤖 필기를 분석하는 중...
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={clearCanvas}
              disabled={isInputDisabled}
              className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              🗑️ 지우기
            </button>
            <button
              type="button"
              onClick={triggerManualConversion}
              disabled={isInputDisabled || isProcessing}
              className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? "🔄 변환 중..." : "🤖 수동 변환"}
            </button>
          </div>
          {conversionError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">⚠️ {conversionError}</p>
            </div>
          )}
          {showPreview && (
            <div className="space-y-3 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-green-800">
                  ✅ 필기에서 변환된 텍스트:
                </h4>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="text-green-600 hover:text-green-800"
                >
                  ✕
                </button>
              </div>
              <div className="bg-white border border-green-300 rounded p-2">
                <p className="text-sm text-gray-700 italic">
                  "{recognizedText}"
                </p>
              </div>
              <textarea
                value={recognizedText}
                onChange={handlePreviewEdit}
                placeholder="✍️ 필기를 하시면 변환된 텍스트가 여기에 표시됩니다"
                className="w-full p-3 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical min-h-[80px]"
                rows={3}
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-green-600">
                  💡 변환된 텍스트를 수정할 수 있습니다. (globalModelManager
                  사용)
                </div>
                <div className="text-xs text-gray-500">
                  {recognizedText.length}자
                </div>
              </div>
              <button
                type="button"
                onClick={applyPreviewToTyping}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                📝 타이핑 모드로 적용
              </button>
            </div>
          )}
          {typingText && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                타이핑 모드에서 입력한 내용:
              </h4>
              <div className="bg-white border border-blue-300 rounded p-2">
                <p className="text-sm text-gray-700 italic">"{typingText}"</p>
              </div>
            </div>
          )}
        </div>
      )}

      
    </div>
  );
};

export default HandwritingTextInput;
