import { useState, useEffect } from "react";
// import HospitalHeader from "../../components/hospital/HospitalHeader";
import { useAuthStore } from "../../store/useAuthStore";
import useHospitalStore from "../../store/useHospitalStore";
import useBedStore from "../../store/useBedStore";
import BedStatusPanel from "../../components/hospital/BedStatusPanel";
import WaitingAmbulanceList from "../../components/hospital/WaitingAmbulanceList";
import RealTimeMap from "../../components/hospital/RealTimeMap";
import useHospitalAlarmRefresh from "../../hooks/useHospitalAlarmRefresh";

const InitialSetupModal = ({ onSave, onCancel }) => {
  const [generalTotal, setGeneralTotal] = useState(20);
  const [pediatricTotal, setPediatricTotal] = useState(10);
  const [traumaTotal, setTraumaTotal] = useState(5);
  const [neonatalTotal, setNeonatalTotal] = useState(5);

  const handleSave = () => {
    const data = {
      generalTotalBed: generalTotal,
      generalAvailableBed: generalTotal,
      pediatricTotalBed: pediatricTotal,
      pediatricAvailableBed: pediatricTotal,
      traumaTotalBed: traumaTotal,
      traumaAvailableBed: traumaTotal,
      neonatalTotalBed: neonatalTotal,
      neonatalAvailableBed: neonatalTotal,
    };
    onSave(data);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "32px",
          borderRadius: "8px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
          maxWidth: "400px",
          width: "90%",
        }}
      >
        <h3
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "16px",
            textAlign: "center",
            color: "#1f2937",
          }}
        >
          병상 정보 초기 설정
        </h3>

        <p
          style={{
            color: "#6b7280",
            marginBottom: "24px",
            textAlign: "center",
            fontSize: "14px",
          }}
        >
          병원의 병상 정보가 없습니다. 초기 병상 수를 설정해주세요.
        </p>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            일반병동
          </label>
          <input
            type="number"
            min="0"
            value={generalTotal}
            onChange={(e) => setGeneralTotal(parseInt(e.target.value) || 0)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            소아병동
          </label>
          <input
            type="number"
            min="0"
            value={pediatricTotal}
            onChange={(e) => setPediatricTotal(parseInt(e.target.value) || 0)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            외상센터
          </label>
          <input
            type="number"
            min="0"
            value={traumaTotal}
            onChange={(e) => setTraumaTotal(parseInt(e.target.value) || 0)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            신생아실
          </label>
          <input
            type="number"
            min="0"
            value={neonatalTotal}
            onChange={(e) => setNeonatalTotal(parseInt(e.target.value) || 0)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f3f4f6",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 16px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            설정 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const {
    loading,
    error,
    hospitalInfo,
    hospitalLocation,
    bedInfo,
    fetchHospitalInfo,
    fetchHospitalLocation,
    fetchBedInfo,
    decreaseBedManually,
    increaseBedManually,
    updateBedInfo,
  } = useHospitalStore();

  const [beds, setBeds] = useState([]);
  const [isInitialSetup, setIsInitialSetup] = useState(false);

  // WebSocket 알람 수신 시 자동 새로고침
  useHospitalAlarmRefresh(async () => {
    if (user?.userId) {
      try {
        await fetchBedInfo();
      } catch (error) {
        console.error("자동 새로고침 - 병상 정보 조회 실패:", error);
      }
    }
  }, ['MATCHING', 'REQUEST', 'EDIT']); // 매칭, 통화 요청, 정보 수정 알람에 반응

  useEffect(() => {}, [hospitalInfo]);

  useEffect(() => {}, [hospitalLocation]);

  useEffect(() => {
    const initializeData = async () => {
      if (user?.userId) {
        try {
          await fetchHospitalInfo();
        } catch (error) {
          console.error("병원 정보 조회 실패:", error);
        }

        try {
          await fetchHospitalLocation();
        } catch (error) {
          console.error("병원 위치 조회 실패:", error);
        }

        try {
          const bedResult = await fetchBedInfo();
          if (bedResult?.isDefault) {
            setIsInitialSetup(true);
          }
        } catch (error) {
          console.error("병상 정보 조회 실패:", error);
        }
      }
    };

    initializeData();
  }, [user]);

  useEffect(() => {
    if (bedInfo) {
      const transformedBeds = [
        {
          id: 1,
          name: "일반병동",
          category: "GENERAL",
          type: "GENERAL",
          totalBeds: bedInfo.generalTotalBed || 0,
          currentPatients:
            (bedInfo.generalTotalBed || 0) - (bedInfo.generalAvailableBed || 0),
          status: bedInfo.generalIsAvailable ? "available" : "disabled",
          isAvailable: bedInfo.generalIsAvailable,
          isExist: bedInfo.generalIsExist,
        },
        {
          id: 2,
          name: "소아병동",
          category: "PEDIATRIC",
          type: "PEDIATRIC",
          totalBeds: bedInfo.pediatricTotalBed || 0,
          currentPatients:
            (bedInfo.pediatricTotalBed || 0) -
            (bedInfo.pediatricAvailableBed || 0),
          status: bedInfo.pediatricIsAvailable ? "available" : "disabled",
          isAvailable: bedInfo.pediatricIsAvailable,
          isExist: bedInfo.pediatricIsExist,
        },
        {
          id: 3,
          name: "외상센터",
          category: "TRAUMA",
          type: "TRAUMA",
          totalBeds: bedInfo.traumaTotalBed || 0,
          currentPatients:
            (bedInfo.traumaTotalBed || 0) - (bedInfo.traumaAvailableBed || 0),
          status: bedInfo.traumaIsAvailable ? "available" : "disabled",
          isAvailable: bedInfo.traumaIsAvailable,
          isExist: bedInfo.traumaIsExist,
        },
        {
          id: 4,
          name: "신생아실",
          category: "NEONATAL",
          type: "NEONATAL",
          totalBeds: bedInfo.neonatalTotalBed || 0,
          currentPatients:
            (bedInfo.neonatalTotalBed || 0) -
            (bedInfo.neonatalAvailableBed || 0),
          status: bedInfo.neonatalIsAvailable ? "available" : "disabled",
          isAvailable: bedInfo.neonatalIsAvailable,
          isExist: bedInfo.neonatalIsExist,
        },
      ];

      const visibleBeds = transformedBeds.filter(
        (bed) => bed.isExist !== false
      );
      setBeds(visibleBeds);
    } else {
    }
  }, [bedInfo]);

  const handleBedUpdate = async (bedType, updateType, value) => {
    try {
      if (updateType === "current") {
        let result = { success: true };

        if (value > 0) {
          result = await decreaseBedManually(bedType);
        } else if (value < 0) {
          result = await increaseBedManually(bedType);
        }

        if (!result?.success) {
          alert(
            "베드 환자 수 변경에 실패했습니다: " +
              (result?.error || "알 수 없는 오류")
          );
        }
      } else if (updateType === "total") {
        if (value < 0) {
          alert("베드 수는 0보다 작을 수 없습니다.");
          return;
        }

        const updateData = {};
        const currentBed = beds.find((b) => b.type === bedType);

        if (bedType === "GENERAL") {
          updateData.generalTotalBed = value;
          updateData.generalAvailableBed = Math.max(
            0,
            value - (currentBed?.currentPatients || 0)
          );
        } else if (bedType === "PEDIATRIC") {
          updateData.pediatricTotalBed = value;
          updateData.pediatricAvailableBed = Math.max(
            0,
            value - (currentBed?.currentPatients || 0)
          );
        } else if (bedType === "TRAUMA") {
          updateData.traumaTotalBed = value;
          updateData.traumaAvailableBed = Math.max(
            0,
            value - (currentBed?.currentPatients || 0)
          );
        } else if (bedType === "NEONATAL") {
          updateData.neonatalTotalBed = value;
          updateData.neonatalAvailableBed = Math.max(
            0,
            value - (currentBed?.currentPatients || 0)
          );
        }

        const result = await updateBedInfo(updateData);
        if (!result?.success) {
          alert(
            "베드 정보 업데이트에 실패했습니다: " +
              (result?.error || "알 수 없는 오류")
          );
        }
      } else if (updateType === "status") {
      }
    } catch (error) {
      console.error("베드 업데이트 중 오류 발생:", error);
      alert("베드 업데이트 중 오류가 발생했습니다: " + error.message);
    }
  };

  // const handleInitialSetup = async (initialData) => {
  //   const convertedData = {
  //     generalTotalBed: initialData.generalTotalBed || 0,
  //     generalAvailableBed: initialData.generalAvailableBed || 0,
  //     pediatricTotalBed: initialData.pediatricTotalBed || 0,
  //     pediatricAvailableBed: initialData.pediatricAvailableBed || 0,
  //     traumaTotalBed: initialData.traumaTotalBed || 0,
  //     traumaAvailableBed: initialData.traumaAvailableBed || 0,
  //     neonatalTotalBed: initialData.neonatalTotalBed || 0,
  //     neonatalAvailableBed: initialData.neonatalAvailableBed || 0
  //   };

  //   const result = await updateBedInfo(convertedData);
  //   if (result.success) {
  //     setIsInitialSetup(false);
  //     alert('병상 정보가 설정되었습니다.');
  //   } else {
  //     alert('병상 정보 설정에 실패했습니다: ' + result.error);
  //   }
  // };

  const getStatistics = () => {
    const totalBeds = beds.reduce((sum, bed) => sum + bed.totalBeds, 0);
    const totalPatients = beds.reduce(
      (sum, bed) => sum + bed.currentPatients,
      0
    );
    const availableBeds = totalBeds - totalPatients;

    return { totalBeds, totalPatients, availableBeds };
  };

  const stats = getStatistics();

  return (
    <main
      style={{
        paddingTop: "0",
        height: "100vh",
        backgroundColor: "#f3f4f6",
        margin: "0",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "400px 1fr 400px",
          gap: "0",
          height: "100%",
          width: "100%",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            padding: "16px",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <BedStatusPanel
            beds={beds}
            loading={loading}
            error={error}
            hospitalInfo={hospitalInfo}
            onBedUpdate={handleBedUpdate}
            stats={stats}
          />
        </div>

        <div
          style={{
            backgroundColor: "#f8fafc",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            minHeight: "100vh",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "12px",
              paddingBottom: "12px",
              borderBottom: "2px solid #e5e7eb",
            }}
          >
            {hospitalInfo && (
              <h3
                style={{
                  fontSize: "40px",
                  fontWeight: "bold",
                  color: "#059669",
                  margin: 0,
                  textAlign: "center",
                }}
              >
                {hospitalInfo.name}
              </h3>
            )}
          </div>

          <div
            style={{
              flex: 1,
              borderRadius: "12px",
              border: "2px solid #e5e7eb",
              backgroundColor: "white",
              minHeight: "400px",
            }}
          >
            <RealTimeMap 
              hospitalLocation={{
                latitude: hospitalLocation?.latitude,
                longitude: hospitalLocation?.longitude,
                name: hospitalInfo?.name
              }}
            />
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#f9fafb",
            borderLeft: "1px solid #e5e7eb",
            overflow: "auto",
            height: "100vh",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              height: "100%",
            }}
          >
            <WaitingAmbulanceList compact={true} showCallButton={false} />
          </div>
        </div>
      </div>
    </main>
  );
}
