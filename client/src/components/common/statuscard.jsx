const StatCard = ({ icon, title, value, subtext }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
      
      <div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-extralight text-gray-900">{value}</span>
          <span className="text-xs font-light text-[#1e3a8a]">{subtext}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
