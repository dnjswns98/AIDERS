import React, { useRef, useEffect, useState } from 'react';

const PatientDetailInput = ({
  label,
  name,
  value,
  onChange,
  inputMode,
  canvasWidth = 400,
  canvasHeight = 150,
  isTextArea = false,
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onChange({ target: { name, value: '' } }); // formData 업데이트
    }
  };

  const saveCanvasAsImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      onChange({ target: { name, value: dataURL } }); // formData 업데이트
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || inputMode !== 'drawing') return;

    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    // 캔버스 크기 설정 (CSS가 아닌 HTML 속성으로 직접 설정)
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let drawing = false;
    let x = 0;
    let y = 0;

    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const startDrawing = (e) => {
      drawing = true;
      ({ x, y } = getMousePos(e));
    };

    const draw = (e) => {
      if (!drawing) return;
      const newPos = getMousePos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(newPos.x, newPos.y);
      ctx.stroke();
      x = newPos.x;
      y = newPos.y;
    };

    const stopDrawing = () => {
      drawing = false;
      saveCanvasAsImage();
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Load existing image if available
    if (value && value.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = value;
    }

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
    };
  }, [inputMode, canvasWidth, canvasHeight, value]); // isDrawing, lastPos 제거

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
            width={canvasWidth}
            height={canvasHeight}
            className="bg-white"
            style={{ touchAction: 'none' }}
          ></canvas>
          <button
            type="button"
            onClick={clearCanvas}
            className="absolute bottom-1 right-1 bg-red-500 hover:bg-red-600 text-white text-xs px-1 py-0.5 rounded"
          >
            지우기
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientDetailInput;
