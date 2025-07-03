// IdCardView.jsx
import React from 'react';

const IdCardView = ({ student, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white w-[300px] h-full p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Student ID Card</h2>
        <div className="flex flex-col items-center">
          <img src={student.studentPhoto} alt="Student" className="w-24 h-24 rounded-full" />
          <p className="mt-4"><strong>{student.studentName}</strong></p>
          <p>Batch: {student.batch}</p>
          <p>ID: {student._id}</p>
        </div>
      </div>
    </div>
  );
};

export default IdCardView;