import React from "react";

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass = "",
  delay = 0,
}) => {
  return (
    <div
      style={{
        animationDelay: `${delay}ms`,
      }}
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-slate-200/80
        bg-white
        p-4
        shadow-sm
        transition-all
        duration-300
        ease-out
        hover:-translate-y-1
        hover:shadow-[0_12px_30px_rgba(15,39,72,0.10)]
        animate-stat-card
      "
    >
      {/* Subtle background glow */}
      <div
        className="
          pointer-events-none
          absolute
          -left-8
          -top-8
          h-24
          w-24
          rounded-full
          bg-slate-100/70
          blur-2xl
          transition-all
          duration-500
          group-hover:scale-150
          group-hover:opacity-80
        "
      />

      {/* Brand accent */}
      <div
        className="
          absolute
          right-0
          top-0
          h-full
          w-[3px]
          bg-[#0D2748]
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
        "
      />

      <div className="relative z-10">
        {/* Top */}
        <div className="flex items-start justify-between gap-3">
          <div
            className={`
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              transition-all
              duration-300
              group-hover:scale-105
              group-hover:-rotate-2
              ${iconClass}
            `}
          >
            <Icon
              size={20}
              strokeWidth={2.2}
              className="transition-transform duration-300 group-hover:scale-110"
            />
          </div>

          <div className="h-1.5 w-1.5 rounded-full bg-slate-200 transition-all duration-300 group-hover:bg-[#0D2748]" />
        </div>

        {/* Content */}
        <div className="mt-4">
          <p className="text-[11px] font-bold text-slate-400">{title}</p>

          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-[#102A43] transition-colors duration-300 group-hover:text-[#0D2748]">
              {typeof value === "number"
                ? value.toLocaleString("ar-EG")
                : value}
            </span>
          </div>

          <p className="mt-1.5 line-clamp-1 text-[10px] font-semibold text-slate-400">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Bottom progress-like accent */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden bg-slate-100">
        <div
          className="
            h-full
            w-0
            bg-[#0D2748]
            transition-all
            duration-500
            group-hover:w-full
          "
        />
      </div>
    </div>
  );
};

export default StatCard;
