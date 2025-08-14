import React from 'react';
import BedCard from './BedCard';

const BedStatusPanel = ({ beds, loading, error, hospitalInfo, onBedUpdate, stats }) => {
  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        border: "2px solid #e5e7eb",
        padding: "16px",
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "16px",
          paddingBottom: "12px",
          borderBottom: "2px solid #e5e7eb",
        }}
      >
        <h3
          style={{
            fontSize: "30px",
            fontWeight: "bold",
            color: "#1f2937",
            margin: 0,
            textAlign: "center",
          }}
        >
          병상 현황
        </h3>
      </div>

      <div
        style={{
          padding: "12px",
          backgroundColor: "#f0f9ff",
          borderRadius: "8px",
          border: "2px solid #93c5fd",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "20px",
            marginBottom: "4px",
          }}
        >
          <span style={{ color: "#0369a1", fontWeight: "bold" }}>
            전체 현황
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "20px",
            color: "#0369a1",
            fontWeight: "bold",
          }}
        >
          <span>총 병상: {stats.totalBeds}</span>
          <span>총 환자: {stats.totalPatients}</span>
          <span>여유: {stats.availableBeds}</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
        }}
      >
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              color: "#6b7280",
            }}
          >
            베드 정보를 불러오는 중...
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              color: "#ef4444",
            }}
          >
            오류: {error}
          </div>
        ) : beds.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              color: "#6b7280",
            }}
          >
            베드 정보가 없습니다.
          </div>
        ) : (
          beds.map((bed) => (
            <BedCard
              key={bed.id}
              bed={bed}
              onUpdate={onBedUpdate}
              compact={true}
              readonly={true}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default BedStatusPanel;