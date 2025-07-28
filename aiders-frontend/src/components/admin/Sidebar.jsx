const menuItems = [
  {
    id: "account-list",
    label: "계정 조회",
    icon: "👥",
  },
  {
    id: "account-create",
    label: "계정 생성",
    icon: "➕",
  },
];

export default function Sidebar({ activeMenu, setActiveMenu }) {
  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: '64px',
      bottom: 0,
      width: '256px',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      borderRight: '1px solid #e5e7eb'
    }}>
      <nav style={{ padding: '16px' }}>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveMenu(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  border: activeMenu === item.id ? '1px solid #dbeafe' : '1px solid transparent',
                  backgroundColor: activeMenu === item.id ? '#eff6ff' : 'transparent',
                  color: activeMenu === item.id ? '#1d4ed8' : '#374151',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  if (activeMenu !== item.id) {
                    e.target.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeMenu !== item.id) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{ fontWeight: '500' }}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}