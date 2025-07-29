import HospitalHeader from "../../components/hospital/HospitalHeader";

export default function NotificationPage() {
  return (
    <>
      <HospitalHeader />
      
      <main style={{ 
        paddingTop: '64px', 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb',
        padding: '64px 24px 24px 24px'
      }}>
        <div style={{
          textAlign: 'center',
          marginTop: '100px'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '24px'
          }}>
            🔔
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            알림
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '16px'
          }}>
            실시간 알림 및 메시지 페이지입니다.
          </p>
        </div>
      </main>
    </>
  );
}