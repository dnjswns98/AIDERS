import { useState } from "react";
import Header from "../components/admin/Header";
import Sidebar from "../components/admin/Sidebar";
import AccountCreate from "../components/admin/AccountCreate";
import AccountList from "../components/admin/AccountList";

export default function AdminPage() {
  const [activeMenu, setActiveMenu] = useState("account-list");

  const renderContent = () => {
    switch (activeMenu) {
      case "account-create":
        return <AccountCreate />;
      case "account-list":
      default:
        return <AccountList />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header />
      <div style={{ display: 'flex', paddingTop: '64px' }}>
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        <main style={{ 
          width: 'calc(100vw - 256px)',
          marginLeft: '256px', 
          padding: '24px',
          boxSizing: 'border-box',
          height: 'calc(100vh - 64px)', /* 헤더 높이 제외 */
          overflow: 'hidden'
        }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}