<<<<<<< HEAD
// src/App.jsx

import "./App.css";
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useAppContext } from './hooks/useAppContext';
import { WebRtcProvider, useWebRtc } from './context/WebRtcContext';
import Toast from './components/Toast';
import AppRouters from "./router/AppRouters";
import { useAuthStore } from "./store/useAuthStore";

const AppContent = () => {
  const { showToast } = useAppContext();
  const location = useLocation();
  const { initialize, user, isAuthenticated } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('[App] 앱 초기화 중 에러 발생:', error);
        setInitError(error.message);
        setIsInitialized(true);
      }
    };
    initializeApp();
  }, [initialize]);

  if (!isInitialized) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center" style={{ fontFamily: 'NanumGothic, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">앱 초기화 중...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center" style={{ fontFamily: 'NanumGothic, sans-serif' }}>
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">앱 초기화 실패</h1>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-dvh bg-gray-50 relative flex flex-col min-h-0" style={{ fontFamily: 'NanumGothic, sans-serif' }}>
      {showToast && <Toast message="구급차 정보가 업데이트되었습니다" />}
      <main className="flex-1 overflow-y-auto min-h-0 p-0 m-0">
        <AppRouters />
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <WebRtcProvider>
        <Router>
          <AppContent />
        </Router>
      </WebRtcProvider>
    </AppProvider>
  );
};

export default App;
=======
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
            <h1 class="text-3xl font-bold underline">
    Hello world!
  </h1>
    </>
  )
}

export default App
>>>>>>> origin/master
