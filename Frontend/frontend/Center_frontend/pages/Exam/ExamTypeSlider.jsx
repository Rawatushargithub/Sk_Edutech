import React, { useState } from 'react';

const ExamTypeSlider = ({ selectedExamType, onExamTypeChange }) => {
  const examTypes = [
    { value: "Weekly Test", label: "Weekly", color: "bg-blue-500" },
    { value: "Monthly Test", label: "Monthly", color: "bg-yellow-500" },
    { value: "Final Test", label: "Final", color: "bg-red-500" }
  ];

  const getActiveIndex = () => {
    if (selectedExamType === "all") return -1;
    return examTypes.findIndex(type => type.value === selectedExamType);
  };

  const handleSliderClick = (index) => {
    if (getActiveIndex() === index) {
      // If clicking the same option, reset to "all"
      onExamTypeChange("all");
    } else {
      onExamTypeChange(examTypes[index].value);
    }
  };

  const activeIndex = getActiveIndex();

  return (
    <div className="bg-white border rounded-lg p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Exam Type Filter</span>
        {selectedExamType !== "all" && (
          <button
            onClick={() => onExamTypeChange("all")}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Clear
          </button>
        )}
      </div>
      
      <div className="relative">
        {/* Background track */}
        <div className="h-8 bg-gray-200 rounded-full relative overflow-hidden">
          {/* Active indicator */}
          {activeIndex >= 0 && (
            <div
              className={`absolute top-0 h-full rounded-full transition-all duration-300 ease-in-out ${examTypes[activeIndex].color}`}
              style={{
                left: `${(activeIndex * 100) / 3}%`,
                width: `${100 / 3}%`
              }}
            />
          )}
          
          {/* Clickable segments */}
          <div className="absolute inset-0 flex">
            {examTypes.map((type, index) => (
              <button
                key={type.value}
                onClick={() => handleSliderClick(index)}
                className={`flex-1 flex items-center justify-center text-sm font-medium transition-colors duration-200 relative z-10 ${
                  activeIndex === index
                    ? 'text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Divider lines */}
        <div className="absolute inset-y-0 left-1/3 w-px bg-white opacity-50" />
        <div className="absolute inset-y-0 left-2/3 w-px bg-white opacity-50" />
      </div>
      
      {/* Current selection indicator */}
      <div className="mt-2 text-center">
        <span className="text-xs text-gray-600">
          {selectedExamType === "all" 
            ? "All exam types" 
            : `${selectedExamType} selected`
          }
        </span>
      </div>
    </div>
  );
};


export default ExamTypeSlider;