// hooks/useCRNNModel.js
import { useState, useCallback } from 'react';
import { initModel, predict } from '../../model';

export const useCRNNModel = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const initializeModel = useCallback(async () => {
    if (!isModelLoaded) {
      try {
        await initModel();
        setIsModelLoaded(true);
      } catch (error) {
        console.error('❌ [CRNN] 모델 로드 실패:', error);
      }
    }
  }, [isModelLoaded]);

  const convertHandwritingToText = useCallback(async (base64String) => {
    setIsProcessing(true);
    
    try {
      await initializeModel();
      
      const result = await predict(base64String);
      
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