import { useEffect, useState } from "react";
import { fetchMarathons } from "../api/marathons";
import type { RaceWithStatus } from "../lib/utils";
import {
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  Flag,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";

import ListStyle from "../components/list-style";
import RaceDetailDialog from "../components/race-dialog";

type Props = {
  onOpenList: (query: string, status?: "all" | "open" | "upcoming") => void;
};

function RaceSection({
  races,
  upcoming = false,
  onViewAll,
  loading,
  error,
  onSelectRace,
}: {
  races: RaceWithStatus[];
  upcoming?: boolean;
  onViewAll?: () => void;
  loading: boolean;
  error: boolean;
  onSelectRace: (race: RaceWithStatus) => void;
}) {
  const color = upcoming ? "blue" : "red";

  // 메인에서는 목록이 너무 길어지지 않도록 일부만 미리 보여주고,
  // 전체 데이터는 헤더의 "전체 보기"를 통해 목록 페이지에서 확인합니다.
  const previewRaces = races.slice(0, 10);

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
          className={`rounded-full px-3 py-1 font-anyvid text-xs text-white ${upcoming ? "bg-blue-600" : "bg-[#f1170f]"}`}
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
            className={`flex items-center justify-between border-b px-5 py-3 font-anyvid text-xs text-gray-500 ${upcoming ? "border-blue-100 bg-blue-600/4" : "border-gray-200 bg-[#f1170f]/[0.035]"}`}
          >
            <div className="flex items-center gap-2">
              {upcoming ? (
                <CalendarClock className="h-4 w-4 text-blue-600" />
              ) : (
                <CalendarCheck className="h-4 w-4 text-[#f1170f]" />
              )}
              {upcoming ? "접수 예정" : "현재 접수 중"}
              <strong className={upcoming ? "text-blue-600" : "text-[#f1170f]"}>
                {loading ? "-" : `${races.length}개`}
              </strong>
            </div>
            {onViewAll && (
              <button
                className={`flex cursor-pointer items-center gap-0.5 text-gray-500 transition-colors ${upcoming ? "hover:text-blue-600" : "hover:text-[#f1170f]"}`}
                onClick={onViewAll}
                type="button"
              >
                전체 보기
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
          <div
            className={`grid gap-px ${upcoming ? "bg-blue-100" : "bg-gray-200"}`}
          >
            {loading && (
              <p className="bg-white px-5 py-10 text-center font-anyvid text-sm text-gray-400">
                대회 정보를 불러오고 있어요.
              </p>
            )}
            {error && !loading && (
              <p className="bg-white px-5 py-10 text-center font-anyvid text-sm text-gray-400">
                대회 정보를 불러오지 못했어요.
              </p>
            )}
            {!loading &&
              !error &&
              previewRaces.map((race) => (
                <ListStyle
                  key={`${race.date}-${race.title}`}
                  race={race}
                  status={upcoming ? "upcoming" : "open"}
                  onClick={() => onSelectRace(race)}
                />
              ))}
            {!upcoming &&
              !loading &&
              !error &&
              races.length >= 10 &&
              onViewAll && (
                <button
                  className="flex cursor-pointer items-center justify-center gap-1 bg-white px-5 py-4 font-anyvid text-sm text-gray-500 transition-colors hover:text-[#f1170f]"
                  onClick={onViewAll}
                  type="button"
                >
                  접수중인 대회 더보기
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            {!loading && !error && previewRaces.length === 0 && (
              <p className="bg-white px-5 py-10 text-center font-anyvid text-sm text-gray-400">
                해당하는 대회가 없어요.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage({ onOpenList }: Props) {
  const [query, setQuery] = useState("");
  const [races, setRaces] = useState<RaceWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedRace, setSelectedRace] = useState<RaceWithStatus | null>(null);

  useEffect(() => {
    let active = true;

    // 메인 현황과 두 개의 미리보기 섹션이 같은 데이터를 공유하도록 API를
    // 호출합니다. API 모듈의 일일 캐시가 같은 날의 중복 네트워크 요청을 막습니다.
    void (async () => {
      try {
        const data = await fetchMarathons();
        if (active) setRaces(data);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // API에서 계산된 상태를 기준으로 메인에 필요한 목록을 한 번씩 분리합니다.
  // fetchMarathons에서 지난 대회는 이미 제외했으므로, 확인 가능한 대회에는
  // 접수마감 여부와 관계없이 오늘 이후에 개최되는 모든 대회를 포함합니다.
  const registrationRaces = races.filter((race) => race.status === "open");
  const upcomingRaces = races.filter((race) => race.status === "upcoming");
  const totalRaceCount = races.length;

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // 토요일에는 오늘부터, 일요일에는 어제부터, 평일에는 다가오는 토요일부터
  // 일요일까지를 "이번 주말" 범위로 계산합니다.
  const daysUntilSaturday = now.getDay() === 0 ? -1 : 6 - now.getDay();
  const weekendStart = new Date(now);
  weekendStart.setHours(0, 0, 0, 0);
  weekendStart.setDate(now.getDate() + daysUntilSaturday);
  const weekendEnd = new Date(weekendStart);
  weekendEnd.setDate(weekendStart.getDate() + 1);

  const thisMonthCount = races.filter((race) =>
    race.eventDate.startsWith(currentMonth),
  ).length;
  const thisWeekendCount = races.filter((race) => {
    const eventDate = new Date(`${race.eventDate}T00:00:00`);
    return eventDate >= weekendStart && eventDate <= weekendEnd;
  }).length;

  return (
    <main className="min-h-screen bg-white">
      <section className="hero-section relative isolate overflow-hidden">
        <div className="hero-background" aria-hidden="true">
          <span className="hero-blob hero-blob-pink" />
          <span className="hero-blob hero-blob-cream" />
          <span className="hero-glow" />
        </div>
        <div className="relative z-10 px-5 py-8">
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
              onOpenList(query, "all");
            }}
            role="search"
          >
            <label className="flex min-w-0 flex-1 items-center gap-2 font-anyvid text-sm text-gray-400">
              <Search className="h-4 w-4 shrink-0" />
              <span className="sr-only">대회명, 지역, 장소 검색</span>
              <input
                className="min-w-0 flex-1 bg-transparent text-base text-gray-900 outline-none sm:text-sm"
                onChange={(event) => setQuery(event.target.value)}
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
                  앞으로 남은 대회
                </p>
                <p className="mt-1 flex items-end gap-1">
                  <strong className="font-paperlogy-semibold text-[38px] leading-none text-gray-950">
                    {loading ? "-" : totalRaceCount}
                  </strong>
                  <span className="pb-0.5 font-anyvid text-sm text-gray-400">
                    개
                  </span>
                </p>
              </div>
              <button
                aria-label="접수중인 대회 목록 보기"
                className="rounded-[18px] bg-[#f0391f] p-4 text-left text-white transition-colors active:bg-[#d9341d]"
                onClick={() => onOpenList("", "open")}
                type="button"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/18">
                  <CalendarCheck className="h-4.5 w-4.5" />
                </span>
                <p className="mt-4 font-anyvid text-xs text-white/75">
                  접수중인 대회
                </p>
                <p className="mt-1 flex items-end gap-1">
                  <strong className="font-paperlogy-semibold text-[38px] leading-none">
                    {loading ? "-" : registrationRaces.length}
                  </strong>
                  <span className="pb-0.5 font-anyvid text-sm text-white/70">
                    개
                  </span>
                </p>
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 divide-x divide-gray-100 rounded-[18px] border border-gray-100 bg-white py-4">
              {[
                {
                  icon: <RotateCcw className="h-4 w-4 text-violet-500" />,
                  label: "접수 예정",
                  value: loading ? "-" : upcomingRaces.length,
                  bg: "bg-violet-50",
                },
                {
                  icon: <CalendarDays className="h-4 w-4 text-blue-500" />,
                  label: "이번 달",
                  value: loading ? "-" : thisMonthCount,
                  bg: "bg-blue-50",
                },
                {
                  icon: <Flag className="h-4 w-4 text-amber-500" />,
                  label: "이번 주말",
                  value: loading ? "-" : thisWeekendCount,
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
      <RaceSection
        error={error}
        loading={loading}
        onSelectRace={setSelectedRace}
        races={registrationRaces}
        onViewAll={() => onOpenList("", "open")}
      />
      <RaceSection
        error={error}
        loading={loading}
        onSelectRace={setSelectedRace}
        races={upcomingRaces}
        upcoming
        onViewAll={() => onOpenList("", "upcoming")}
      />
      <RaceDetailDialog
        race={selectedRace}
        onOpenChange={(open) => {
          if (!open) setSelectedRace(null);
        }}
      />
    </main>
  );
}
