import { MapPin } from "lucide-react";
import type { Race, RaceStatus } from "../lib/utils";

type ListStyleProps = {
  race: Race;
  status: RaceStatus;
  onClick?: () => void;
};

export default function ListStyle({ race, status, onClick }: ListStyleProps) {
  const statusStyle = {
    open: {
      label: "접수중",
      text: "text-[#f1170f]",
      badge: "bg-[#f1170f]",
      pin: "text-rose-500",
    },
    upcoming: {
      label: "접수예정",
      text: "text-blue-600",
      badge: "bg-blue-600",
      pin: "text-blue-500",
    },
    closed: {
      label: "접수마감",
      text: "text-gray-500",
      badge: "bg-gray-500",
      pin: "text-gray-400",
    },
    unknown: {
      label: "접수미정",
      text: "text-violet-600",
      badge: "bg-violet-500",
      pin: "text-violet-400",
    },
  }[status];

  return (
    <article
      className={`flex min-w-0 items-center gap-4 bg-white px-4 py-4 ${onClick ? "cursor-pointer transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-500" : ""}`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        onClick();
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="w-15.5 shrink-0 border-r border-gray-100 pr-3 text-center">
        <p
          className={`font-paperlogy-semibold text-[16px] ${statusStyle.text}`}
        >
          {race.date}
        </p>
        <p className="mt-0.5 font-anyvid text-[11px] text-gray-400">
          {race.day}
        </p>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 font-anyvid text-xs text-white ${statusStyle.badge}`}
          >
            {statusStyle.label}
          </span>
          <h3 className="min-w-0 truncate font-paperlogy-semibold text-gray-950 text-base">
            {race.title}
          </h3>
        </div>
        <p className="mt-2 flex min-w-0 items-center gap-1.5 font-anyvid text-xs text-gray-500">
          <MapPin
            className={`h-3.5 w-3.5 shrink-0 ${statusStyle.pin}`}
            aria-hidden="true"
          />
          <span className="truncate">{race.location}</span>
        </p>
      </div>
    </article>
  );
}
