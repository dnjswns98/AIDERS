// components/Emergency/HandwritingTextInput.jsx

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import globalModelManager from '../../services/globalModelManager';

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
    const [conversionError, setConversionError] = useState(null);

    // 🔥 globalModelManager 상태 관리 (수정됨)
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [modelError, setModelError] = useState(null);

    // 🔥 캔버스 관련 refs (개선)
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const containerRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 200 });

    // 🔥 필기 완료 감지용 타이머 ref (개선)
    const drawingTimerRef = useRef(null);
    const lastDrawTimeRef = useRef(null);

    // 🔥 컴포넌트 마운트 시 globalModelManager 상태 확인 (수정됨)
    useEffect(() => {
        console.log(`🤖 [HandwritingTextInput] "${label}" 컴포넌트 마운트, globalModelManager 연결`);
        
        const checkModelStatus = async () => {
            try {
                // 🔥 getStatus() 대신 직접 프로퍼티 체크
                const isLoaded = globalModelManager.isLoaded || false;
                const hasSession = globalModelManager.session !== null;
                
                console.log(`🔍 [HandwritingTextInput] "${label}" globalModelManager 상태 체크:`);
                console.log(`  - isLoaded: ${isLoaded}`);
                console.log(`  - hasSession: ${hasSession}`);
                
                setIsModelLoaded(isLoaded && hasSession);
                setModelError(null);

                // 🔥 모델이 로드되지 않은 경우 초기화 시도
                if (!isLoaded || !hasSession) {
                    console.log(`💾 [HandwritingTextInput] "${label}" 모델 초기화 시도`);
                    
                    try {
                        await globalModelManager.initialize();
                        
                        // 다시 상태 체크
                        const newIsLoaded = globalModelManager.isLoaded || false;
                        const newHasSession = globalModelManager.session !== null;
                        
                        setIsModelLoaded(newIsLoaded && newHasSession);
                        
                        if (newIsLoaded && newHasSession) {
                            console.log(`✅ [HandwritingTextInput] "${label}" 모델 초기화 성공`);
                        } else {
                            console.warn(`⚠️ [HandwritingTextInput] "${label}" 모델 초기화 후에도 상태 불완전`);
                        }
                        
                    } catch (initError) {
                        console.error(`❌ [HandwritingTextInput] "${label}" 모델 초기화 실패:`, initError);
                        setModelError(initError.message);
                        setIsModelLoaded(false);
                        setConversionError('AI 모델 로딩에 실패했습니다.');
                    }
                }
                
            } catch (error) {
                console.error(`❌ [HandwritingTextInput] "${label}" globalModelManager 상태 확인 실패:`, error);
                setModelError(error.message);
                setIsModelLoaded(false);
                setConversionError('AI 모델 연결에 실패했습니다.');
            }
        };

        checkModelStatus();
    }, [label]);

    // 🔥 외부 value와 동기화 (최적화)
    useEffect(() => {
        if (value !== typingText) {
            console.log(`🔄 [HandwritingTextInput] "${label}" 외부 value 동기화: "${value}"`);
            setTypingText(value);
        }
    }, [value, typingText, label]);

    // 🔥 반응형 캔버스 크기 계산 (새로 추가)
    const updateCanvasSize = useCallback(() => {
        if (!containerRef.current) return;
        
        const containerWidth = containerRef.current.offsetWidth;
        const newWidth = Math.min(Math.max(containerWidth - 32, 300), 800); // 최소 300px, 최대 800px
        const newHeight = Math.max(newWidth * 0.25, 150); // 비율 유지, 최소 150px
        
        setCanvasSize(prev => {
            if (Math.abs(prev.width - newWidth) > 10 || Math.abs(prev.height - newHeight) > 10) {
                console.log(`📏 [HandwritingTextInput] "${label}" 캔버스 크기 업데이트: ${newWidth}x${newHeight}`);
                return { width: newWidth, height: newHeight };
            }
            return prev;
        });
    }, [label]);

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

        console.log(`🎨 [HandwritingTextInput] "${label}" 캔버스 초기화 완료: ${canvasSize.width}x${canvasSize.height}, pixelRatio: ${pixelRatio}`);
    }, [mode, canvasSize, label]);

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

        console.log(`✍️ [HandwritingTextInput] "${label}" 필기 시작: (${offsetX.toFixed(1)}, ${offsetY.toFixed(1)})`);
    }, [disabled, isModelLoaded, getEventPos, label]);

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
        
        console.log(`🖋️ [HandwritingTextInput] "${label}" 필기 종료, 자동 변환 타이머 설정`);

        // 🔥 디바운스 처리: 1초 후 자동 변환
        drawingTimerRef.current = setTimeout(async () => {
            const timeSinceLastDraw = Date.now() - (lastDrawTimeRef.current || 0);
            if (timeSinceLastDraw < 1000) {
                console.log(`🔄 [HandwritingTextInput] "${label}" 아직 필기 중일 수 있음, 변환 지연`);
                return;
            }

            console.log(`🤖 [HandwritingTextInput] "${label}" 필기 완료, globalModelManager 변환 시작`);
            await performTextConversion();
        }, 1000);
    }, [isDrawing, label]);

    // 🔥 텍스트 변환 함수 (globalModelManager 사용으로 수정)
    const performTextConversion = useCallback(async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        try {
            setConversionError(null);
            setIsProcessing(true);
            
            console.log(`🚀 [HandwritingTextInput] "${label}" globalModelManager로 변환 시작`);

            // 🔥 캔버스를 base64로 변환 (최적화)
            const base64String = canvas.toDataURL('image/png', 0.8); // 압축률 설정
            setHandwritingBase64(base64String);

            console.log(`📄 [HandwritingTextInput] "${label}" Base64 생성 완료, globalModelManager.predict 호출`);

            // 🔥 globalModelManager로 텍스트 변환
            const convertedText = await globalModelManager.predict(base64String);

            if (convertedText && convertedText.trim()) {
                const cleanedText = convertedText.trim();
                setRecognizedText(cleanedText);
                setShowPreview(true);
                console.log(`✅ [HandwritingTextInput] "${label}" globalModelManager 변환 성공: "${cleanedText}"`);
            } else {
                console.warn(`⚠️ [HandwritingTextInput] "${label}" 빈 결과 반환`);
                setRecognizedText('');
                setShowPreview(true); // 빈 결과도 미리보기 표시
                setConversionError('인식된 텍스트가 없습니다.');
            }

        } catch (error) {
            console.error(`❌ [HandwritingTextInput] "${label}" globalModelManager 변환 실패:`, error);
            setConversionError('필기 인식에 실패했습니다. 다시 시도해주세요.');
            setShowPreview(true);
        } finally {
            setIsProcessing(false);
        }
    }, [label]);

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

        console.log(`🗑️ [HandwritingTextInput] "${label}" 캔버스 지우기 완료`);
    }, [label]);

    // 🔥 타이핑 모드로 전환 (최적화)
    const switchToTyping = useCallback(() => {
        if (recognizedText && recognizedText.trim()) {
            setTypingText(recognizedText);
            onChange?.(recognizedText);
            console.log(`⌨️ [HandwritingTextInput] "${label}" 모드전환 필기→타이핑:`, recognizedText);
        }
        setMode('typing');
    }, [recognizedText, onChange, label]);

    // 🔥 필기 모드로 전환 (최적화)
    const switchToHandwriting = useCallback(() => {
        setMode('handwriting');
        
        // 🔥 타이핑된 텍스트가 있으면 미리보기에 표시
        if (typingText && typingText.trim()) {
            setRecognizedText(typingText);
            setShowPreview(true);
            console.log(`🖋️ [HandwritingTextInput] "${label}" 모드전환 타이핑→필기, 미리보기 설정:`, typingText);
        }
        
        // 🔥 캔버스는 다음 렌더링에서 초기화됨
    }, [typingText, label]);

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
            console.log(`📝 [HandwritingTextInput] "${label}" 적용 미리보기→타이핑:`, recognizedText);
        }
    }, [recognizedText, onChange, label]);

    // 🔥 수동 변환 트리거 (globalModelManager 사용으로 수정)
    const triggerManualConversion = useCallback(async () => {
        if (!handwritingBase64 && canvasRef.current) {
            console.log(`🔄 [HandwritingTextInput] "${label}" 수동변환 캔버스에서 즉시 변환 실행`);
            await performTextConversion();
        } else if (recognizedText) {
            console.log(`🔄 [HandwritingTextInput] "${label}" 수동변환 이미 변환된 텍스트 존재`);
            setShowPreview(true);
        }
    }, [handwritingBase64, recognizedText, performTextConversion, label]);

    // 🔥 컴포넌트 언마운트 시 정리 (메모리 누수 방지)
    useEffect(() => {
        return () => {
            console.log(`🧹 [HandwritingTextInput] "${label}" 컴포넌트 언마운트, 리소스 정리`);
            if (drawingTimerRef.current) {
                clearTimeout(drawingTimerRef.current);
            }
        };
    }, [label]);

    // 🔥 모델 상태에 따른 UI 비활성화 (memoized)
    const isInputDisabled = useMemo(() => {
        return disabled || !isModelLoaded;
    }, [disabled, isModelLoaded]);

    return (
        <div ref={containerRef} className="w-full space-y-4 border border-gray-300 rounded-lg p-4 bg-gray-50">
            {/* 🔥 라벨 및 상태 표시 */}
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <div className="flex items-center space-x-2 text-xs">
                    <span className={`px-2 py-1 rounded ${isModelLoaded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isModelLoaded ? '✅ AI 준비' : '❌ AI 로딩 중'}
                    </span>
                    {isProcessing && (
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                            🔄 변환 중
                        </span>
                    )}
                </div>
            </div>

            {/* 🔥 모드 전환 버튼 */}
            <div className="flex space-x-2">
                <button
                    type="button"
                    onClick={switchToTyping}
                    className={`px-4 py-2 rounded-md transition-colors ${
                        mode === 'typing'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    ⌨️ 타이핑 모드
                </button>
                <button
                    type="button"
                    onClick={switchToHandwriting}
                    disabled={isInputDisabled}
                    className={`px-4 py-2 rounded-md transition-colors ${
                        mode === 'handwriting'
                            ? 'bg-green-600 text-white'
                            : isInputDisabled
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    🖋️ 필기 모드 {isInputDisabled && '(AI 로딩 중)'}
                </button>
            </div>

            {/* 🔥 타이핑 모드 */}
            {mode === 'typing' && (
                <div className="space-y-2">
                    <textarea
                        value={typingText}
                        onChange={handleTypingChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical min-h-[100px] disabled:bg-gray-100 disabled:text-gray-500"
                        rows={4}
                    />
                    <div className="text-xs text-gray-500">
                        {typingText.length}글자
                    </div>
                </div>
            )}

            {/* 🔥 필기 모드 */}
            {mode === 'handwriting' && (
                <div className="space-y-4">
                    {/* 필기 캔버스 */}
                    <div className="relative">
                        <canvas
                            ref={canvasRef}
                            className={`border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair ${
                                isInputDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'
                            }`}
                            style={{ 
                                width: `${canvasSize.width}px`, 
                                height: `${canvasSize.height}px`,
                                touchAction: 'none' // 터치 스크롤 방지
                            }}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={finishDrawing}
                            onMouseLeave={finishDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={finishDrawing}
                        />
                        
                        {/* 캔버스 안내 텍스트 */}
                        {!handwritingBase64 && !isProcessing && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-gray-400 text-center">
                                    <p className="text-lg">🖋️ 마우스나 터치로 글씨를 써주세요</p>
                                    <p className="text-sm mt-1">필기 완료 1초 후 자동으로 텍스트 변환됩니다</p>
                                    {canvasSize && (
                                        <p className="text-xs mt-2 opacity-75">
                                            캔버스 크기: {canvasSize.width} × {canvasSize.height}px
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 처리 중 오버레이 */}
                        {isProcessing && (
                            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-2 text-sm text-gray-600">🤖 필기를 분석하는 중...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 필기 컨트롤 버튼 */}
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
                            {isProcessing ? '🔄 변환 중...' : '🤖 수동 변환'}
                        </button>
                    </div>

                    {/* 변환 에러 표시 */}
                    {conversionError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-700 text-sm">⚠️ {conversionError}</p>
                        </div>
                    )}

                    {/* 미리보기 및 수정 영역 */}
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
                                    💡 변환된 텍스트를 수정할 수 있습니다. (globalModelManager 사용)
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

                    {/* 타이핑된 내용이 있을 때 표시 */}
                    {typingText && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-blue-800 mb-2">
                                타이핑 모드에서 입력한 내용:
                            </h4>
                            <div className="bg-white border border-blue-300 rounded p-2">
                                <p className="text-sm text-gray-700 italic">
                                    "{typingText}"
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 🔥 디버깅 정보 (개발 환경에서만 표시) */}
            {process.env.NODE_ENV === 'development' && (
                <details className="text-xs bg-gray-100 rounded p-2">
                    <summary className="cursor-pointer font-medium">
                        **🔧 디버깅 정보 (globalModelManager 수정 버전):**
                    </summary>
                    <div className="mt-2 space-y-1">
                        <div>**모드:** {mode}</div>
                        <div>**모델 로드:** {isModelLoaded ? '✅' : '❌'}</div>
                        <div>**변환 중:** {isProcessing ? '✅' : '❌'}</div>
                        <div>**비활성화:** {isInputDisabled ? '✅' : '❌'}</div>
                        <div>**모델 시스템:** globalModelManager (수정됨)</div>
                        <div>**타이핑 텍스트:** "{typingText}" ({typingText.length}자)</div>
                        <div>**인식 텍스트:** "{recognizedText}" ({recognizedText.length}자)</div>
                        <div>**필기 데이터:** {handwritingBase64 ? '✅ 있음' : '❌ 없음'}</div>
                        <div>**캔버스 크기:** {canvasSize.width}×{canvasSize.height}px</div>
                        
                        {modelError && (
                            <div className="text-red-600">
                                **모델 오류:** {modelError}
                            </div>
                        )}

                        {conversionError && (
                            <div className="text-red-600">
                                **변환 오류:** {conversionError}
                            </div>
                        )}
                    </div>
                </details>
            )}
        </div>
    );
};

export default HandwritingTextInput;
