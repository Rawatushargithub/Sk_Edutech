import { BookOpen, FileText, Calendar, DollarSign } from "lucide-react";

const QuickActions = ({ setTab }) => {
  const actions = [
    { 
      name: "My Courses", 
      tab: "CourseDetails", 
      icon: <BookOpen size={22} className="text-gray-700" />
    },
    { 
      name: "Notes", 
      tab: "Notes", 
      icon: <FileText size={22} className="text-gray-700" />
    },
    { 
      name: "Attendance", 
      tab: "Attendance", 
      icon: <Calendar size={22} className="text-gray-700" />
    },
    { 
      name: "Fees", 
      tab: "Fees", 
      icon: <DollarSign size={22} className="text-gray-700" />
    },
  ];

  return (
    <div className="m-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <div
            key={action.name}
            className="flex flex-col items-center justify-center p-5 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300"
            onClick={() => setTab(action.tab)}
          >
            <div className="bg-gray-100 p-3 rounded-full mb-3">
              {action.icon}
            </div>
            <span className="font-medium text-gray-700">{action.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;