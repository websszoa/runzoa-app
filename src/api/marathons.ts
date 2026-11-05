import {
  getRaceStatus,
  isDateBeforeToday,
  toLocalDateString,
  type RaceWithStatus,
} from "../lib/utils";

export const MARATHON_DATA_URLS = [
  "https://websszoa.github.io/runzoa.com/data/marathons/marathons_2026.json",
  "https://websszoa.github.io/runzoa.com/data/marathons/marathons_2027.json",
] as const;

// country 필드를 추가하며 캐시 구조가 바뀌어 버전을 올립니다.
// 버전을 올리지 않으면 country가 없는 옛 캐시가 한국 필터에 전부 걸려 0개로 보입니다.
const CACHE_KEY = "runzoa:marathons:v3";

type ApiMarathon = {
  name: string;
  info: { type: string | null };
  event: {
    startDate: string;
    endDate: string | null;
    startTime: string | null;
    site: string | null;
  };
  registration: {
    startDate: string | null;
    endDate: string | null;
    site: string | null;
    status: string | null;
    price: Record<string, number | null>;
  };
  location: {
    country: string | null;
    region: string | null;
    venue: string | null;
    address: string | null;
  };
};

// 원본 데이터에 국가가 "KR" 코드와 "한국" 문자열이 섞여 있어 둘 다 한국으로 인정합니다.
function isKoreanMarathon(marathon: ApiMarathon) {
  return (
    marathon.location.country === "KR" || marathon.location.country === "한국"
  );
}

type DailyCache = {
  date: string;
  data: ApiMarathon[];
};

let memoryCache: DailyCache | null = null;
let pendingRequest: Promise<ApiMarathon[]> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function parsePrices(value: unknown) {
  if (!isRecord(value)) return {};

  return Object.fromEntries(
    Object.entries(value).flatMap(([course, price]) =>
      typeof price === "number" || price === null ? [[course, price]] : [],
    ),
  );
}

/**
 * 외부 JSON을 그대로 신뢰하지 않고 화면에 필요한 필드만 안전하게 추립니다.
 * 대회명과 개최일이 없는 항목은 목록을 만들 수 없으므로 제외합니다.
 */
function parseMarathon(value: unknown): ApiMarathon | null {
  if (!isRecord(value) || typeof value.name !== "string") return null;

  const event = isRecord(value.event) ? value.event : null;
  if (!event || typeof event.startDate !== "string") return null;

  const info = isRecord(value.info) ? value.info : {};
  const registration = isRecord(value.registration) ? value.registration : {};
  const location = isRecord(value.location) ? value.location : {};

  return {
    name: value.name,
    info: { type: nullableString(info.type) },
    event: {
      startDate: event.startDate,
      endDate: nullableString(event.endDate),
      startTime: nullableString(event.startTime),
      site: nullableString(event.site),
    },
    registration: {
      startDate: nullableString(registration.startDate),
      endDate: nullableString(registration.endDate),
      site: nullableString(registration.site),
      status: nullableString(registration.status),
      price: parsePrices(registration.price),
    },
    location: {
      country: nullableString(location.country),
      region: nullableString(location.region),
      venue: nullableString(location.venue),
      address: nullableString(location.address),
    },
  };
}

function readDailyCache(today: string) {
  if (memoryCache?.date === today) return memoryCache.data;

  try {
    const saved = localStorage.getItem(CACHE_KEY);
    if (!saved) return null;

    const cache = JSON.parse(saved) as unknown;
    if (!isRecord(cache) || cache.date !== today || !Array.isArray(cache.data)) {
      return null;
    }

    const data = cache.data
      .map(parseMarathon)
      .filter((race): race is ApiMarathon => race !== null);
    memoryCache = { date: today, data };
    return data;
  } catch {
    return null;
  }
}

function writeDailyCache(cache: DailyCache) {
  memoryCache = cache;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // 저장 공간이 없거나 비활성화된 환경에서도 메모리 캐시는 계속 사용합니다.
  }
}

async function fetchDataFile(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);

  const value = (await response.json()) as unknown;
  if (!Array.isArray(value)) throw new Error(`${url}: 올바르지 않은 JSON 형식`);

  return value
    .map(parseMarathon)
    .filter((race): race is ApiMarathon => race !== null);
}

async function loadMarathonData(today: string) {
  const cached = readDailyCache(today);
  if (cached) return cached;
  if (pendingRequest) return pendingRequest;

  // 한 파일이 일시적으로 실패해도 다른 연도의 정상 데이터는 사용할 수 있습니다.
  pendingRequest = Promise.allSettled(MARATHON_DATA_URLS.map(fetchDataFile))
    .then((results) => {
      const successful = results.flatMap((result) =>
        result.status === "fulfilled" ? result.value : [],
      );
      if (successful.length === 0) {
        throw new Error("마라톤 데이터를 불러오지 못했습니다.");
      }

      // 연도 파일 사이에 동일 대회가 들어가도 한 번만 노출합니다.
      const unique = Array.from(
        new Map(
          successful.map((race) => [
            `${race.event.startDate}:${race.name}`,
            race,
          ]),
        ).values(),
      );
      writeDailyCache({ date: today, data: unique });
      return unique;
    })
    .finally(() => {
      pendingRequest = null;
    });

  return pendingRequest;
}

function toRace(marathon: ApiMarathon): RaceWithStatus {
  const eventDate = new Date(`${marathon.event.startDate}T00:00:00`);

  return {
    eventDate: marathon.event.startDate,
    date: marathon.event.startDate.slice(5).replace("-", "."),
    day: `${new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(eventDate)}요일`,
    title: marathon.name,
    location:
      [marathon.location.region, marathon.location.venue]
        .filter(Boolean)
        .join(" · ") || "장소 미정",
    status: getRaceStatus({
      status: marathon.registration.status,
      startDate: marathon.registration.startDate,
      endDate: marathon.registration.endDate,
      eventDate: marathon.event.startDate,
    }),
    details: {
      type: marathon.info.type,
      eventEndDate: marathon.event.endDate,
      eventTime: marathon.event.startTime,
      eventSite: marathon.event.site,
      registrationStartDate: marathon.registration.startDate,
      registrationEndDate: marathon.registration.endDate,
      registrationSite: marathon.registration.site,
      address: marathon.location.address,
      prices: marathon.registration.price,
    },
  };
}

/**
 * 2026·2027 데이터를 합쳐 반환합니다.
 * 원본 JSON은 로컬 날짜 기준 하루에 한 번만 갱신하고 같은 날에는 캐시를 씁니다.
 */
export async function fetchMarathons() {
  const today = new Date();
  const todayString = toLocalDateString(today);
  const data = await loadMarathonData(todayString);

  return data
    .filter(isKoreanMarathon)
    .filter((marathon) => !isDateBeforeToday(marathon.event.startDate, today))
    .map(toRace)
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
}
