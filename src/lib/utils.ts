export { cn } from "cn";

/** 목록 카드와 메인 미리보기에서 공통으로 사용하는 대회 정보입니다. */
export type Race = {
  date: string;
  day: string;
  title: string;
  location: string;
};

/** API의 한글 접수 상태를 화면 내부에서 다루기 위한 상태 값입니다. */
export type RaceStatus = "open" | "upcoming" | "closed" | "unknown";

/** API에서 변환된 대회 정보에 원본 개최일과 계산된 접수 상태를 더합니다. */
export type RaceWithStatus = Race & {
  // 연도가 포함된 YYYY-MM-DD 값으로 월간·주말 통계를 계산할 때 사용합니다.
  eventDate: string;
  status: RaceStatus;
  details: {
    type: string | null;
    eventEndDate: string | null;
    eventTime: string | null;
    eventSite: string | null;
    registrationStartDate: string | null;
    registrationEndDate: string | null;
    registrationSite: string | null;
    address: string | null;
    prices: Record<string, number | null>;
  };
};

const raceStatusLabel: Record<RaceStatus, string> = {
  open: "접수중",
  upcoming: "접수예정",
  closed: "접수마감",
  unknown: "접수미정",
};

/** 대회명, 장소, 유형, 날짜와 접수 상태를 한 번에 검색합니다. */
export function matchesRaceQuery(race: RaceWithStatus, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
  if (!normalizedQuery) return true;

  const searchableText = [
    race.title,
    race.location,
    race.eventDate,
    race.date,
    race.details.type,
    raceStatusLabel[race.status],
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("ko-KR");

  return searchableText.includes(normalizedQuery);
}

/** 접수 상태를 날짜로 계산할 때 필요한 API 필드만 모은 입력 타입입니다. */
type RaceStatusInput = {
  status: string | null;
  startDate: string | null;
  endDate: string | null;
  eventDate: string;
};

export function toLocalDateString(date: Date) {
  // toISOString()은 UTC 날짜를 반환하므로 한국 시간 자정 부근에서 날짜가
  // 하루 어긋날 수 있습니다. 사용자의 로컬 날짜를 직접 조합해 비교합니다.
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * YYYY-MM-DD 형식의 날짜가 오늘보다 이전인지 확인합니다.
 * 오늘 열리는 대회는 지난 대회가 아니므로 목록에 포함됩니다.
 */
export function isDateBeforeToday(date: string, today = new Date()) {
  return date < toLocalDateString(today);
}

/**
 * API의 접수 상태와 날짜를 화면에서 사용하는 상태 값으로 변환합니다.
 *
 * 1. 관리자가 status를 지정했다면 날짜보다 그 값을 우선합니다.
 * 2. status가 null이면 접수 종료일을 기준으로 마감 여부를 확인합니다.
 *    빈 문자열이나 공백만 있는 값도 null과 동일하게 취급합니다.
 * 3. 접수 종료일이 없으면 대회 개최일을 임시 종료일로 사용합니다.
 * 4. 아직 접수 시작일 전이면 접수예정, 접수 기간이면 접수중입니다.
 */
export function getRaceStatus(
  { status, startDate, endDate, eventDate }: RaceStatusInput,
  today = new Date(),
): RaceStatus {
  // API에 명시된 상태는 날짜 계산 결과보다 항상 우선합니다.
  if (status === "접수중") return "open";
  if (status === "접수예정") return "upcoming";
  if (status === "접수마감") return "closed";
  if (status === "접수미정") return "unknown";

  // null, 빈 문자열, 공백 문자열은 모두 상태가 지정되지 않은 것으로 보고
  // 아래의 접수 시작일·종료일 계산으로 넘깁니다.
  const hasNoStatus = status === null || status.trim() === "";

  // 값이 있지만 지원하지 않는 상태 문자열은 임의로 해석하지 않습니다.
  if (!hasNoStatus) return "unknown";

  const todayString = toLocalDateString(today);

  // 접수 종료일이 누락된 대회는 개최일까지 접수 가능한 것으로 간주합니다.
  const effectiveEndDate = endDate ?? eventDate;

  // 종료일 당일은 아직 접수 기간에 포함하고, 다음 날부터 마감 처리합니다.
  if (effectiveEndDate < todayString) return "closed";

  // 시작일이 미래라면 아직 접수가 열리지 않은 상태입니다.
  if (startDate && startDate > todayString) return "upcoming";

  // 종료 기준이 지나지 않았고 미래의 시작일도 없다면 현재 접수중입니다.
  // 시작일이 비어 있어도 종료일 또는 대회일 전까지는 접수중으로 판단합니다.
  return "open";
}
