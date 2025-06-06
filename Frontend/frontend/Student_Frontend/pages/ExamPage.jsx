import { useEffect, useState } from "react";
import {
    Calendar,
    Clock,
    FileText,
    Award,
    CheckCircle,
    Users,
    Hash,
    Trophy,
    Activity,
    BookOpen
} from "lucide-react";
import API_BASE_URL from "../../config";

const ExamDetails = () => {
    const [exams, setExams] = useState([]);
    const [error, setError] = useState("");

    // Note: Using React state instead of localStorage for Claude.ai compatibility
    // const [student] = useState({ courseCode: "CS101" }); // Replace with your localStorage logic
      const storedStudent = localStorage.getItem("student");
  const parsedStudent = storedStudent ? JSON.parse(storedStudent) : null;

  const courseCode = parsedStudent?.courseCode;
    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/exams/by-course/${courseCode}`);
                const data = await res.json();

                if (res.ok) {
                    setExams(data.exams);
                } else {
                    setError(data.message || "Failed to fetch exams");
                }
            } catch (err) {
                setError("Server error");
            }
        };

        if (courseCode) fetchExams();
    }, [courseCode]);

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return <Activity className="w-4 h-4 text-green-800" />;
            case 'scheduled':
                return <Calendar className="w-4 h-4 text-blue-900" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-blue-900" />;
            default:
                return <Clock className="w-4 h-4 text-yellow-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'text-green-400 border-blue-900';
            case 'scheduled':
                return 'text-blue-900 bg-blue-900/20';
            case 'completed':
                return 'text-blue-900 bg-blue-900/20';
            default:
                return 'text-yellow-400 bg-yellow-900/20';
        }
    };

    return (
        <div className="min-h-screen  p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-blue-900 mb-2 flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-blue-900" />
                        Exams for {courseCode}
                    </h1>
                    <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"></div>
                </div>

                {error && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                        <p className="text-red-400 flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            {error}
                        </p>
                    </div>
                )}

                {exams.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-blue-900 text-lg">No exams found for this course.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {exams.map((exam) => (
                            <div
                                key={exam.ExamID}
                                className=" border border-blue-900 rounded-xl p-6 hover:border-blue-900 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Hash className="w-5 h-5 text-blue-900" />
                                        <h3 className="text-xl font-semibold text-white">
                                            Exam ID: {exam.ExamID}
                                        </h3>
                                    </div>

                                    <span className={`px-3 py-1 rounded-full border-blue-900 border-1 text-sm font-medium flex items-center gap-2 ${getStatusColor(exam.status)}`}>
                                        {getStatusIcon(exam.status)}
                                        {exam.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-3 text-gray-300">
                                        <Users className="w-4 h-4 text-blue-900" />
                                        <div>
                                            <p className="text-sm text-blue-900">Batch</p>
                                            <p className="font-medium text-blue-900">{exam.batch.name}</p>
                                            {/* <p className="text-xs text-blue-900">{exam.batch.timings}</p>    */}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-gray-300">
                                        <Calendar className="w-4 h-4 text-blue-900" />
                                        <div>
                                            <p className="text-sm text-blue-900">Exam Date</p>
                                            <p className="font-medium text-blue-900">{exam.examDate}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-gray-300">
                                        <Clock className="w-4 h-4 text-blue-900" />
                                        <div>
                                            <p className="text-sm text-blue-900">Duration</p>
                                            <p className="font-medium">{exam.examDurationMinutes} mins</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-gray-300">
                                        <FileText className="w-4 h-4 text-blue-900" />
                                        <div>
                                            <p className="text-sm text-blue-900">Questions</p>
                                            <p className="font-medium text-blue-900">{exam.totalQuestions}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-gray-300">
                                        <Trophy className="w-4 h-4 text-blue-900" />
                                        <div>
                                            <p className="text-sm text-blue-900">Total Marks</p>
                                            <p className="font-medium text-blue-900">{exam.totalMarks}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-gray-300">
                                        <Award className="w-4 h-4 text-blue-900" />
                                        <div>
                                            <p className="text-sm text-blue-900">Passing Marks</p>
                                            <p className="font-medium text-blue-900">{exam.passingMarks}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <CheckCircle className="w-4 h-4 text-blue-900" />
                                            <span className="text-sm text-blue-900">Mode: <span className="font-medium text-blue-900">{exam.examMode}</span></span>
                                        </div>

                                        {exam.questions?.length > 0 && (
                                            <div className="text-sm text-blue-900">
                                                <span className="font-medium  text-blue-900">{exam.questions.length}</span> questions assigned
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamDetails;
