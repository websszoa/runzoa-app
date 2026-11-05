import { describe, expect, it } from "vitest";
import {
  getRaceStatus,
  isDateBeforeToday,
  matchesRaceQuery,
  toLocalDateString,
  type RaceWithStatus,
} from "./utils";

const today = new Date(2026, 10, 5);

describe("getRaceStatus", () => {
  it("명시된 접수 상태를 날짜보다 우선한다", () => {
    expect(
      getRaceStatus(
        {
          status: "접수마감",
          startDate: "2026-11-01",
          endDate: "2026-11-30",
          eventDate: "2026-12-01",
        },
        today,
      ),
    ).toBe("closed");
  });

  it("빈 상태값은 날짜를 기준으로 계산한다", () => {
    expect(
      getRaceStatus(
        {
          status: "",
          startDate: "2026-11-01",
          endDate: "2026-11-10",
          eventDate: "2026-12-01",
        },
        today,
      ),
    ).toBe("open");
  });

  it("접수 시작일 전에는 접수예정이다", () => {
    expect(
      getRaceStatus(
        {
          status: null,
          startDate: "2026-11-06",
          endDate: "2026-11-20",
          eventDate: "2026-12-01",
        },
        today,
      ),
    ).toBe("upcoming");
  });

  it("접수 종료일이 지나면 접수마감이다", () => {
    expect(
      getRaceStatus(
        {
          status: null,
          startDate: "2026-10-01",
          endDate: "2026-11-04",
          eventDate: "2026-12-01",
        },
        today,
      ),
    ).toBe("closed");
  });

  it("종료일이 없으면 대회일을 종료 기준으로 사용한다", () => {
    expect(
      getRaceStatus(
        {
          status: null,
          startDate: null,
          endDate: null,
          eventDate: "2026-11-06",
        },
        today,
      ),
    ).toBe("open");
  });
});

describe("date helpers", () => {
  it("로컬 날짜를 YYYY-MM-DD로 만든다", () => {
    expect(toLocalDateString(today)).toBe("2026-11-05");
  });

  it("오늘은 지난 대회로 처리하지 않는다", () => {
    expect(isDateBeforeToday("2026-11-05", today)).toBe(false);
    expect(isDateBeforeToday("2026-11-04", today)).toBe(true);
  });
});

describe("matchesRaceQuery", () => {
  const race: RaceWithStatus = {
    eventDate: "2026-12-05",
    date: "12.05",
    day: "토요일",
    title: "유관순 평화 마라톤",
    location: "충남 · 독립기념관",
    status: "upcoming",
    details: {
      type: "마라톤",
      eventEndDate: null,
      eventTime: null,
      eventSite: null,
      registrationStartDate: null,
      registrationEndDate: null,
      registrationSite: null,
      address: null,
      prices: {},
    },
  };

  it("대회명, 장소, 유형, 날짜와 접수 상태를 검색한다", () => {
    expect(matchesRaceQuery(race, "유관순")).toBe(true);
    expect(matchesRaceQuery(race, "충남")).toBe(true);
    expect(matchesRaceQuery(race, "마라톤")).toBe(true);
    expect(matchesRaceQuery(race, "2026-12-05")).toBe(true);
    expect(matchesRaceQuery(race, "접수예정")).toBe(true);
    expect(matchesRaceQuery(race, "서울")).toBe(false);
  });
});
