import styles from './Sidebar.module.css';

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
    <aside className={styles.sidebar}>
      <nav className={styles.navigation}>
        <ul className={styles.menuList}>
          {menuItems.map((item) => (
            <li key={item.id} className={styles.menuItem}>
              <button
                onClick={() => setActiveMenu(item.id)}
                className={`${styles.menuButton} ${activeMenu === item.id ? styles.active : ''}`}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                <span className={styles.menuLabel}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}