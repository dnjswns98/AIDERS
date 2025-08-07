// hooks/useCRNNModel.js
import { useState, useCallback } from 'react';
import { initModel, predict } from '../../model';

export const useCRNNModel = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const initializeModel = useCallback(async () => {
    if (!isModelLoaded) {
      console.log('🤖 [CRNN] 모델 초기화 시작');
      try {
        await initModel();
        setIsModelLoaded(true);
        console.log('✅ [CRNN] 모델 로드 완료');
      } catch (error) {
        console.error('❌ [CRNN] 모델 로드 실패:', error);
      }
    }
  }, [isModelLoaded]);

  const convertHandwritingToText = useCallback(async (base64String) => {
    console.log('🖋️ [CRNN] 필기 → 텍스트 변환 시작');
    setIsProcessing(true);
    
    try {
      await initializeModel(); // 모델 미로드 시 자동 로드
      
      const result = await predict(base64String);
      console.log('✅ [CRNN] 변환 완료:', result);
      
      return result;
    } catch (error) {
      console.error('❌ [CRNN] 변환 실패:', error);
      return '';
    } finally {
      setIsProcessing(false);
    }
  }, [initializeModel]);

  return {
    isModelLoaded,
    isProcessing,
    convertHandwritingToText,
    initializeModel
  };
};
