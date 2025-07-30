import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AmbulanceLayout from "../../components/Emergency/Layout/AmbulanceLayout";
import useEmergencyStore from "../../store/useEmergencyStore";

export default function AmbulancePatientInputPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const isEditMode = state?.isEditMode || false;

  const { selectedAmbulance, updatePatientInfo } = useEmergencyStore();

  const [formData, setFormData] = useState({
    ktasLevel: "",
    department: "",
    gender: "",
    ageRange: "",
    name: "",
    chiefComplaint: "",
    treatmentDetails: "",
    familyHistory: "",
    pastHistory: "",
    medications: "",
    vitalSigns: "",
  });

  const [inputMode, setInputMode] = useState('drawing'); // 'drawing' 또는 'typing'
  const chiefComplaintCanvasRef = useRef(null);
  const nameCanvasRef = useRef(null);
  const vitalSignsCanvasRef = useRef(null);
  const treatmentDetailsCanvasRef = useRef(null);
  const pastHistoryCanvasRef = useRef(null);
  const familyHistoryCanvasRef = useRef(null);
  const medicationsCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const toggleInputMode = () => {
    setInputMode(prevMode => prevMode === 'drawing' ? 'typing' : 'drawing');
  };

  const clearCanvas = (fieldName) => {
    const canvasRef = {
      chiefComplaint: chiefComplaintCanvasRef,
      name: nameCanvasRef,
      vitalSigns: vitalSignsCanvasRef,
      treatmentDetails: treatmentDetailsCanvasRef,
      pastHistory: pastHistoryCanvasRef,
      familyHistory: familyHistoryCanvasRef,
      medications: medicationsCanvasRef,
    }[fieldName];

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setFormData(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const saveCanvasAsImage = (fieldName) => {
    const canvasRef = {
      chiefComplaint: chiefComplaintCanvasRef,
      name: nameCanvasRef,
      vitalSigns: vitalSignsCanvasRef,
      treatmentDetails: treatmentDetailsCanvasRef,
      pastHistory: pastHistoryCanvasRef,
      familyHistory: familyHistoryCanvasRef,
      medications: medicationsCanvasRef,
    }[fieldName];

    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      setFormData(prev => ({ ...prev, [fieldName]: dataURL }));
    }
  };

  useEffect(() => {
    if (isEditMode && selectedAmbulance) {
      setFormData({
        ktasLevel: selectedAmbulance.patientDetails.ktasLevel?.split(' ')[0] ?? '',
        department: selectedAmbulance.patientDetails.department ?? '',
        gender: selectedAmbulance.patientInfo.gender ?? '',
        ageRange: selectedAmbulance.patientDetails.ageRange ?? '',
        name: selectedAmbulance.patientInfo.name ?? '',
        chiefComplaint: selectedAmbulance.patientDetails.chiefComplaint ?? '',
        treatmentDetails: selectedAmbulance.patientDetails.treatmentDetails ?? '',
        familyHistory: selectedAmbulance.patientDetails.familyHistory?.father ?? '',
        pastHistory: selectedAmbulance.patientDetails.pastHistory?.hypertension ?? '',
        medications: selectedAmbulance.patientDetails.medications?.map(m => m.name).join(', ') ?? '',
        vitalSigns: selectedAmbulance.patientDetails.vitalSigns?.bloodPressure ?? '',
      });
    }
  }, [isEditMode, selectedAmbulance]);

  // Canvas drawing logic for name
  useEffect(() => {
    const canvas = nameCanvasRef.current;
    if (!canvas || inputMode !== 'drawing') return;

    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const startDrawing = (e) => {
      setIsDrawing(true);
      setLastPos(getMousePos(e));
    };

    const draw = (e) => {
      if (!isDrawing) return;
      const currentPos = getMousePos(e);
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
      setLastPos(currentPos);
    };

    const stopDrawing = () => {
      setIsDrawing(false);
      saveCanvasAsImage('name');
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    if (formData.name && formData.name.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = formData.name;
    }

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
    };
  }, [inputMode, isDrawing, lastPos, formData.name]);

  // Canvas drawing logic for vitalSigns
  useEffect(() => {
    const canvas = vitalSignsCanvasRef.current;
    if (!canvas || inputMode !== 'drawing') return;

    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const startDrawing = (e) => {
      setIsDrawing(true);
      setLastPos(getMousePos(e));
    };

    const draw = (e) => {
      if (!isDrawing) return;
      const currentPos = getMousePos(e);
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
      setLastPos(currentPos);
    };

    const stopDrawing = () => {
      setIsDrawing(false);
      saveCanvasAsImage('vitalSigns');
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    if (formData.vitalSigns && formData.vitalSigns.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = formData.vitalSigns;
    }

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
    };
  }, [inputMode, isDrawing, lastPos, formData.vitalSigns]);

  // Canvas drawing logic for treatmentDetails
  useEffect(() => {
    const canvas = treatmentDetailsCanvasRef.current;
    if (!canvas || inputMode !== 'drawing') return;

    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const startDrawing = (e) => {
      setIsDrawing(true);
      setLastPos(getMousePos(e));
    };

    const draw = (e) => {
      if (!isDrawing) return;
      const currentPos = getMousePos(e);
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
      setLastPos(currentPos);
    };

    const stopDrawing = () => {
      setIsDrawing(false);
      saveCanvasAsImage('treatmentDetails');
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    if (formData.treatmentDetails && formData.treatmentDetails.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = formData.treatmentDetails;
    }

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
    };
  }, [inputMode, isDrawing, lastPos, formData.treatmentDetails]);

  // Canvas drawing logic for pastHistory
  useEffect(() => {
    const canvas = pastHistoryCanvasRef.current;
    if (!canvas || inputMode !== 'drawing') return;

    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const startDrawing = (e) => {
      setIsDrawing(true);
      setLastPos(getMousePos(e));
    };

    const draw = (e) => {
      if (!isDrawing) return;
      const currentPos = getMousePos(e);
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
      setLastPos(currentPos);
    };

    const stopDrawing = () => {
      setIsDrawing(false);
      saveCanvasAsImage('pastHistory');
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    if (formData.pastHistory && formData.pastHistory.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = formData.pastHistory;
    }

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
    };
  }, [inputMode, isDrawing, lastPos, formData.pastHistory]);

  // Canvas drawing logic for familyHistory
  useEffect(() => {
    const canvas = familyHistoryCanvasRef.current;
    if (!canvas || inputMode !== 'drawing') return;

    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const startDrawing = (e) => {
      setIsDrawing(true);
      setLastPos(getMousePos(e));
    };

    const draw = (e) => {
      if (!isDrawing) return;
      const currentPos = getMousePos(e);
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
      setLastPos(currentPos);
    };

    const stopDrawing = () => {
      setIsDrawing(false);
      saveCanvasAsImage('familyHistory');
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    if (formData.familyHistory && formData.familyHistory.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = formData.familyHistory;
    }

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
    };
  }, [inputMode, isDrawing, lastPos, formData.familyHistory]);

  // Canvas drawing logic for medications
  useEffect(() => {
    const canvas = medicationsCanvasRef.current;
    if (!canvas || inputMode !== 'drawing') return;

    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const startDrawing = (e) => {
      setIsDrawing(true);
      setLastPos(getMousePos(e));
    };

    const draw = (e) => {
      if (!isDrawing) return;
      const currentPos = getMousePos(e);
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
      setLastPos(currentPos);
    };

    const stopDrawing = () => {
      setIsDrawing(false);
      saveCanvasAsImage('medications');
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    if (formData.medications && formData.medications.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = formData.medications;
    }

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
    };
  }, [inputMode, isDrawing, lastPos, formData.medications]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      formData.ktasLevel.includes('선택') ||
      formData.department.includes('선택') ||
      formData.ktasLevel === ''||
      formData.department === '' 
    ) {
      alert('필수 입력 항목을 모두 올바르게 선택해주세요.');
      return;
    }

    if (selectedAmbulance) {
      let updatedInfo;

      if (isEditMode) {
        const existingPatientInfo = selectedAmbulance.patientInfo;
        const existingPatientDetails = selectedAmbulance.patientDetails;
        updatedInfo = {
          patientInfo: {
            ...existingPatientInfo,
            gender: formData.gender,
            name: formData.name,
            age: formData.ageRange,
          },
          patientDetails: {
            ...existingPatientDetails,
            ktasLevel: `${formData.ktasLevel}등급`,
            department: formData.department,
            ageRange: formData.ageRange,
            chiefComplaint: inputMode === 'drawing' ? formData.chiefComplaint : formData.chiefComplaint,
            treatmentDetails: inputMode === 'drawing' ? formData.treatmentDetails : formData.treatmentDetails,
            familyHistory: { 
                ...existingPatientDetails.familyHistory,
                father: inputMode === 'drawing' ? formData.familyHistory : formData.familyHistory 
            },
            pastHistory: { 
                ...existingPatientDetails.pastHistory,
                hypertension: inputMode === 'drawing' ? formData.pastHistory : formData.pastHistory 
            },
            medications: inputMode === 'drawing' ? formData.medications : formData.medications.split(',').map(name => ({ name: name.trim(), indication: '' })).filter(m => m.name),
            vitalSigns: { 
                ...existingPatientDetails.vitalSigns,
                bloodPressure: inputMode === 'drawing' ? formData.vitalSigns : formData.vitalSigns 
            },
          },
        };
      } else {
        updatedInfo = {
          patientInfo: {
            gender: formData.gender,
            name: inputMode === 'drawing' ? formData.name : '',
            age: formData.ageRange,
          },
          patientDetails: {
            ktasLevel: `${formData.ktasLevel}등급`,
            department: formData.department,
            ageRange: formData.ageRange,
            chiefComplaint: inputMode === 'drawing' ? formData.chiefComplaint : '',
            treatmentDetails: inputMode === 'drawing' ? formData.treatmentDetails : '',
            familyHistory: { father: inputMode === 'drawing' ? formData.familyHistory : '' },
            pastHistory: { hypertension: inputMode === 'drawing' ? formData.pastHistory : '' },
            medications: inputMode === 'drawing' ? formData.medications : [],
            vitalSigns: { bloodPressure: inputMode === 'drawing' ? formData.vitalSigns : '' },
          },
        };
      }
      updatePatientInfo(selectedAmbulance.id, updatedInfo);
    }
    navigate("/emergency");
  };

  return (
    <AmbulanceLayout>
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto relative">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          {isEditMode ? "환자 상세 정보 수정" : "환자 필수 정보 입력"}
        </h1>
        {isEditMode && (
          <div className="absolute top-4 right-4">
            <button
              type="button"
              onClick={toggleInputMode}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
              title={inputMode === 'drawing' ? '타이핑 모드로 전환' : '필기 모드로 전환'}
            >
              {inputMode === 'drawing' ? (
                <i className="fas fa-pen text-lg"></i>
              ) : (
                <i className="fas fa-keyboard text-lg"></i>
              )}
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 필수 정보 섹션 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-b pb-6">
            <div>
              <label
                htmlFor="ktasLevel"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                KTAS
              </label>
              <select
                id="ktasLevel"
                name="ktasLevel"
                value={formData.ktasLevel}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="" disabled hidden>중증도(KTAS등급)를 입력하세요</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                진료 과목
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="" disabled hidden>진료과목을 입력하세요.</option>
                <option>내과</option>
                <option>외과</option>
                <option>흉부외과</option>
                <option>신경외과</option>
                <option>정형외과</option>
                <option>산부인과</option>
                <option>소아과</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                성별
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="" disabled hidden>성별을 선택하세요.</option>
                <option>남</option>
                <option>여</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="ageRange"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                연령대
              </label>
              <select
                id="ageRange"
                name="ageRange"
                value={formData.ageRange}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="" disabled hidden>연령대를 선택하세요.</option>
                <option>신생아</option>
                <option>영아</option>
                <option>유아</option>
                <option>아동</option>
                <option>10대</option>
                <option>20대</option>
                <option>30대</option>
                <option>40대</option>
                <option>50대</option>
                <option>60대</option>
                <option>70대</option>
                <option>80대</option>
                <option>90대 이상</option>
              </select>
            </div>
          </div>

          {/* 상세 정보 섹션 (수정 모드) */}
          {isEditMode && (
            <div className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    이름
                  </label>
                  {inputMode === 'typing' ? (
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    <div className="relative border border-gray-300 rounded-md shadow-sm overflow-hidden">
                      <canvas
                        ref={nameCanvasRef}
                        width="400"
                        height="50"
                        className="bg-white w-full"
                        style={{ touchAction: 'none' }}
                      ></canvas>
                      <button
                        type="button"
                        onClick={() => clearCanvas('name')}
                        className="absolute bottom-1 right-1 bg-red-500 hover:bg-red-600 text-white text-xs px-1 py-0.5 rounded"
                      >
                        지우기
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="vitalSigns"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    바이탈 사인 (혈압)
                  </label>
                  {inputMode === 'typing' ? (
                    <input
                      type="text"
                      id="vitalSigns"
                      name="vitalSigns"
                      value={formData.vitalSigns}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    <div className="relative border border-gray-300 rounded-md shadow-sm overflow-hidden">
                      <canvas
                        ref={vitalSignsCanvasRef}
                        width="400"
                        height="50"
                        className="bg-white w-full"
                        style={{ touchAction: 'none' }}
                      ></canvas>
                      <button
                        type="button"
                        onClick={() => clearCanvas('vitalSigns')}
                        className="absolute bottom-1 right-1 bg-red-500 hover:bg-red-600 text-white text-xs px-1 py-0.5 rounded"
                      >
                        지우기
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="chiefComplaint"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  주요 증상 (상세)
                </label>
                {inputMode === 'typing' ? (
                  <textarea
                    id="chiefComplaint"
                    name="chiefComplaint"
                    rows="3"
                    value={formData.chiefComplaint}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  ></textarea>
                ) : (
                  <div className="relative border border-gray-300 rounded-md shadow-sm overflow-hidden">
                    <canvas
                      ref={chiefComplaintCanvasRef}
                      width="400"
                      height="150"
                      className="bg-white w-full"
                      style={{ touchAction: 'none' }} // 터치 이벤트 기본 동작 방지
                    ></canvas>
                    <button
                      type="button"
                      onClick={() => clearCanvas('chiefComplaint')}
                      className="absolute bottom-2 right-2 bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded"
                    >
                      지우기
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="treatmentDetails"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  처치 내용
                </label>
                {inputMode === 'typing' ? (
                  <textarea
                    id="treatmentDetails"
                    name="treatmentDetails"
                    rows="3"
                    value={formData.treatmentDetails}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  ></textarea>
                ) : (
                  <div className="relative border border-gray-300 rounded-md shadow-sm overflow-hidden">
                    <canvas
                      ref={treatmentDetailsCanvasRef}
                      width="400"
                      height="150"
                      className="bg-white w-full"
                      style={{ touchAction: 'none' }}
                    ></canvas>
                    <button
                      type="button"
                      onClick={() => clearCanvas('treatmentDetails')}
                      className="absolute bottom-2 right-2 bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded"
                    >
                      지우기
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="pastHistory"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    과거력
                  </label>
                  {inputMode === 'typing' ? (
                    <input
                      type="text"
                      id="pastHistory"
                      name="pastHistory"
                      value={formData.pastHistory}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    <div className="relative border border-gray-300 rounded-md shadow-sm overflow-hidden">
                      <canvas
                        ref={pastHistoryCanvasRef}
                        width="400"
                        height="50"
                        className="bg-white w-full"
                        style={{ touchAction: 'none' }}
                      ></canvas>
                      <button
                        type="button"
                        onClick={() => clearCanvas('pastHistory')}
                        className="absolute bottom-1 right-1 bg-red-500 hover:bg-red-600 text-white text-xs px-1 py-0.5 rounded"
                      >
                        지우기
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="familyHistory"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    가족력
                  </label>
                  {inputMode === 'typing' ? (
                    <input
                      type="text"
                      id="familyHistory"
                      name="familyHistory"
                      value={formData.familyHistory}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    <div className="relative border border-gray-300 rounded-md shadow-sm overflow-hidden">
                      <canvas
                        ref={familyHistoryCanvasRef}
                        width="400"
                        height="50"
                        className="bg-white w-full"
                        style={{ touchAction: 'none' }}
                      ></canvas>
                      <button
                        type="button"
                        onClick={() => clearCanvas('familyHistory')}
                        className="absolute bottom-1 right-1 bg-red-500 hover:bg-red-600 text-white text-xs px-1 py-0.5 rounded"
                      >
                        지우기
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="medications"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  복용중인 약
                </label>
                {inputMode === 'typing' ? (
                  <input
                    type="text"
                    id="medications"
                    name="medications"
                    value={formData.medications}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  <div className="relative border border-gray-300 rounded-md shadow-sm overflow-hidden">
                    <canvas
                      ref={medicationsCanvasRef}
                      width="400"
                      height="50"
                      className="bg-white w-full"
                      style={{ touchAction: 'none' }}
                    ></canvas>
                    <button
                      type="button"
                      onClick={() => clearCanvas('medications')}
                      className="absolute bottom-1 right-1 bg-red-500 hover:bg-red-600 text-white text-xs px-1 py-0.5 rounded"
                    >
                      지우기
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              {isEditMode ? "정보 저장" : "병원 매칭"}
            </button>
          </div>
        </form>
      </div>
    </AmbulanceLayout>
  );
}
