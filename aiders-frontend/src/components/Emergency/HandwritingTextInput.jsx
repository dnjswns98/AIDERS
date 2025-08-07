// components/Emergency/HandwritingTextInput.jsx
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useCRNNModel } from '../../hooks/useCRNNModel';

const HandwritingTextInput = ({
  value = '',
  onChange,
  placeholder = '내용을 입력하세요',
  label = '입력 항목',
  disabled = false,
  required = false
}) => {
  // 🔥 상태 관리 (최적화)
  const [mode, setMode] = useState('typing'); // 'typing' | 'handwriting'
  const [typingText, setTypingText] = useState(value);
  const [handwritingBase64, setHandwritingBase64] = useState('');
  const [recognizedText, setRecognizedText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [conversionError, setConversionError] = useState(null); // 🔥 변환 오류 상태 추가

  // 🔥 CRNN 모델 훅
  const { isModelLoaded, isProcessing, convertHandwritingToText, initializeModel } = useCRNNModel();

  // 🔥 캔버스 관련 refs (개선)
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const containerRef = useRef(null); // 🔥 컨테이너 ref 추가 (반응형)
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 200 }); // 🔥 반응형 크기

  // 🔥 필기 완료 감지용 타이머 ref (개선)
  const drawingTimerRef = useRef(null);
  const lastDrawTimeRef = useRef(null);

  // 🔥 컴포넌트 마운트 시 모델 초기화 (개선)
  useEffect(() => {
    console.log('🤖 [HandwritingTextInput] 컴포넌트 마운트, 모델 초기화');
    initializeModel().catch(error => {
      console.error('❌ [HandwritingTextInput] 모델 초기화 실패:', error);
      setConversionError('CRNN 모델 로딩에 실패했습니다.');
    });
  }, [initializeModel]);

  // 🔥 외부 value와 동기화 (최적화)
  useEffect(() => {
    if (value !== typingText) {
      console.log(`🔄 [HandwritingTextInput] 외부 value 동기화: "${value}"`);
      setTypingText(value);
    }
  }, [value, typingText]);

  // 🔥 반응형 캔버스 크기 계산 (새로 추가)
  const updateCanvasSize = useCallback(() => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    const newWidth = Math.min(Math.max(containerWidth - 32, 300), 800); // 최소 300px, 최대 800px
    const newHeight = Math.max(newWidth * 0.25, 150); // 비율 유지, 최소 150px
    
    setCanvasSize({ width: newWidth, height: newHeight });
    console.log(`📏 [캔버스] 크기 업데이트: ${newWidth}x${newHeight}`);
  }, []);

  // 🔥 리사이즈 이벤트 리스너 (새로 추가)
  useEffect(() => {
    updateCanvasSize();
    
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [updateCanvasSize]);

  // 🔥 캔버스 초기화 (개선된 버전)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 🔥 반응형 크기 설정
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    const context = canvas.getContext('2d');
    
    // 🔥 고해상도 디스플레이 지원
    const pixelRatio = window.devicePixelRatio || 1;
    if (pixelRatio > 1) {
      canvas.style.width = canvasSize.width + 'px';
      canvas.style.height = canvasSize.height + 'px';
      canvas.width = canvasSize.width * pixelRatio;
      canvas.height = canvasSize.height * pixelRatio;
      context.scale(pixelRatio, pixelRatio);
    }
    
    // 🔥 캔버스 설정 최적화
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#000000';
    context.lineWidth = 2;
    context.imageSmoothingEnabled = true;
    
    contextRef.current = context;

    // 🔥 캔버스 배경을 흰색으로 설정
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    console.log(`🎨 [캔버스] 초기화 완료: ${canvasSize.width}x${canvasSize.height}, pixelRatio: ${pixelRatio}`);
  }, [mode, canvasSize]);

  // 🔥 좌표 계산 헬퍼 함수 (터치/마우스 통합)
  const getEventPos = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    
    let clientX, clientY;
    
    if (event.touches && event.touches[0]) {
      // 터치 이벤트
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      // 마우스 이벤트
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    return {
      offsetX: (clientX - rect.left) * (canvas.width / rect.width) / pixelRatio,
      offsetY: (clientY - rect.top) * (canvas.height / rect.height) / pixelRatio
    };
  }, []);

  // 🔥 필기 시작 (터치/마우스 통합)
  const startDrawing = useCallback((event) => {
    if (disabled || !isModelLoaded) return;
    
    event.preventDefault(); // 🔥 스크롤 방지
    
    const { offsetX, offsetY } = getEventPos(event);
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    lastDrawTimeRef.current = Date.now();
    
    // 🔥 기존 타이머 클리어
    if (drawingTimerRef.current) {
      clearTimeout(drawingTimerRef.current);
      drawingTimerRef.current = null;
    }
    
    console.log(`✍️ [필기] 시작: (${offsetX.toFixed(1)}, ${offsetY.toFixed(1)})`);
  }, [disabled, isModelLoaded, getEventPos]);

  // 🔥 필기 진행 (터치/마우스 통합)
  const draw = useCallback((event) => {
    if (!isDrawing || disabled || !isModelLoaded) return;
    
    event.preventDefault(); // 🔥 스크롤 방지
    
    const { offsetX, offsetY } = getEventPos(event);
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    lastDrawTimeRef.current = Date.now();
  }, [isDrawing, disabled, isModelLoaded, getEventPos]);

  // 🔥 필기 종료 (디바운스 처리 개선)
  const finishDrawing = useCallback(() => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    contextRef.current.closePath();
    
    console.log('🖋️ [필기] 종료, 자동 변환 타이머 설정');
    
    // 🔥 디바운스 처리: 1초 후 자동 변환
    drawingTimerRef.current = setTimeout(async () => {
      const timeSinceLastDraw = Date.now() - (lastDrawTimeRef.current || 0);
      
      if (timeSinceLastDraw < 1000) {
        console.log('🔄 [필기] 아직 필기 중일 수 있음, 변환 지연');
        return;
      }
      
      console.log('🤖 [필기] 필기 완료, CRNN 변환 시작');
      await performTextConversion();
    }, 1000);
  }, [isDrawing]);

  // 🔥 텍스트 변환 함수 분리 (성능 최적화)
  const performTextConversion = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    try {
      setConversionError(null);
      
      // 🔥 캔버스를 base64로 변환 (최적화)
      const base64String = canvas.toDataURL('image/png', 0.8); // 압축률 설정
      setHandwritingBase64(base64String);
      
      console.log('📄 [변환] Base64 생성 완료, CRNN 호출');
      
      // 🔥 CRNN으로 텍스트 변환
      const convertedText = await convertHandwritingToText(base64String);
      
      if (convertedText && convertedText.trim()) {
        setRecognizedText(convertedText.trim());
        setShowPreview(true);
        console.log('✅ [변환] 텍스트 변환 성공:', convertedText);
      } else {
        console.warn('⚠️ [변환] 빈 결과 반환');
        setRecognizedText('');
        setShowPreview(true); // 빈 결과도 미리보기 표시
      }
      
    } catch (error) {
      console.error('❌ [변환] 텍스트 변환 실패:', error);
      setConversionError('필기 인식에 실패했습니다. 다시 시도해주세요.');
      setShowPreview(true);
    }
  }, [convertHandwritingToText]);

  // 🔥 캔버스 지우기 (개선)
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    
    // 🔥 타이머 클리어
    if (drawingTimerRef.current) {
      clearTimeout(drawingTimerRef.current);
      drawingTimerRef.current = null;
    }
    
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    setHandwritingBase64('');
    setRecognizedText('');
    setShowPreview(false);
    setConversionError(null);
    
    console.log('🗑️ [캔버스] 지우기 완료');
  }, []);

  // 🔥 타이핑 모드로 전환 (최적화)
  const switchToTyping = useCallback(() => {
    if (recognizedText && recognizedText.trim()) {
      setTypingText(recognizedText);
      onChange?.(recognizedText);
      console.log('⌨️ [모드전환] 필기→타이핑:', recognizedText);
    }
    setMode('typing');
  }, [recognizedText, onChange]);

  // 🔥 필기 모드로 전환 (최적화)
  const switchToHandwriting = useCallback(() => {
    setMode('handwriting');
    
    // 🔥 타이핑된 텍스트가 있으면 미리보기에 표시
    if (typingText && typingText.trim()) {
      setRecognizedText(typingText);
      setShowPreview(true);
      console.log('🖋️ [모드전환] 타이핑→필기, 미리보기 설정:', typingText);
    }
    
    // 🔥 캔버스는 다음 렌더링에서 초기화됨
  }, [typingText]);

  // 🔥 타이핑 텍스트 변경 (디바운스 적용)
  const handleTypingChange = useCallback((event) => {
    const newValue = event.target.value;
    setTypingText(newValue);
    onChange?.(newValue);
  }, [onChange]);

  // 🔥 미리보기 텍스트 수정
  const handlePreviewEdit = useCallback((event) => {
    const newValue = event.target.value;
    setRecognizedText(newValue);
  }, []);

  // 🔥 미리보기 → 타이핑 적용
  const applyPreviewToTyping = useCallback(() => {
    if (recognizedText) {
      setTypingText(recognizedText);
      onChange?.(recognizedText);
      setMode('typing');
      console.log('📝 [적용] 미리보기→타이핑:', recognizedText);
    }
  }, [recognizedText, onChange]);

  // 🔥 수동 변환 트리거 (새로 추가)
  const triggerManualConversion = useCallback(async () => {
    if (!handwritingBase64 && canvasRef.current) {
      console.log('🔄 [수동변환] 캔버스에서 즉시 변환 실행');
      await performTextConversion();
    } else if (recognizedText) {
      console.log('🔄 [수동변환] 이미 변환된 텍스트 존재');
      setShowPreview(true);
    }
  }, [handwritingBase64, recognizedText, performTextConversion]);

  // 🔥 컴포넌트 언마운트 시 정리 (메모리 누수 방지)
  useEffect(() => {
    return () => {
      if (drawingTimerRef.current) {
        clearTimeout(drawingTimerRef.current);
      }
    };
  }, []);

  // 🔥 모델 상태에 따른 UI 비활성화 (memoized)
  const isInputDisabled = useMemo(() => {
    return disabled || !isModelLoaded;
  }, [disabled, isModelLoaded]);

  return (
    <div ref={containerRef} className="w-full space-y-4">
      {/* 🔥 라벨 및 모드 스위치 (개선) */}
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        <div className="flex items-center gap-2">
          {/* 🔥 모델 로딩 상태 */}
          {!isModelLoaded && (
            <div className="flex items-center gap-1 text-xs text-orange-600">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-orange-600"></div>
              <span>CRNN 로딩중...</span>
            </div>
          )}
          
          {/* 🔥 변환 진행 상태 */}
          {isProcessing && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
              <span>텍스트 변환중...</span>
            </div>
          )}

          {/* 🔥 오류 상태 표시 */}
          {conversionError && (
            <div className="flex items-center gap-1 text-xs text-red-600">
              <span>❌</span>
              <span>변환 실패</span>
            </div>
          )}
          
          {/* 🔥 모드 전환 버튼 */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              type="button"
              onClick={switchToTyping}
              disabled={isInputDisabled}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                mode === 'typing'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400'
              }`}
            >
              ⌨️ 타이핑
            </button>
            <button
              type="button"
              onClick={switchToHandwriting}
              disabled={isInputDisabled}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                mode === 'handwriting'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400'
              }`}
            >
              🖋️ 필기
            </button>
          </div>
        </div>
      </div>

      {/* 🔥 타이핑 모드 (개선) */}
      {mode === 'typing' && (
        <div className="space-y-2">
          <textarea
            value={typingText}
            onChange={handleTypingChange}
            placeholder={placeholder}
            disabled={isInputDisabled}
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          
          {/* 🔥 필기에서 변환된 텍스트가 있으면 표시 */}
          {recognizedText && recognizedText !== typingText && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-700 mb-2">✅ 필기에서 변환된 텍스트:</p>
              <p className="text-sm text-green-800 bg-white rounded px-2 py-1 font-mono">
                "{recognizedText}"
              </p>
              <button
                type="button"
                onClick={() => {
                  setTypingText(recognizedText);
                  onChange?.(recognizedText);
                }}
                className="mt-2 text-xs text-green-600 hover:text-green-800 underline hover:no-underline transition-all"
              >
                이 텍스트 사용하기
              </button>
            </div>
          )}
        </div>
      )}

      {/* 🔥 필기 모드 (대폭 개선) */}
      {mode === 'handwriting' && (
        <div className="space-y-4">
          {/* 🔥 필기 캔버스 (반응형 + 터치 지원) */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={finishDrawing}
              onMouseLeave={finishDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={finishDrawing}
              className={`w-full border border-gray-300 rounded bg-white transition-all ${
                isInputDisabled 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-crosshair hover:border-blue-400'
              }`}
              style={{ 
                touchAction: 'none',
                maxWidth: '100%',
                height: 'auto'
              }}
            />
            
            <div className="flex justify-between items-center mt-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500">
                  🖋️ 마우스나 터치로 글씨를 써주세요. 
                  <span className="font-medium">필기 완료 1초 후</span> 자동으로 텍스트 변환됩니다.
                </p>
                {canvasSize && (
                  <p className="text-xs text-gray-400 mt-1">
                    캔버스 크기: {canvasSize.width} × {canvasSize.height}px
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerManualConversion}
                  disabled={isInputDisabled || isProcessing}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  즉시 변환
                </button>
                <button
                  type="button"
                  onClick={clearCanvas}
                  disabled={isInputDisabled}
                  className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  지우기
                </button>
              </div>
            </div>
          </div>

          {/* 🔥 실시간 미리보기 (대폭 개선) */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-blue-800 flex items-center">
                📝 텍스트 미리보기
                {isProcessing && (
                  <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                )}
              </h4>
              
              {recognizedText && !conversionError && (
                <button
                  type="button"
                  onClick={applyPreviewToTyping}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  타이핑 모드로 적용
                </button>
              )}
            </div>
            
            {/* 🔥 오류 메시지 표시 */}
            {conversionError ? (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <div className="flex items-center gap-2 text-red-700 mb-2">
                  <span>❌</span>
                  <span className="font-medium">변환 실패</span>
                </div>
                <p className="text-xs text-red-600 mb-3">{conversionError}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConversionError(null);
                      triggerManualConversion();
                    }}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    다시 시도
                  </button>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    캔버스 지우기
                  </button>
                </div>
              </div>
            ) : recognizedText ? (
              <div className="space-y-2">
                <textarea
                  value={recognizedText}
                  onChange={handlePreviewEdit}
                  placeholder="변환된 텍스트가 여기에 나타납니다..."
                  className="w-full h-20 px-3 py-2 bg-white border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm font-mono"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-blue-600">
                    💡 변환된 텍스트를 수정할 수 있습니다.
                  </p>
                  <p className="text-xs text-gray-500">
                    {recognizedText.length}자
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">✍️ 필기를 하시면 변환된 텍스트가 여기에 표시됩니다</p>
                {typingText && (
                  <div className="mt-4 p-3 bg-white border border-gray-200 rounded">
                    <p className="text-xs text-gray-600 mb-1">타이핑 모드에서 입력한 내용:</p>
                    <p className="text-sm text-gray-800 font-mono">"{typingText}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🔥 디버깅 정보 (개발 모드, 더 상세하게) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 border border-gray-200 rounded p-3 text-xs space-y-1">
          <p><strong>🔧 디버깅 정보 (개선된 버전):</strong></p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p>모드: <span className="font-mono">{mode}</span></p>
              <p>모델 로드: {isModelLoaded ? '✅' : '❌'}</p>
              <p>변환 중: {isProcessing ? '✅' : '❌'}</p>
              <p>비활성화: {isInputDisabled ? '✅' : '❌'}</p>
            </div>
            <div>
              <p>타이핑 텍스트: <span className="font-mono">"{typingText}" ({typingText.length}자)</span></p>
              <p>인식 텍스트: <span className="font-mono">"{recognizedText}" ({recognizedText.length}자)</span></p>
              <p>필기 데이터: {handwritingBase64 ? '✅ 있음' : '❌ 없음'}</p>
              <p>캔버스 크기: {canvasSize.width}×{canvasSize.height}px</p>
            </div>
          </div>
          {conversionError && (
            <p className="text-red-600"><strong>변환 오류:</strong> {conversionError}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default HandwritingTextInput;
