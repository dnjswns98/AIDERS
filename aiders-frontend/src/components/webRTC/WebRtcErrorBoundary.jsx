// components/WebRtcErrorBoundary.jsx
class WebRtcErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-100 rounded-lg">
          <div className="text-red-500 text-xl mb-4">⚠️ WebRTC 연결 오류</div>
          <p className="text-gray-600 mb-4">화상통화 연결에 문제가 발생했습니다.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            페이지 새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
