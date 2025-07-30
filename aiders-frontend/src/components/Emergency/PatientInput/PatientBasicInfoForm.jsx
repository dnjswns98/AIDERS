import React from 'react';

const PatientBasicInfoForm = ({ formData, handleInputChange }) => {
  return (
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
  );
};

export default PatientBasicInfoForm;
