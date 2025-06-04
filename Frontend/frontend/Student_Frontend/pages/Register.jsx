import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config";

const courses = ["BCA", "MBA", "B.Tech", "M.Tech", "B.Sc"];

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    course: "",
    fees: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/students/register`, formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("student", JSON.stringify(res.data.student));
      alert("Registration Successful");
      navigate("/");
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="p-6 shadow-lg rounded-lg bg-white w-96">
        <h2 className="text-2xl font-bold mb-4">Register</h2>

        <input type="text" name="name" placeholder="Name" onChange={handleChange} className="w-full p-2 border mb-2" />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border mb-2" />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full p-2 border mb-2" />

        {/* Course Dropdown */}
        <select name="course" onChange={handleChange} className="w-full p-2 border mb-2">
          <option value="">Select Course</option>
          {courses.map((course, index) => (
            <option key={index} value={course}>{course}</option>
          ))}
        </select>

        <input type="number" name="fees" placeholder="Fees" onChange={handleChange} className="w-full p-2 border mb-2" />
        <button type="submit" className="bg-blue-500 text-white p-2 w-full rounded">Register</button>
      </form>
    </div>
  );
};

export default Register;
