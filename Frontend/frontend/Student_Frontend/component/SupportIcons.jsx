import {
  Headphones,
  MessageCircle,
  Hand,
  Wrench,
  Lightbulb,
  Laptop2,
} from "lucide-react";

const SupportVerticalIcons = () => {
  const supportItems = [
    { icon: <Headphones size={32} />, label: "Assistance" },
    { icon: <MessageCircle size={32} />, label: "Help" },
    { icon: <Hand size={32} />, label: "Advice" },
    { icon: <Wrench size={32} />, label: "Remote Maintenance" },
    { icon: <Lightbulb size={32} />, label: "Solution" },
    { icon: <Laptop2 size={32} />, label: "Technical Support" },
  ];

  return (
    <div className="w-full max-w-xs mx-auto  bg-whiterounded-lg">
      <h3 className="text-xl font-bold text-blue-900 mb-6 text-center">
        Support Services
      </h3>
      <div className="flex flex-col gap-6 items-center">
        {supportItems.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center text-blue-900 hover:scale-105 transition-transform"
          >
            <div className="mb-2">{item.icon}</div>
            <p className="text-sm font-medium">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupportVerticalIcons;
