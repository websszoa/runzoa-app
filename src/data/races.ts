export type Race = {
  date: string;
  day: string;
  title: string;
  location: string;
};

export type RaceStatus = "open" | "upcoming" | "closed" | "unknown";
export type RaceWithStatus = Race & { status: RaceStatus };

export const registrationRaces: Race[] = [
  { date: "12.05", day: "토요일", title: "2026 세계기록 국제마라톤대회", location: "충남 · 금산세계인삼엑스포광장" },
  { date: "12.06", day: "일요일", title: "2026 황영조 로드레이스", location: "인천 · 경인아라뱃길 여객터미널 아라타워 일원" },
  { date: "11.14", day: "토요일", title: "제2회 안양천 단풍길 마라톤", location: "서울 · 신정교 하부 영롱이 억새구장" },
  { date: "11.14", day: "토요일", title: "2026 춘천 선셋 아일랜드 기부런", location: "강원 · 춘천 하중도 일원" },
  { date: "11.14", day: "토요일", title: "2026 고양바람누리길 걷기축제", location: "경기 · 일산호수공원 노래하는 분수대" },
  { date: "11.22", day: "일요일", title: "2026 자이스 스마일 레이스", location: "서울 · 여의도공원 문화의마당" },
];

export const upcomingRaces: Race[] = [
  { date: "01.10", day: "일요일", title: "2027 서울 신년 마라톤", location: "서울 · 여의도한강공원" },
  { date: "01.24", day: "일요일", title: "2027 부산 바다런", location: "부산 · 광안리해수욕장 일원" },
  { date: "02.07", day: "일요일", title: "2027 제주 윈터 레이스", location: "제주 · 제주종합경기장" },
  { date: "02.21", day: "일요일", title: "2027 인천 하프마라톤", location: "인천 · 송도달빛축제공원" },
  { date: "03.01", day: "월요일", title: "2027 대전 3·1절 기념 마라톤", location: "대전 · 엑스포시민광장" },
];

export const allRaces: RaceWithStatus[] = [
  ...registrationRaces.map((race) => ({ ...race, status: "open" as const })),
  ...upcomingRaces.map((race) => ({ ...race, status: "upcoming" as const })),
];
