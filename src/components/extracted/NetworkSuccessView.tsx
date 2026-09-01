import React from 'react';
import { PythonReactNativeHub } from '../calculator/PythonReactNativeHub';

// Network Success — Thai Life Insurance Network & Compensation Hub
// สร้างจากข้อมูล AI Studio app export (thai_life_compensation.py + PythonReactNativeHub)
export const NetworkSuccessView: React.FC = () => {
  return (
    <div className="w-full">
      <PythonReactNativeHub />
    </div>
  );
};

export default NetworkSuccessView;
