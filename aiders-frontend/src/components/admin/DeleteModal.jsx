import { useState } from "react";
import styles from './DeleteModal.module.css';

export default function DeleteModal({ isOpen, onClose, onConfirm, account }) {
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen || !account) return null;

  const handleConfirm = () => {
    if (confirmText === "삭제") {
      onConfirm();
      setConfirmText("");
    } else {
      alert("삭제를 정확히 입력해주세요.");
    }
  };

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <span className={styles.warningIcon}>⚠️</span>
          </div>
          <h3 className={styles.title}>계정 삭제 확인</h3>
          <p className={styles.description}>다음 계정을 삭제하시겠습니까?</p>
        </div>

        <div className={styles.accountInfo}>
          <div className={styles.accountHeader}>
            <span className={styles.accountIcon}>
              {account.type === "병원" && "🏥"}
              {account.type === "구급대원" && "🚑"}
              {account.type === "소방서" && "🚒"}
            </span>
            <span className={styles.accountType}>{account.type}</span>
          </div>
          <div className={styles.accountDetails}>
            <div className={styles.accountDetail}>아이디: {account.accountId}</div>
            {account.address && <div className={styles.accountDetail}>주소: {account.address}</div>}
            {account.vehicleNumber && <div className={styles.accountDetail}>차량번호: {account.vehicleNumber}</div>}
          </div>
        </div>

        <div className={styles.confirmSection}>
          <label className={styles.confirmLabel}>
            삭제를 진행하려면 <span className={styles.deleteText}>"삭제"</span>를 입력하세요
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className={styles.confirmInput}
            placeholder="삭제"
          />
        </div>

        <div className={styles.buttonGroup}>
          <button
            onClick={handleClose}
            className={styles.cancelButton}
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className={styles.deleteButton}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}