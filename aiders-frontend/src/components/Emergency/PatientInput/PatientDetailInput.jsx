import React, { useRef, useEffect, useCallback, useState } from 'react';

const PatientDetailInput = ({
  label,
  name,
  value,
  onChange,
  inputMode,
  isTextArea = false,
}) => {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [drawingMode, setDrawingMode] = useState('pen'); // 'pen' 또는 'eraser'

  // inputMode가 drawing으로 변경될 때 drawingMode를 pen으로 초기화
  useEffect(() => {
    if (inputMode === 'drawing') {
      setDrawingMode('pen');
    }
  }, [inputMode]);

  const toggleDrawingMode = () => {
    setDrawingMode(prevMode => prevMode === 'pen' ? 'eraser' : 'pen');
  };

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onChange({ target: { name, value: '' } }); // formData 업데이트
    }
  }, [name, onChange]);

  const saveCanvasAsImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      onChange({ target: { name, value: dataURL } }); // formData 업데이트
    }
  }, [name, onChange]);

  // 캔버스 초기 설정 및 기존 이미지 로드
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || inputMode !== 'drawing') return;

    // inputMode가 drawing으로 변경될 때 drawingMode를 pen으로 초기화
    setDrawingMode('pen');

    const ctx = canvas.getContext('2d');
    ctx.lineWidth = drawingMode === 'pen' ? 2 : 50; // 펜은 2px, 지우개는 50px (더 크게)
    ctx.lineCap = 'round';
    ctx.strokeStyle = drawingMode === 'pen' ? 'black' : 'white'; // 펜은 검정, 지우개는 흰색
    ctx.globalCompositeOperation = 'source-over'; // 항상 source-over로 설정

    // 캔버스 크기 동기화
    const setCanvasSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      // 기존 이미지 로드
      if (value && value.startsWith('data:image')) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = value;
      }
    };

    // 초기 설정 및 inputMode 변경 시 강제 호출
    setCanvasSize();

    // 윈도우 리사이즈 시 캔버스 크기 재설정
    window.addEventListener('resize', setCanvasSize);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, [inputMode, value, drawingMode]); // drawingMode를 의존성 배열에 추가

  // 마우스 이벤트 리스너 설정 및 그리기 로직
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || inputMode !== 'drawing') return;

    const ctx = canvas.getContext('2d');

    const getCoords = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      // 캔버스 내부 해상도와 실제 표시 크기 간의 비율을 계산하여 좌표 보정
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    const startDrawing = (e) => {
      e.preventDefault(); // 터치 이벤트의 기본 동작 방지
      isDrawingRef.current = true;
      lastPosRef.current = getCoords(e);

      // 그리기 시작 시 펜/지우개 설정 적용
      ctx.lineWidth = drawingMode === 'pen' ? 2 : 50; // 펜은 2px, 지우개는 50px
      ctx.strokeStyle = drawingMode === 'pen' ? 'black' : 'white'; // 펜은 검정, 지우개는 흰색
      ctx.globalCompositeOperation = 'source-over'; // 항상 source-over로 설정
    };

    const draw = (e) => {
      e.preventDefault(); // 터치 이벤트의 기본 동작 방지
      if (!isDrawingRef.current) return;
      const currentPos = getCoords(e);

      ctx.save(); // 현재 캔버스 상태 저장
      ctx.globalCompositeOperation = 'source-over'; // 항상 source-over로 설정
      ctx.strokeStyle = drawingMode === 'pen' ? 'black' : 'white'; // 펜은 검정, 지우개는 흰색
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
      ctx.restore(); // 캔버스 상태 복원

      lastPosRef.current = currentPos;
    };

    const stopDrawing = (e) => {
      e.preventDefault(); // 터치 이벤트의 기본 동작 방지
      isDrawingRef.current = false;
      saveCanvasAsImage();
    };

    // 마우스 이벤트
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);

    // 터치 이벤트
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing); // 터치 취소 시

    return () => {
      // 마우스 이벤트 리스너 제거
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      // 터치 이벤트 리스너 제거
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
      canvas.removeEventListener('touchcancel', stopDrawing);
    };
  }, [inputMode, saveCanvasAsImage, drawingMode]); // drawingMode를 의존성 배열에 추가

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {inputMode === 'typing' ? (
        isTextArea ? (
          <textarea
            id={name}
            name={name}
            rows="3"
            value={value}
            onChange={onChange}
            className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          ></textarea>
        ) : (
          <input
            type="text"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        )
      ) : (
        <div className="relative border border-gray-300 rounded-md shadow-sm overflow-hidden">
          <canvas
            ref={canvasRef}
            className="bg-white"
            style={{ touchAction: 'none', width: '100%', height: '100%' }}
          ></canvas>
          <div className="absolute top-1 right-1 flex space-x-1">
            <button
              type="button"
              onClick={toggleDrawingMode}
              className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200 text-gray-700"
              title={drawingMode === 'pen' ? '지우개 모드로 전환' : '펜 모드로 전환'}
            >
              {drawingMode === 'pen' ? (
                <i className="fas fa-pen text-sm"></i>
              ) : (
                <i className="fas fa-eraser text-sm"></i>
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={clearCanvas}
            className="absolute bottom-1 right-1 bg-red-500 hover:bg-red-600 text-white text-sm p-2 rounded-full"
            title="전체 지우기"
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientDetailInput;
