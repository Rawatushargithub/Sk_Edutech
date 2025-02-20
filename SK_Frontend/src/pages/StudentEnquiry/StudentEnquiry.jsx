import React, { useState } from "react";
import { FaEdit, FaTrash, FaFileExport, FaPlusCircle, FaUserPlus, FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useStudentContext } from '../../context/StudentContext.jsx';
import * as XLSX from 'xlsx';

const StudentEnquiry = () => {
  const { 
    students, 
    updateStudent, 
    deleteStudent, 
    registerStudent 
  } = useStudentContext();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRow, setEditingRow] = useState(null);
  const [editingCell, setEditingCell] = useState({ id: null, field: null });
  const [editValue, setEditValue] = useState("");
  const [originalValues, setOriginalValues] = useState({});
  const [tempValues, setTempValues] = useState({});
  
  const navigate = useNavigate();
  
  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleEntriesChange = (event) => setEntriesPerPage(Number(event.target.value));
  const handlePageChange = (newPage) => setCurrentPage(newPage);
  const StudentEnquiry = () => {navigate('/new-enquiry');}

  const startEditing = (student) => {
    setEditingRow(student.id);
    const originals = {
      studentName: student.studentName,
      detail: student.detail,
      courseInterested: student.courseInterested,
      email: student.email,
      mobile: student.mobile,
      referralCode: student.referralCode,
      referralName: student.referralName
    };
    setOriginalValues(originals);
    setTempValues(originals);
  };

  const startEditingCell = (student, field) => {
    if (editingRow === student.id) {
      setEditingCell({ id: student.id, field });
      setEditValue(tempValues[field] || student[field]);
    }
  };

  const handleSave = (id) => {
    const updatedValues = {
      ...tempValues,
      ...(editingCell.field ? { [editingCell.field]: editValue } : {})
    };
    updateStudent(id, updatedValues);
    setEditingRow(null);
    setEditingCell({ id: null, field: null });
    setEditValue("");
    setOriginalValues({});
    setTempValues({});
  };

  const handleCancel = () => {
    if (editingRow) {
      updateStudent(editingRow, originalValues);
      setEditingRow(null);
      setEditingCell({ id: null, field: null });
      setEditValue("");
      setOriginalValues({});
      setTempValues({});
    }
  };

  const handleKeyPress = (e, id) => {
    if (e.key === 'Enter') {
      handleSave(id);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      deleteStudent(id);
    }
  };

  const handleRegister = (id) => {
    if (window.confirm('Are you sure you want to register this student?')) {
      registerStudent(id);
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(students);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "student_enquiries.xlsx");
  };

  const filteredStudents = students.filter(student =>
    Object.values(student).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredStudents.slice(indexOfFirstEntry, indexOfLastEntry);

  const EditableCell = ({ student, field }) => {
    const isEditing = editingCell.id === student.id && editingCell.field === field;
    const isRowEditing = editingRow === student.id;
    
    return (
      <div className="min-w-[150px] h-full">
        {!isEditing ? (
          <div 
            className={`w-full h-full ${isRowEditing ? 'cursor-pointer hover:bg-[#F8F9FA]' : ''} px-2 py-1 rounded`}
            onClick={() => isRowEditing && startEditingCell(student, field)}
          >
            {tempValues[field] || student[field]}
          </div>
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              setTempValues(prev => ({
                ...prev,
                [field]: e.target.value
              }));
            }}
            onBlur={() => {
              if (editingCell.id) {
                setTempValues(prev => ({
                  ...prev,
                  [field]: editValue
                }));
                setEditingCell({ id: null, field: null });
              }
            }}
            onKeyDown={(e) => handleKeyPress(e, student.id)}
            className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
            autoFocus
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-8">
      <div className="w-full max-w-7xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#457B9D]">List Student Enquiries</h1>
          <div className="flex gap-4">
            <button 
              onClick={handleExport}
              className="flex items-center px-4 py-2 bg-[#6C757D] hover:bg-[#5A6268] text-white rounded-lg shadow-md transform transition-transform hover:-translate-y-1"
            >
              <FaFileExport className="mr-2" />
              Export
            </button>
            <button 
              onClick={StudentEnquiry}
              className="flex items-center px-4 py-2 bg-[#457B9D] hover:bg-[#386480] text-white rounded-lg shadow-md transform transition-transform hover:-translate-y-1"
            >
              <FaPlusCircle className="mr-2" />
              New Student Enquiry
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-64 px-3 py-2 border border-[#DFE3E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Show</span>
            <select
              value={entriesPerPage}
              onChange={handleEntriesChange}
              className="appearance-none px-3 py-2 pr-8 border border-[#DFE3E6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#457B9D] bg-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-gray-600">entries</span>
          </div>
        </div>

        <div className="overflow-x-auto border border-[#DFE3E6] rounded-lg">
          <table className="min-w-full divide-y divide-[#DFE3E6]">
            <thead className="bg-[#457B9D]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">S/N</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Detail</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Course Interested</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Referral Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Referral Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#DFE3E6]">
              {currentEntries.map((student) => (
                <tr key={student.id} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{student.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {editingRow === student.id ? (
                        <>
                          <button
                            onClick={() => handleSave(student.id)}
                            className="p-2 text-[#28A745] hover:bg-[#E9F7EF] rounded-full transition-colors"
                            title="Save changes"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-2 text-[#DC3545] hover:bg-[#FBEDEE] rounded-full transition-colors"
                            title="Cancel editing"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEditing(student)}
                          className="p-2 text-[#457B9D] hover:bg-[#EFF6FA] rounded-full transition-colors"
                          title="Edit student"
                        >
                          <FaEdit />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="p-2 text-[#DC3545] hover:bg-[#FBEDEE] rounded-full transition-colors"
                        title="Delete student"
                      >
                        <FaTrash />
                      </button>
                      <button
                        onClick={() => handleRegister(student.id)}
                        className={`flex items-center px-3 py-1 ${
                          student.status === 'registered' 
                            ? 'text-gray-400 hover:bg-gray-100' 
                            : 'text-[#457B9D] hover:bg-[#EFF6FA]'
                        } rounded-md transition-colors`}
                        disabled={student.status === 'registered'}
                      >
                        <FaUserPlus className="mr-1" />
                        {student.status === 'registered' ? 'Registered' : 'Register'}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <EditableCell student={student} field="detail" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <EditableCell student={student} field="studentName" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <EditableCell student={student} field="courseInterested" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <EditableCell student={student} field="email" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <EditableCell student={student} field="mobile" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <EditableCell student={student} field="referralCode" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <EditableCell student={student} field="referralName" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 ${
              currentPage === 1 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-[#457B9D] hover:bg-[#386480]'
            } text-white rounded-md transition-colors`}
          >
            Previous
          </button>
          <span className="text-[#457B9D] font-medium">
            Page {currentPage} of {Math.ceil(filteredStudents.length / entriesPerPage)}
          </span>
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={indexOfLastEntry >= filteredStudents.length}
            className={`px-4 py-2 ${
              indexOfLastEntry >= filteredStudents.length 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-[#457B9D] hover:bg-[#386480]'
            } text-white rounded-md transition-colors`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentEnquiry;