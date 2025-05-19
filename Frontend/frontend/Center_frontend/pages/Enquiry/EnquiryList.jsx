import React, { useEffect, useState } from "react";
import axios from "axios";
import { ReceiptText } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EnquiryList = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  // Fetch enquiries from backend
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1/enquiry")
      .then((response) => {
        const sortedEnquiries = response.data.sort(
          (a, b) => new Date(b.enquiryDate) - new Date(a.enquiryDate) // Sorting by latest
        );
        setEnquiries(sortedEnquiries);
      })
      .catch((error) => console.error("Error fetching enquiries:", error));
  }, []);

  // Open details below the clicked row
  const openDetails = (enquiry) => {
    // If the same enquiry is clicked, toggle the details (show/hide)
    if (selectedEnquiry && selectedEnquiry._id === enquiry._id) {
      setSelectedEnquiry(null);
    } else {
      setSelectedEnquiry(enquiry);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/enquiry/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // If successful, remove the deleted enquiry from state
        setEnquiries(enquiries.filter((enquiry) => enquiry._id !== id));
        toast.success("Enquiry deleted successfully!");
      } else {
        console.log('Error deleting enquiry');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#457B9D] px-8 py-4">
          <h1 className="text-2xl font-bold text-white">Student Enquiry List</h1>
        </div>

        {/* Table */}
        <div className="p-8 overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Email</th>
                <th className="border px-4 py-2 text-left">Phone</th>
                <th className="border px-4 py-2 text-left">DOB</th>
                <th className="border px-4 py-2 text-left">City</th>
                <th className="border px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enquiry) => (
                <React.Fragment key={enquiry._id}>
                  <tr className="hover:bg-gray-100">
                    <td className="border px-4 py-2">{enquiry.studentName}</td>
                    <td className="border px-4 py-2">{enquiry.email}</td>
                    <td className="border px-4 py-2">{enquiry.studentMobile}</td>
                    <td className="border px-4 py-2">{enquiry.dateOfBirth}</td>
                    <td className="border px-4 py-2">{enquiry.city}</td>
                    <td className="border px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => openDetails(enquiry)}
                        className="px-4 py-2  text-white rounded "
                      >
                        <ReceiptText className="text-[#457B9D]"/>
                      </button>
                      <button
                        onClick={() => handleDelete(enquiry._id)}
                        className="px-4 py-2 "
                      >
                        <Trash2 className="text-black"/>
                      </button>
                    </td>
                  </tr>

                  {/* Show Details below the row if the enquiry is selected */}
                  {selectedEnquiry && selectedEnquiry._id === enquiry._id && (
                    <tr className="bg-gray-50">
                      <td colSpan="6" className="p-4">
                        <div className="p-4 bg-white rounded-lg shadow-md">
                          <h3 className="text-lg font-semibold">Full Details</h3>
                          <p><strong>Name:</strong> {enquiry.studentName}</p>
                          <p><strong>Email:</strong> {enquiry.email}</p>
                          <p><strong>Phone:</strong> {enquiry.studentMobile}</p>
                          <p><strong>Date of Birth:</strong> {enquiry.dateOfBirth}</p>
                          <p><strong>Gender:</strong> {enquiry.gender}</p>
                          <p><strong>City:</strong> {enquiry.city}</p>
                          <p><strong>State:</strong> {enquiry.state}</p>
                          <p><strong>Permanent Address:</strong> {enquiry.permanentAddress}</p>
                          <p><strong>Enquiry Date:</strong> {enquiry.enquiryDate}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EnquiryList;
