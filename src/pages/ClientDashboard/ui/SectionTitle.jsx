const SectionTitle = ({ icon: Icon, title, subtitle, action }) => {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#12335B] flex items-center justify-center shrink-0">
          <Icon size={20} />
        </div>

        <div>
          <h2 className="text-lg md:text-xl font-black text-[#102A43]">
            {title}
          </h2>

          {subtitle && (
            <p className="text-xs md:text-sm text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
};

export default SectionTitle;
