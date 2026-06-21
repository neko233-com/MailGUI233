import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import type {
  Account,
  AccountScope,
  CalendarEvent,
  MailMessage,
  ProviderScope,
  ScheduleViewMode
} from "../types";

interface SchedulePanelProps {
  activeAccountId: AccountScope;
  activeProviderId: ProviderScope;
  accounts: Account[];
  messages: MailMessage[];
  events: CalendarEvent[];
}

interface TimetableItem {
  id: string;
  accountId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location?: string;
  meta: string;
  kind: "mail" | "calendar";
}

const anchorDate = new Date("2026-06-21T12:00:00+08:00");
const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hourSlots = Array.from({ length: 13 }, (_, index) => index + 8);
const viewModeLabels: Record<ScheduleViewMode, string> = {
  day: "日",
  week: "周",
  month: "月"
};

const dayFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  timeZone: "Asia/Shanghai",
  weekday: "short"
});

const monthFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  year: "numeric",
  timeZone: "Asia/Shanghai"
});

const timeFormatter = new Intl.DateTimeFormat("en", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Shanghai"
});

const hourFormatter = new Intl.DateTimeFormat("en", {
  hour: "2-digit",
  hour12: false,
  timeZone: "Asia/Shanghai"
});

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function itemDayKey(item: TimetableItem) {
  return item.startsAt.slice(0, 10);
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  return addDays(date, offset);
}

function startOfMonthGrid(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1, 12);
  return startOfWeek(first);
}

function itemHour(item: TimetableItem) {
  return Number(hourFormatter.format(new Date(item.startsAt)));
}

function formatItemTime(item: TimetableItem) {
  return `${timeFormatter.format(new Date(item.startsAt))} - ${timeFormatter.format(
    new Date(item.endsAt)
  )}`;
}

function itemAccent(item: TimetableItem, accounts: Map<string, Account>) {
  return accounts.get(item.accountId)?.accent ?? "#0f766e";
}

function messageEnd(timestamp: string) {
  return new Date(Date.parse(timestamp) + 30 * 60 * 1000).toISOString();
}

function includeAccount(accountId: string, accounts: Map<string, Account>, accountScope: AccountScope, providerScope: ProviderScope) {
  if (accountScope !== "all") {
    return accountId === accountScope;
  }

  if (providerScope !== "all") {
    return accounts.get(accountId)?.provider === providerScope;
  }

  return true;
}

export function SchedulePanel({
  activeAccountId,
  activeProviderId,
  accounts,
  messages,
  events
}: SchedulePanelProps) {
  const [viewMode, setViewMode] = useState<ScheduleViewMode>("day");
  const [visibleDate, setVisibleDate] = useState(anchorDate);

  const accountById = useMemo(() => new Map(accounts.map((account) => [account.id, account])), [accounts]);
  const scopeTitle =
    activeAccountId !== "all"
      ? accountById.get(activeAccountId)?.name ?? "Mailbox"
      : activeProviderId !== "all"
        ? `${activeProviderId.toUpperCase()} mail`
        : "All mailboxes";
  const weekDays = useMemo(() => {
    const first = startOfWeek(visibleDate);
    return Array.from({ length: 7 }, (_, index) => addDays(first, index));
  }, [visibleDate]);
  const monthDays = useMemo(() => {
    const first = startOfMonthGrid(visibleDate);
    return Array.from({ length: 42 }, (_, index) => addDays(first, index));
  }, [visibleDate]);
  const timetableItems = useMemo(
    () =>
      [
        ...messages.map<TimetableItem>((message) => ({
          id: `mail-${message.id}`,
          accountId: message.accountId,
          title: message.subject,
          startsAt: message.timestamp,
          endsAt: messageEnd(message.timestamp),
          meta: `${message.folder} mail`,
          kind: "mail"
        })),
        ...events.map<TimetableItem>((event) => ({
          id: `event-${event.id}`,
          accountId: event.accountId,
          title: event.title,
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          location: event.location,
          meta: event.source,
          kind: "calendar"
        }))
      ]
        .filter((item) => includeAccount(item.accountId, accountById, activeAccountId, activeProviderId))
        .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)),
    [accountById, activeAccountId, activeProviderId, events, messages]
  );
  const itemsByDay = useMemo(() => {
    const grouped = new Map<string, TimetableItem[]>();

    for (const item of timetableItems) {
      const key = itemDayKey(item);
      grouped.set(key, [...(grouped.get(key) ?? []), item]);
    }

    return grouped;
  }, [timetableItems]);

  function shift(direction: -1 | 1) {
    if (viewMode === "day") {
      setVisibleDate((current) => addDays(current, direction));
      return;
    }

    if (viewMode === "week") {
      setVisibleDate((current) => addDays(current, direction * 7));
      return;
    }

    setVisibleDate((current) => addMonths(current, direction));
  }

  function setToday() {
    setVisibleDate(anchorDate);
  }

  const dayItems = itemsByDay.get(dayKey(visibleDate)) ?? [];

  return (
    <section className="schedule-panel" aria-label="Mail timetable">
      <header className="schedule-header">
        <div className="schedule-title">
          <CalendarDays size={18} />
          <div>
            <strong>Mail timetable</strong>
            <span>
              {scopeTitle} / {viewMode === "month" ? monthFormatter.format(visibleDate) : dayFormatter.format(visibleDate)}
            </span>
          </div>
        </div>

        <div className="schedule-nav" aria-label="Schedule navigation">
          <button onClick={() => shift(-1)} type="button" title="Previous">
            <ChevronLeft size={17} />
          </button>
          <button className="today-button" onClick={setToday} type="button">
            Today
          </button>
          <button onClick={() => shift(1)} type="button" title="Next">
            <ChevronRight size={17} />
          </button>
        </div>

        <div className="schedule-tabs" aria-label="Schedule view">
          {(["day", "week", "month"] satisfies ScheduleViewMode[]).map((mode) => (
            <button
              key={mode}
              className={viewMode === mode ? "is-active" : ""}
              onClick={() => setViewMode(mode)}
              type="button"
            >
              {viewModeLabels[mode]}
            </button>
          ))}
        </div>
      </header>

      {viewMode === "day" ? (
        <div className="day-schedule" aria-label="Day schedule">
          {hourSlots.map((hour) => {
            const slotItems = dayItems.filter((item) => itemHour(item) === hour);
            return (
              <div className="time-slot" key={hour}>
                <time>{`${hour.toString().padStart(2, "0")}:00`}</time>
                <div>
                  {slotItems.map((item) => (
                    <article
                      className={`schedule-event item-${item.kind}`}
                      key={item.id}
                      style={{ "--event-accent": itemAccent(item, accountById) } as CSSProperties}
                    >
                      <em>{item.kind === "mail" ? "Mail" : "Plan"}</em>
                      <strong>{item.title}</strong>
                      <span>
                        <Clock size={12} />
                        {formatItemTime(item)}
                      </span>
                      {item.location ? (
                        <span>
                          <MapPin size={12} />
                          {item.location}
                        </span>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {viewMode === "week" ? (
        <div className="week-schedule" aria-label="Week schedule">
          {weekDays.map((date, index) => (
            <section className="week-column" key={dayKey(date)}>
              <header>
                <strong>{weekdayLabels[index]}</strong>
                <span>{date.getDate()}</span>
              </header>
              {(itemsByDay.get(dayKey(date)) ?? []).map((item) => (
                <article
                  className={`schedule-event compact item-${item.kind}`}
                  key={item.id}
                  style={{ "--event-accent": itemAccent(item, accountById) } as CSSProperties}
                >
                  <em>{item.kind === "mail" ? "Mail" : "Plan"}</em>
                  <strong>{item.title}</strong>
                  <span>{formatItemTime(item)}</span>
                </article>
              ))}
            </section>
          ))}
        </div>
      ) : null}

      {viewMode === "month" ? (
        <div className="month-schedule" aria-label="Month schedule">
          {weekdayLabels.map((label) => (
            <strong className="month-weekday" key={label}>
              {label}
            </strong>
          ))}
          {monthDays.map((date) => {
            const itemsForDate = itemsByDay.get(dayKey(date)) ?? [];
            const isOutsideMonth = date.getMonth() !== visibleDate.getMonth();

            return (
              <section className={`month-day ${isOutsideMonth ? "is-muted" : ""}`} key={dayKey(date)}>
                <time>{date.getDate()}</time>
                {itemsForDate.slice(0, 3).map((item) => (
                  <span
                    className={`month-event item-${item.kind}`}
                    key={item.id}
                    style={{ "--event-accent": itemAccent(item, accountById) } as CSSProperties}
                  >
                    {item.title}
                  </span>
                ))}
                {itemsForDate.length > 3 ? <em>+{itemsForDate.length - 3}</em> : null}
              </section>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
