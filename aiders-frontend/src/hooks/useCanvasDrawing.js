import { useRef, useEffect, useCallback } from 'react';

export const useCanvasDrawing = (drawingMode, inputMode, value, onChange, name) => {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  // 캔버스 초기 설정 및 기존 이미지 로드
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || inputMode !== 'drawing') return;

    const ctx = canvas.getContext('2d');
    ctx.lineWidth = drawingMode === 'pen' ? 2 : 50;
    ctx.lineCap = 'round';
    ctx.strokeStyle = drawingMode === 'pen' ? 'black' : 'white';
    ctx.globalCompositeOperation = 'source-over';

    const setCanvasSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      if (value && value.startsWith('data:image')) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = value;
      }
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, [inputMode, value, drawingMode]);

  // 캔버스 내용을 이미지로 저장하는 함수
  const saveCanvasAsImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      onChange({ target: { name, value: dataURL } });
    }
  }, [name, onChange]);

  // 캔버스 클리어 함수
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onChange({ target: { name, value: '' } });
    }
  }, [name, onChange]);

  // 포인터 이벤트 처리
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || inputMode !== 'drawing') return;

    const ctx = canvas.getContext('2d');

    const getCoords = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const startDrawing = (e) => {
      if (e.pointerType === 'pen') {
        e.stopPropagation();
        e.preventDefault(); // 펜 입력은 기본 동작 방지
        
        isDrawingRef.current = true;
        lastPosRef.current = getCoords(e);

        ctx.lineWidth = drawingMode === 'pen' ? 2 : 50;
        ctx.strokeStyle = drawingMode === 'pen' ? 'black' : 'white';
        ctx.globalCompositeOperation = 'source-over';
      } else if (e.pointerType === 'touch') {
        // 손가락 터치는 스크롤을 허용하기 위해 preventDefault를 호출하지 않음
        isDrawingRef.current = false; // 손가락 터치는 그리기 시작으로 간주하지 않음
      }
    };

    const draw = (e) => {
      if (e.pointerType === 'pen') {
        if (!isDrawingRef.current) return; // 펜으로 그리는 중이 아니면 무시
        e.preventDefault(); // 펜 입력은 기본 동작 방지
        const currentPos = getCoords(e);

        ctx.beginPath();
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();

        lastPosRef.current = currentPos;
      } else if (e.pointerType === 'touch') {
        // 손가락 터치는 스크롤을 허용하기 위해 preventDefault를 호출하지 않음
        return; // 손가락 터치는 그리기 동작을 수행하지 않음
      }
    };

    const stopDrawing = (e) => {
      if (e.pointerType === 'pen') {
        e.preventDefault(); // 펜 입력은 기본 동작 방지
        isDrawingRef.current = false;
        saveCanvasAsImage();
      } else if (e.pointerType === 'touch') {
        // 손가락 터치는 스크롤을 허용하기 위해 preventDefault를 호출하지 않음
        isDrawingRef.current = false; // 손가락 터치는 그리기 종료로 간주하지 않음
      }
    };

    const eventOptions = { passive: false };

    canvas.addEventListener('pointerdown', startDrawing, eventOptions);
    canvas.addEventListener('pointermove', draw, eventOptions);
    canvas.addEventListener('pointerup', stopDrawing, eventOptions);
    canvas.addEventListener('pointercancel', stopDrawing, eventOptions);

    return () => {
      canvas.removeEventListener('pointerdown', startDrawing, eventOptions);
      canvas.removeEventListener('pointermove', draw, eventOptions);
      canvas.removeEventListener('pointerup', stopDrawing, eventOptions);
      canvas.removeEventListener('pointercancel', stopDrawing, eventOptions);
    };
  }, [inputMode, saveCanvasAsImage, drawingMode]);

  return {
    canvasRef,
    clearCanvas,
  };
};
