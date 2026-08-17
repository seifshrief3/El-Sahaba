import { formatNumber } from "../utils";

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass = "bg-blue-50 text-blue-600",
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-xs md:text-sm font-bold text-slate-500">{title}</p>
        <div
          className={`w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}
        >
          <Icon size={22} />
        </div>
      </div>
      <div>
        <div className="text-2xl md:text-3xl font-black text-[#102A43]">
          {formatNumber(value)}
        </div>

        {subtitle && (
          <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
