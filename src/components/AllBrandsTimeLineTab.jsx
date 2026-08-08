import React from "react";

const AllBrandsTimeLineTab = ({
  loadingLogs,
  brandLogs,
  getTimelineIconStyle,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-fade-in-up">
      {loadingLogs ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-8 h-8 border-4 border-[#1a365d] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm mt-3 font-bold">
            جاري تحميل السجل الزمني...
          </p>
        </div>
      ) : (
        <div className="relative border-r-2 border-slate-100 pr-6 space-y-8">
          {brandLogs.map((event, idx) => (
            <div key={idx} className="relative">
              <div
                className={`absolute -right-[31px] top-1 w-4 h-4 rounded-full border-[3px] bg-white ${getTimelineIconStyle(event.type)}`}
              ></div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-1">
                <h4 className="text-sm font-bold text-[#1a365d]">
                  {event.title}
                </h4>
                <div className="flex flex-col sm:items-end text-[11px] text-slate-400 font-medium">
                  <span>{event.date}</span>
                  <span>{event.time}</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-2">
                {event.desc}
              </p>
            </div>
          ))}
          {brandLogs.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">
              لا توجد أنشطة مسجلة لهذا البراند.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AllBrandsTimeLineTab;
