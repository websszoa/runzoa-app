import { MapPin } from "lucide-react";
import type { Race, RaceStatus } from "../data/races";

type ListStyleProps = {
  race: Race;
  status: RaceStatus;
  variant?: "home" | "list";
};

export default function ListStyle({
  race,
  status,
  variant = "list",
}: ListStyleProps) {
  const isHome = variant === "home";
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
      className={`flex min-w-0 items-center gap-4 bg-white ${isHome ? "min-h-20 px-4 py-3.5" : "px-4 py-4"}`}
    >
      <div
        className={`${isHome ? "w-18.5 pr-4" : "w-15.5 pr-3"} shrink-0 border-r border-gray-100 text-center`}
      >
        <p
          className={`font-paperlogy-semibold text-lg tabular-nums ${statusStyle.text}`}
        >
          {race.date}
        </p>
        <p
          className={`${isHome ? "" : "mt-0.5"} font-anyvid text-[11px] text-gray-400`}
        >
          {race.day}
        </p>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`shrink-0 rounded-full font-anyvid text-white ${isHome ? "px-2 py-0 text-xs" : "px-2 py-0.5 text-[10px]"} ${statusStyle.badge}`}
          >
            {statusStyle.label}
          </span>
          <h3 className="min-w-0 truncate font-paperlogy-semibold text-gray-950 text-base">
            {race.title}
          </h3>
        </div>
        <p
          className={`${isHome ? "mt-1" : "mt-2"} flex min-w-0 items-center gap-1.5 font-anyvid text-xs text-gray-500`}
        >
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
