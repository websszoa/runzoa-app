import { Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchMarathons } from "../api/marathons";
import ListStyle from "../components/list-style";
import RaceDetailDialog from "../components/race-dialog";
import { matchesRaceQuery, type RaceWithStatus } from "../lib/utils";

type ListFilter = "all" | "open" | "upcoming";

type Props = {
  initialQuery: string;
  initialStatus: ListFilter;
};

export default function MarathonListPage({
  initialQuery,
  initialStatus,
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<ListFilter>(initialStatus);
  const [races, setRaces] = useState<RaceWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedRace, setSelectedRace] = useState<RaceWithStatus | null>(null);
  const isOpenFilter = filter === "open";
  const isUpcomingFilter = filter === "upcoming";

  // 필터를 바꾸면 주소창의 status 값도 함께 바꿔서, 접수중/접수예정 화면을
  // 각각 별도의 주소로 복사·공유할 수 있게 합니다.
  const applyFilter = (next: ListFilter) => {
    setFilter(next);

    const params = new URLSearchParams(window.location.search);
    if (next === "all") {
      params.delete("status");
    } else {
      params.set("status", next);
    }
    const search = params.toString();
    window.history.replaceState(
      {},
      "",
      `/marathons${search ? `?${search}` : ""}`,
    );
  };

  const loadRaces = async () => {
    setLoading(true);
    setError(false);
    try {
      setRaces(await fetchMarathons());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
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
  const filteredRaces = races.filter((race) => {
    // API 단계에서 개최일이 지난 대회는 이미 제외됩니다. "전체"에서는
    // 아직 개최일이 남아 있다면 접수마감 상태도 함께 보여줍니다.
    const matchesStatus = filter === "all" || race.status === filter;
    const matchesText = matchesRaceQuery(race, query);
    return matchesStatus && matchesText;
  });

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f4f7ff] py-4">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <span className="absolute -right-28 -top-24 h-72 w-72 rounded-full bg-[#e8e7ff]" />
        <span className="absolute -left-36 top-90 h-80 w-80 rounded-full bg-[#e8f4ff]" />
        <span className="absolute -right-32 bottom-20 h-72 w-72 rounded-full bg-[#f0eaff]" />
      </div>

      <section className="px-5 pb-12 pt-5">
        <div className="font-nanum-square-neo inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-xs text-gray-600">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
          원하는 마라톤 대회를 한눈에 찾아보세요 | 런조아
        </div>
        <h1 className="mt-3 font-paperlogy-semibold text-[36px] leading-[1.18] tracking-[-0.04em] text-gray-950">
          달리고 싶은 대회를
          <br />
          찾아보세요!
        </h1>
        <p className="mt-4 font-anyvid text-sm leading-6 text-gray-500">
          접수 상태와 지역, 대회명을 기준으로 빠르게 확인할 수 있어요.
        </p>

        <form
          className={`mt-7 flex items-center rounded-full border-2 bg-white py-1 pl-5 pr-1.5 focus-within:ring-2 ${isOpenFilter ? "border-[#f1170f] focus-within:ring-[#f1170f]/15" : isUpcomingFilter ? "border-blue-500 focus-within:ring-blue-500/15" : "border-violet-500 focus-within:ring-violet-500/15"}`}
          onSubmit={(event) => event.preventDefault()}
          role="search"
        >
          <label className="flex min-w-0 flex-1 items-center gap-2">
            <Search
              className={`h-4 w-4 shrink-0 ${isOpenFilter ? "text-[#f1170f]" : isUpcomingFilter ? "text-blue-500" : "text-violet-500"}`}
              aria-hidden="true"
            />
            <span className="sr-only">대회명, 지역, 장소 검색</span>
            <input
              className="min-w-0 flex-1 bg-transparent font-anyvid text-base text-gray-900 outline-none sm:text-sm"
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              value={query}
            />
          </label>
          <button
            className={`whitespace-nowrap rounded-full px-5 py-2 font-anyvid text-sm text-white transition-colors ${isOpenFilter ? "bg-[#f1170f] active:bg-[#d9341d]" : isUpcomingFilter ? "bg-blue-600 active:bg-blue-700" : "bg-violet-600 active:bg-violet-700"}`}
            type="submit"
          >
            검색
          </button>
        </form>

        <div
          className="mt-5 flex gap-2"
          role="group"
          aria-label="접수 상태 필터"
        >
          {(
            [
              { key: "all", label: "전체" },
              { key: "open", label: "접수중" },
              { key: "upcoming", label: "접수예정" },
            ] as const
          ).map((item) => (
            <button
              aria-pressed={filter === item.key}
              className={`cursor-pointer rounded-full border px-4 py-2 font-anyvid text-xs transition-colors ${filter === item.key ? (item.key === "open" ? "border-[#f1170f] bg-[#f1170f] text-white" : item.key === "upcoming" ? "border-blue-600 bg-blue-600 text-white" : "border-violet-600 bg-violet-600 text-white") : "border-gray-200 bg-white/80 text-gray-500"}`}
              key={item.key}
              onClick={() => applyFilter(item.key)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between px-1">
          <h2 className="font-paperlogy-semibold text-lg text-gray-950">
            대회 리스트
          </h2>
          <span className="font-anyvid text-xs text-gray-500">
            {filteredRaces.length}개
          </span>
        </div>

        <div className="mt-3 overflow-hidden rounded-[22px] border border-blue-100 bg-white/90">
          <div className="divide-y divide-blue-50">
            {loading && (
              <div className="px-5 py-14 text-center">
                <span className="mx-auto block h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                <p className="mt-3 font-anyvid text-sm text-gray-500">
                  대회 정보를 불러오고 있어요.
                </p>
              </div>
            )}
            {error && !loading && (
              <div className="px-5 py-14 text-center">
                <p className="font-anyvid text-sm text-gray-500">
                  대회 정보를 불러오지 못했어요.
                </p>
                <button
                  className="mt-4 rounded-full bg-blue-600 px-4 py-2 font-anyvid text-xs text-white"
                  onClick={() => void loadRaces()}
                  type="button"
                >
                  다시 시도
                </button>
              </div>
            )}
            {!loading &&
              !error &&
              filteredRaces.map((race) => (
                <ListStyle
                  key={`${race.status}-${race.title}`}
                  race={race}
                  status={race.status}
                  onClick={() => setSelectedRace(race)}
                />
              ))}
            {!loading && !error && filteredRaces.length === 0 && (
              <div className="px-5 py-14 text-center">
                <Search className="mx-auto h-6 w-6 text-blue-300" />
                <p className="mt-3 font-anyvid text-sm text-gray-500">
                  조건에 맞는 대회가 없어요.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      <RaceDetailDialog
        race={selectedRace}
        onOpenChange={(open) => {
          if (!open) setSelectedRace(null);
        }}
      />
    </main>
  );
}
