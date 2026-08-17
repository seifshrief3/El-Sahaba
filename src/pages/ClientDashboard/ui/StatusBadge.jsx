import { CircleDot } from "lucide-react";
import { getStatusLabel, getStatusStyle } from "../utils";

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold whitespace-nowrap ${getStatusStyle(
        status,
      )}`}
    >
      <CircleDot size={10} />
      {getStatusLabel(status)}
    </span>
  );
};

export default StatusBadge;
