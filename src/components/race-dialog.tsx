import { useState } from "react";
import type { RaceStatus, RaceWithStatus } from "../lib/utils";
import {
  Bell,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  ExternalLink,
  MapPin,
  Ticket,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

type Props = {
  race: RaceWithStatus | null;
  onOpenChange: (open: boolean) => void;
};

const statusMeta: Record<RaceStatus, { label: string; className: string }> = {
  open: { label: "접수중", className: "bg-[#f1170f]" },
  upcoming: { label: "접수예정", className: "bg-blue-600" },
  closed: { label: "접수마감", className: "bg-gray-500" },
  unknown: { label: "접수미정", className: "bg-violet-600" },
};

function getDateParts(date: string) {
  const value = new Date(`${date}T00:00:00`);
  return {
    year: value.getFullYear(),
    month: value.getMonth() + 1,
    day: value.getDate(),
    weekday: new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(
      value,
    ),
  };
}

function formatPeriod(start: string | null, end: string | null): string {
  if (!start && !end) return "일정 미정";
  if (!start) return `${formatPeriod(end, null)}까지`;

  const startDate = getDateParts(start);
  const startText = `${startDate.year}년 ${startDate.month}월 ${startDate.day}일(${startDate.weekday})`;
  if (!end || start === end) return startText;

  const endDate = getDateParts(end);
  const endText =
    startDate.year === endDate.year
      ? `${endDate.month}월 ${endDate.day}일(${endDate.weekday})`
      : `${endDate.year}년 ${endDate.month}월 ${endDate.day}일(${endDate.weekday})`;

  return `${startText} - ${endText}`;
}

function formatPrice(price: number | null) {
  return price === null ? "가격 미정" : `${price.toLocaleString("ko-KR")}원`;
}

function formatRegistrationPeriod(start: string | null, end: string | null) {
  if (end) return formatPeriod(start, end);
  if (start) return `${formatPeriod(start, null)} - 선착순 마감`;
  return "선착순 마감";
}

export default function RaceDetailDialog({ race, onOpenChange }: Props) {
  const [copied, setCopied] = useState(false);
  const [scheduleAlertRequested, setScheduleAlertRequested] = useState(false);
  const [registrationAlertRequested, setRegistrationAlertRequested] =
    useState(false);

  if (!race) return null;

  const status = statusMeta[race.status];
  const prices = Object.entries(race.details.prices);
  const locationQuery = race.details.address ?? race.location;
  // 접수중일 때는 접수 사이트를, 그 외에는 대회 공식 사이트를 우선 연결합니다.
  const officialSite =
    race.status === "open"
      ? (race.details.registrationSite ?? race.details.eventSite)
      : (race.details.eventSite ?? race.details.registrationSite);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(locationQuery);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCopied(false);
      setScheduleAlertRequested(false);
      setRegistrationAlertRequested(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-[24px] p-0 sm:max-w-md">
        <DialogHeader className="gap-1 border-b border-gray-100 px-5 pb-5 pt-6 pr-14">
          <div className="flex items-center gap-1.5">
            <span className="w-fit rounded-full bg-gray-100 px-2.5 py-1 font-anyvid text-xs text-gray-600">
              {race.details.type ?? "마라톤"}
            </span>
            <span
              className={`w-fit rounded-full px-2.5 py-1 font-anyvid text-xs text-white ${status.className}`}
            >
              {status.label}
            </span>
          </div>
          <DialogTitle className="mt-2 font-paperlogy-semibold text-2xl leading-snug text-gray-950">
            {race.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {race.title} 대회 상세 정보
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 px-5 py-2 font-anyvid text-sm">
          <ul className="grid gap-3">
            <li className="flex items-start gap-2">
              <span className="mt-0.5" aria-hidden="true">
                <CalendarDays className="h-4 w-4 text-violet-500" />
              </span>
              <span className="w-20 shrink-0 whitespace-nowrap text-muted-foreground">
                대회 일정 :{" "}
                {formatPeriod(race.eventDate, race.details.eventEndDate)}
                {race.details.eventTime && ` · ${race.details.eventTime}`}
              </span>
            </li>

            <li className="flex items-start gap-2">
              <span className="mt-0.5" aria-hidden="true">
                <Clock3 className="h-4 w-4 text-blue-500" />
              </span>
              <span className="w-20 shrink-0 whitespace-nowrap text-muted-foreground">
                접수 기간 :{" "}
                {formatRegistrationPeriod(
                  race.details.registrationStartDate,
                  race.details.registrationEndDate,
                )}
              </span>
            </li>
          </ul>

          <div className="flex gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <div className="min-w-0 flex-1">
              <p className="font-anyvid text-muted-foreground">
                장소 : {race.location}
              </p>
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                <p className="min-w-0 flex-1 text-sm leading-5 text-muted-foreground">
                  {locationQuery}
                </p>
                <button
                  aria-label="주소 복사"
                  className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-white hover:text-gray-700"
                  onClick={() => void copyAddress()}
                  title="주소 복사"
                  type="button"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-anyvid text-muted-foreground">
                종목 및 참가비
              </p>
              {prices.length > 0 ? (
                <div className="mt-2 grid gap-2">
                  {prices.map(([course, price]) => (
                    <div
                      className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 px-3 py-2"
                      key={course}
                    >
                      <span className="text-muted-foreground">{course}</span>
                      <span className="shrink-0 font-anyvid text-muted-foreground">
                        {formatPrice(price)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-muted-foreground">참가비 정보 없음</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-2 border-t border-gray-100 px-5 py-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              className={`flex items-center justify-center gap-1.5 rounded-full border px-3 py-2.5 font-anyvid text-sm transition-colors ${scheduleAlertRequested ? "border-gray-200 bg-gray-100 text-gray-500" : "border-violet-200 bg-violet-50 text-violet-600 active:bg-violet-100"}`}
              onClick={() => setScheduleAlertRequested(true)}
              type="button"
            >
              <Bell className="h-3.5 w-3.5" />
              {scheduleAlertRequested ? "준비중" : "일정 알림"}
            </button>
            <button
              className={`flex items-center justify-center gap-1.5 rounded-full border px-3 py-2.5 font-anyvid text-sm transition-colors ${registrationAlertRequested ? "border-gray-200 bg-gray-100 text-gray-500" : "border-blue-200 bg-blue-50 text-blue-600 active:bg-blue-100"}`}
              onClick={() => setRegistrationAlertRequested(true)}
              type="button"
            >
              <Bell className="h-3.5 w-3.5" />
              {registrationAlertRequested ? "준비중" : "접수 알림"}
            </button>
          </div>

          {officialSite && (
            <a
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[#f1170f] px-4 py-2.5 font-anyvid text-sm text-white"
              href={officialSite}
              rel="noreferrer"
              target="_blank"
            >
              공식 사이트
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
