import React, { useEffect, useState } from "react";
import axios from "axios";
import { Star } from "lucide-react"; 
import API_BASE_URL from "../../config";

const StudentRating = () => {
  const [ratingData, setRatingData] = useState(null);

  useEffect(() => {
    const storedStudent = localStorage.getItem("student");
    if (!storedStudent) return;

    const student = JSON.parse(storedStudent);
    const courseCode = student?.courseCode;
    const rollNumber = student?.rollNumber;
    const franchiseId = student?.franchiseId;

    if (courseCode && franchiseId && rollNumber) {
      axios
        .get(`${API_BASE_URL}/api/v1/student/exams/rating`, {
          params: { courseCode, franchiseId, rollNumber },
        })
        .then((res) => {
          const { obtainedMarks, totalMarks } = res.data;

          if (totalMarks > 0) {
            const percentage = (obtainedMarks / totalMarks) * 100;
            const rating = Math.round(percentage / 20); // 0–5 stars
            setRatingData({
              percentage: percentage.toFixed(2),
              rating,
            });
          } else {
            setRatingData({
              percentage: 0,
              rating: 0,
            });
          }
        })
        .catch((err) => console.error(err));
    }
  }, []);

  if (!ratingData) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center">
      {/* <h2 className="text-xl font-semibold mb-3">Your Performance</h2> */}
      <div className="flex space-x-2 ">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-8 h-8 ${
              i < ratingData.rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <p className="text-gray-600 font-medium">
       Your Progress So Far: {ratingData.percentage}%
      </p>
    </div>
  );
};

export default StudentRating;
