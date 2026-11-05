import { ChevronLeft, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import ListStyle from "../components/list-style";
import type { RaceStatus, RaceWithStatus } from "../data/races";

const MARATHON_DATA_URL =
  "https://websszoa.github.io/runzoa.com/data/marathons/marathons_2026.json";

type ApiMarathon = {
  name: string;
  event: { startDate: string };
  registration: { startDate: string | null; status: string | null };
  location: { region: string | null; venue: string | null };
};

function getRaceStatus(marathon: ApiMarathon): RaceStatus {
  if (marathon.registration.status === "접수중") return "open";
  if (marathon.registration.status === "접수마감") return "closed";
  if (
    marathon.registration.startDate &&
    new Date(`${marathon.registration.startDate}T00:00:00`) > new Date()
  ) return "upcoming";
  return "unknown";
}

function toRace(marathon: ApiMarathon): RaceWithStatus {
  const eventDate = new Date(`${marathon.event.startDate}T00:00:00`);
  return {
    date: marathon.event.startDate.slice(5).replace("-", "."),
    day: `${new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(eventDate)}요일`,
    title: marathon.name,
    location: [marathon.location.region, marathon.location.venue].filter(Boolean).join(" · ") || "장소 미정",
    status: getRaceStatus(marathon),
  };
}

type Props = { initialQuery: string; onBack: () => void };

export default function MarathonListPage({ initialQuery, onBack }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<"all" | RaceStatus>("all");
  const [races, setRaces] = useState<RaceWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadRaces = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(MARATHON_DATA_URL, { signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as ApiMarathon[];
      setRaces(data.map(toRace));
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setError(true);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(MARATHON_DATA_URL, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as ApiMarathon[];
        setRaces(data.map(toRace));
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) return;
        setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);
  const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
  const filteredRaces = races.filter((race) => {
    const matchesStatus = filter === "all" || race.status === filter;
    const matchesText =
      !normalizedQuery ||
      `${race.title} ${race.location}`
        .toLocaleLowerCase("ko-KR")
        .includes(normalizedQuery);
    return matchesStatus && matchesText;
  });

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f4f7ff]">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <span className="absolute -right-28 -top-24 h-72 w-72 rounded-full bg-[#e8e7ff]" />
        <span className="absolute -left-36 top-90 h-80 w-80 rounded-full bg-[#e8f4ff]" />
        <span className="absolute -right-32 bottom-20 h-72 w-72 rounded-full bg-[#f0eaff]" />
      </div>

      <header className="flex h-14 items-center px-4">
        <button
          aria-label="메인으로 돌아가기"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-100 bg-white/80 text-gray-800 active:bg-blue-50"
          onClick={onBack}
          type="button"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      </header>

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
          className="mt-7 flex items-center rounded-full border-2 border-blue-500 bg-white py-1 pl-5 pr-1.5 focus-within:ring-2 focus-within:ring-blue-500/15"
          onSubmit={(event) => event.preventDefault()}
          role="search"
        >
          <label className="flex min-w-0 flex-1 items-center gap-2">
            <Search
              className="h-4 w-4 shrink-0 text-blue-500"
              aria-hidden="true"
            />
            <span className="sr-only">대회명, 지역, 장소 검색</span>
            <input
              className="min-w-0 flex-1 bg-transparent font-anyvid text-sm text-gray-900 outline-none placeholder:text-gray-400"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="대회명, 지역, 장소 검색"
              type="search"
              value={query}
            />
          </label>
          <button
            className="whitespace-nowrap rounded-full bg-blue-600 px-5 py-2 font-anyvid text-sm text-white active:bg-blue-700"
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
              { key: "closed", label: "접수마감" },
            ] as const
          ).map((item) => (
            <button
              aria-pressed={filter === item.key}
              className={`rounded-full border px-4 py-2 font-anyvid text-xs transition-colors ${filter === item.key ? "border-blue-600 bg-blue-600 text-white" : "border-blue-100 bg-white/80 text-gray-500"}`}
              key={item.key}
              onClick={() => setFilter(item.key)}
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
            {!loading && !error && filteredRaces.map((race) => (
              <ListStyle
                key={`${race.status}-${race.title}`}
                race={race}
                status={race.status}
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
    </main>
  );
}
