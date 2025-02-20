import React, { createContext, useContext, useState } from 'react';

const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
  const [students, setStudents] = useState([{
    id: 1,
    detail: 'Course Enquiry',
    studentName: 'Rahul Rajber Gupta',
    courseInterested: 'Basic Course in Computers',
    email: 'email@example.com',
    mobile: '9998887776',
    referralCode: 'REF123',
    referralName: 'Referral Name Example',
    date: '22-01-2025'
  }]);
  
  const [editingId, setEditingId] = useState(null);

  const addStudent = (student) => {
    setStudents([...students, { 
      ...student,
      id: students.length + 1,
      detail: 'Course Enquiry',
      date: new Date().toLocaleDateString()
    }]);
  };

  const updateStudent = (id, updatedData) => {
    setStudents(students.map(student => 
      student.id === id ? { ...student, ...updatedData } : student
    ));
    setEditingId(null);
  };

  const deleteStudent = (id) => {
    setStudents(students.filter(student => student.id !== id));
  };

  const registerStudent = (id) => {
    setStudents(students.map(student =>
      student.id === id ? { ...student, status: 'registered' } : student
    ));
  };

  return (
    <StudentContext.Provider value={{
      students,
      editingId,
      setEditingId,
      addStudent,
      updateStudent,
      deleteStudent,
      registerStudent
    }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudentContext = () => useContext(StudentContext);