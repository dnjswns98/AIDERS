import React from 'react';
import styles from './Pagination.module.css';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showPages = 5
}) => {
  // 페이지가 1개 이하이면 페이징을 표시하지 않음
  if (totalPages <= 1) return null;

  // 페이지 범위 계산
  const getPageRange = () => {
    const halfRange = Math.floor(showPages / 2);
    let startPage = Math.max(0, currentPage - halfRange);
    let endPage = Math.min(totalPages - 1, startPage + showPages - 1);
    
    // 끝페이지 기준으로 시작페이지 재조정
    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(0, endPage - showPages + 1);
    }
    
    return { startPage, endPage };
  };

  const { startPage, endPage } = getPageRange();
  const pages = [];
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // 페이지 클릭 핸들러
  const handlePageClick = (page) => {
    if (page >= 0 && page < totalPages && page !== currentPage) {
      onPageChange(page+1);
    }
  };

  // 이전 페이지로 이동
  const handlePreviousClick = () => {
    // const prevPage = currentPage - 1;
    const prevPage = currentPage - 1;
    handlePageClick(prevPage);
  };

  // 다음 페이지로 이동  
  const handleNextClick = () => {
    const nextPage = currentPage + 1;
    handlePageClick(nextPage);
  };

  return (
    <div className={styles.paginationContainer}>
      {/* 첫 페이지 버튼 */}
      {startPage > 0 && (
        <>
          <button
            onClick={() => handlePageClick(0)}
            className={`${styles.paginationButton} ${currentPage === 0 ? styles.disabled : ''}`}
          >
            1
          </button>
          {startPage > 1 && (
            <span className={styles.ellipsis}>...</span>
          )}
        </>
      )}

      {/* 이전 버튼 */}
      <button
        onClick={handlePreviousClick}
        disabled={currentPage === 0}
        className={`${styles.paginationButton} ${currentPage === 0 ? styles.disabled : ''}`}
      >
        ← 이전
      </button>

      {/* 페이지 번호들 */}
      {pages.map(page => (
        <button
          key={page}
          onClick={() => handlePageClick(page)}
          className={`${styles.paginationButton} ${currentPage === page ? styles.active : ''}`}
        >
          {page + 1}
        </button>
      ))}

      {/* 다음 버튼 */}
      <button
        onClick={handleNextClick}
        disabled={currentPage >= totalPages - 1}
        className={`${styles.paginationButton} ${currentPage >= totalPages - 1 ? styles.disabled : ''}`}
      >
        다음 →
      </button>

      {/* 마지막 페이지 버튼 */}
      {endPage < totalPages - 1 && (
        <>
          {endPage < totalPages - 2 && (
            <span className={styles.ellipsis}>...</span>
          )}
          <button
            onClick={() => handlePageClick(totalPages - 1)}
            className={`${styles.paginationButton} ${currentPage === totalPages - 1 ? styles.disabled : ''}`}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* 페이지 정보 */}
      <div className={styles.pageInfo}>
        {currentPage + 1} / {totalPages}
      </div>
    </div>
  );
};

export default Pagination;