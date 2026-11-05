import {
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Flag,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import ListStyle from "../components/list-style";
import { registrationRaces, upcomingRaces, type Race } from "../data/races";

type Props = { onOpenList: (query: string) => void };

function RaceSection({
  races,
  upcoming = false,
}: {
  races: Race[];
  upcoming?: boolean;
}) {
  const color = upcoming ? "blue" : "red";
  return (
    <section
      aria-labelledby={`${color}-registration-title`}
      className={
        upcoming
          ? "bg-[linear-gradient(180deg,#f2f7ff_0%,#f8fbff_48%,#ffffff_100%)]"
          : "bg-[linear-gradient(180deg,#fff8f5_0%,#fffdfb_48%,#ffffff_100%)]"
      }
    >
      <div className="px-5 py-16">
        <span
          className={`rounded-full px-3 py-1 font-anyvid text-[14px] text-white ${upcoming ? "bg-blue-600" : "bg-[#f1170f]"}`}
        >
          {upcoming ? "접수예정" : "접수중"}
        </span>
        <h2
          id={`${color}-registration-title`}
          className="mt-2 font-paperlogy-semibold text-3xl leading-tight tracking-tight text-gray-950"
        >
          {upcoming ? "곧 접수 예정인" : "지금 접수 중인"}
          <br />
          대회를 확인하세요!
        </h2>

        <div
          className={`mt-6 overflow-hidden rounded-2xl border bg-white ${upcoming ? "border-blue-100" : "border-gray-200"}`}
        >
          <div
            className={`flex items-center gap-2 border-b px-5 py-3 font-anyvid text-xs text-gray-500 ${upcoming ? "border-blue-100 bg-blue-600/4" : "border-gray-200 bg-[#f1170f]/[0.035]"}`}
          >
            {upcoming ? (
              <CalendarClock className="h-4 w-4 text-blue-600" />
            ) : (
              <CalendarCheck className="h-4 w-4 text-[#f1170f]" />
            )}
            {upcoming ? "접수 예정" : "현재 접수 중"}
            <strong className={upcoming ? "text-blue-600" : "text-[#f1170f]"}>
              {races.length}개
            </strong>
          </div>
          <div
            className={`grid gap-px ${upcoming ? "bg-blue-100" : "bg-gray-200"}`}
          >
            {races.map((race) => (
              <ListStyle
                key={`${race.date}-${race.title}`}
                race={race}
                status={upcoming ? "upcoming" : "open"}
                variant="home"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage({ onOpenList }: Props) {
  const [query, setQuery] = useState("");
  const totalRaceCount = registrationRaces.length + upcomingRaces.length;

  return (
    <main className="min-h-screen bg-white">
      <section className="hero-section relative isolate overflow-hidden">
        <div className="hero-background" aria-hidden="true">
          <span className="hero-blob hero-blob-pink" />
          <span className="hero-blob hero-blob-cream" />
          <span className="hero-glow" />
        </div>
        <div className="relative z-10 px-5 py-16">
          <div className="font-nanum-square-neo inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-xs text-gray-600">
            <Sparkles className="h-3.5 w-3.5 text-[#f0391f]" />
            마라톤 여정을 위한 완벽한 가이드 | 런조아
          </div>
          <h1 className="mt-4 font-paperlogy-semibold text-4xl leading-[1.2] text-gray-900">
            달리고 싶은 대회를
            <br />
            가장 빠르게 찾아보세요!
          </h1>
          <p className="mt-4 font-anyvid text-sm leading-relaxed text-gray-500">
            전국 마라톤 대회 일정과 접수 정보를 한눈에!
            <br />
            접수 시작일부터 대회일까지, 중요한 일정을 놓치지 마세요.
          </p>

          <form
            className="mt-6 flex items-center rounded-full border-2 border-[#f0391f] bg-white py-1 pl-5 pr-1.5 focus-within:ring-2 focus-within:ring-[#f0391f]/15"
            onSubmit={(event) => {
              event.preventDefault();
              onOpenList(query);
            }}
            role="search"
          >
            <label className="flex min-w-0 flex-1 items-center gap-2 font-anyvid text-sm text-gray-400">
              <Search className="h-4 w-4 shrink-0" />
              <span className="sr-only">대회명, 지역, 장소 검색</span>
              <input
                className="min-w-0 flex-1 bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="대회명, 지역, 장소 검색"
                type="search"
                value={query}
              />
            </label>
            <button
              className="whitespace-nowrap rounded-full bg-[#f0391f] px-5 py-2 font-anyvid text-sm font-semibold text-white"
              type="submit"
            >
              검색
            </button>
          </form>

          <div className="mt-5 rounded-[24px] border border-gray-200/80 bg-white/95 p-4">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="font-paperlogy-semibold text-base text-gray-900">
                대회 현황
              </h2>
              <span className="flex items-center gap-1.5 font-anyvid text-[11px] text-gray-400">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f0391f]" />
                오늘 기준
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[18px] bg-gray-50 p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-600">
                  <Flag className="h-4.5 w-4.5" />
                </span>
                <p className="mt-4 font-anyvid text-xs text-gray-500">
                  확인 가능한 대회
                </p>
                <p className="mt-1 flex items-end gap-1">
                  <strong className="font-paperlogy-semibold text-[38px] leading-none text-gray-950">
                    {totalRaceCount}
                  </strong>
                  <span className="pb-0.5 font-anyvid text-sm text-gray-400">
                    개
                  </span>
                </p>
              </div>
              <div className="rounded-[18px] bg-[#f0391f] p-4 text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/18">
                  <CalendarCheck className="h-4.5 w-4.5" />
                </span>
                <p className="mt-4 font-anyvid text-xs text-white/75">
                  지금 접수 중
                </p>
                <p className="mt-1 flex items-end gap-1">
                  <strong className="font-paperlogy-semibold text-[38px] leading-none">
                    {registrationRaces.length}
                  </strong>
                  <span className="pb-0.5 font-anyvid text-sm text-white/70">
                    개
                  </span>
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 divide-x divide-gray-100 rounded-[18px] border border-gray-100 bg-white py-4">
              {[
                {
                  icon: <RotateCcw className="h-4 w-4 text-violet-500" />,
                  label: "접수 예정",
                  value: upcomingRaces.length,
                  bg: "bg-violet-50",
                },
                {
                  icon: <CalendarDays className="h-4 w-4 text-blue-500" />,
                  label: "이번 달",
                  value: registrationRaces.filter((race) =>
                    race.date.startsWith("11."),
                  ).length,
                  bg: "bg-blue-50",
                },
                {
                  icon: <Flag className="h-4 w-4 text-amber-500" />,
                  label: "이번 주말",
                  value: registrationRaces.length,
                  bg: "bg-amber-50",
                },
              ].map((item) => (
                <div
                  className="flex flex-col items-center px-2 text-center"
                  key={item.label}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${item.bg}`}
                  >
                    {item.icon}
                  </span>
                  <p className="mt-2 font-anyvid text-[11px] text-gray-400">
                    {item.label}
                  </p>
                  <p className="mt-2 font-paperlogy-semibold text-lg leading-none text-gray-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <RaceSection races={registrationRaces} />
      <RaceSection races={upcomingRaces} upcoming />
    </main>
  );
}
