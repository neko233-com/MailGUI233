import { CalendarDays, ChevronLeft, ChevronRight, Clock, Copy, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import type { CSSProperties, FormEvent, MouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../i18n";
import { accountDisplayName, providerDisplayNameById } from "../lib/displayNames";
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
  onCreateEvent: (event: CalendarEvent) => void;
  onUpdateEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onUpdateMessage: (messageId: string, patch: Partial<MailMessage>) => void;
  onDeleteMessage: (messageId: string) => void;
}

interface TimetableItem {
  id: string;
  sourceId: string;
  accountId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location?: string;
  meta: string;
  kind: "mail" | "calendar";
}

interface EditorState {
  mode: "create" | "edit";
  item?: TimetableItem;
  accountId: string;
  title: string;
  date: string;
  start: string;
  end: string;
  location: string;
}

interface ContextMenuState {
  x: number;
  y: number;
  item: TimetableItem;
}

const anchorDate = new Date("2026-06-21T12:00:00+08:00");
const hourSlots = Array.from({ length: 13 }, (_, index) => index + 8);
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

function weekDaysForLabels() {
  const monday = new Date("2026-06-15T12:00:00+08:00");

  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

function itemHour(item: TimetableItem) {
  return Number(hourFormatter.format(new Date(item.startsAt)));
}

function formatItemTime(item: TimetableItem, formatter: Intl.DateTimeFormat) {
  return `${formatter.format(new Date(item.startsAt))} - ${formatter.format(new Date(item.endsAt))}`;
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

function localDateValue(value: string) {
  return value.slice(0, 10);
}

function localTimeValue(value: string) {
  return value.slice(11, 16);
}

function localIso(date: string, time: string) {
  return `${date}T${time}:00+08:00`;
}

function defaultEditor(accountId: string, date: Date): EditorState {
  const dateValue = dayKey(date);

  return {
    mode: "create",
    accountId,
    title: "",
    date: dateValue,
    start: "09:00",
    end: "09:30",
    location: ""
  };
}

export function SchedulePanel({
  activeAccountId,
  activeProviderId,
  accounts,
  messages,
  events,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  onUpdateMessage,
  onDeleteMessage
}: SchedulePanelProps) {
  const { locale, resolvedLanguage, t } = useI18n();
  const [viewMode, setViewMode] = useState<ScheduleViewMode>("day");
  const [visibleDate, setVisibleDate] = useState(anchorDate);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const dayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        timeZone: "Asia/Shanghai",
        weekday: "short"
      }),
    [locale]
  );
  const monthFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
        timeZone: "Asia/Shanghai"
      }),
    [locale]
  );
  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Shanghai"
      }),
    [locale]
  );
  const weekdayLabels = useMemo(
    () =>
      weekDaysForLabels().map((date) =>
        new Intl.DateTimeFormat(locale, { timeZone: "Asia/Shanghai", weekday: "short" }).format(date)
      ),
    [locale]
  );

  const accountById = useMemo(() => new Map(accounts.map((account) => [account.id, account])), [accounts]);
  const scopeTitle =
    activeAccountId !== "all"
      ? accountById.get(activeAccountId)
        ? accountDisplayName(accountById.get(activeAccountId)!, resolvedLanguage)
        : t("mailbox")
      : activeProviderId !== "all"
        ? providerDisplayNameById(activeProviderId, resolvedLanguage)
        : t("allMailboxes");
  const activeCreateAccountId = useMemo(() => {
    if (activeAccountId !== "all" && accountById.has(activeAccountId)) {
      return activeAccountId;
    }

    if (activeProviderId !== "all") {
      return accounts.find((account) => account.provider === activeProviderId)?.id ?? accounts[0]?.id ?? "local-calendar";
    }

    return accounts[0]?.id ?? "local-calendar";
  }, [accountById, accounts, activeAccountId, activeProviderId]);
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
          sourceId: message.id,
          accountId: message.accountId,
          title: message.subject,
          startsAt: message.timestamp,
          endsAt: messageEnd(message.timestamp),
          meta: `${message.folder} mail`,
          kind: "mail"
        })),
        ...events.map<TimetableItem>((event) => ({
          id: `event-${event.id}`,
          sourceId: event.id,
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

  useEffect(() => {
    function closeContextMenu() {
      setContextMenu(null);
    }

    window.addEventListener("click", closeContextMenu);
    window.addEventListener("scroll", closeContextMenu, true);

    return () => {
      window.removeEventListener("click", closeContextMenu);
      window.removeEventListener("scroll", closeContextMenu, true);
    };
  }, []);

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

  function openCreate(date = visibleDate) {
    setContextMenu(null);
    setEditor(defaultEditor(activeCreateAccountId, date));
  }

  function openEdit(item: TimetableItem) {
    setContextMenu(null);
    setEditor({
      mode: "edit",
      item,
      accountId: item.accountId,
      title: item.title,
      date: localDateValue(item.startsAt),
      start: localTimeValue(item.startsAt),
      end: localTimeValue(item.endsAt),
      location: item.location ?? ""
    });
  }

  function duplicateItem(item: TimetableItem) {
    setContextMenu(null);
    onCreateEvent({
      id: `event-${Date.now()}`,
      accountId: item.accountId,
      title: `${item.title} copy`,
      startsAt: item.startsAt,
      endsAt: item.endsAt,
      location: item.location,
      source: "manual"
    });
  }

  function deleteItem(item: TimetableItem) {
    setContextMenu(null);

    if (item.kind === "mail") {
      onDeleteMessage(item.sourceId);
      return;
    }

    onDeleteEvent(item.sourceId);
  }

  function handleItemContextMenu(event: MouseEvent, item: TimetableItem) {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ x: event.clientX, y: event.clientY, item });
  }

  function saveEditor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editor) {
      return;
    }

    const title = editor.title.trim() || t("untitledScheduleItem");
    const startsAt = localIso(editor.date, editor.start);
    const endsAt = localIso(editor.date, editor.end);
    const location = editor.location.trim() || undefined;

    if (editor.mode === "edit" && editor.item) {
      if (editor.item.kind === "mail") {
        onUpdateMessage(editor.item.sourceId, {
          subject: title,
          timestamp: startsAt
        });
      } else {
        onUpdateEvent({
          id: editor.item.sourceId,
          accountId: editor.accountId,
          title,
          startsAt,
          endsAt,
          location,
          source: "manual"
        });
      }
    } else {
      onCreateEvent({
        id: `event-${Date.now()}`,
        accountId: editor.accountId,
        title,
        startsAt,
        endsAt,
        location,
        source: "manual"
      });
    }

    setEditor(null);
  }

  function renderItem(item: TimetableItem, compact = false) {
    return (
      <article
        aria-label={`${item.title} ${t("scheduleItem")}`}
        className={`schedule-event ${compact ? "compact" : ""} item-${item.kind}`}
        key={item.id}
        onClick={() => openEdit(item)}
        onContextMenu={(event) => handleItemContextMenu(event, item)}
        role="button"
        style={{ "--event-accent": itemAccent(item, accountById) } as CSSProperties}
        tabIndex={0}
      >
        <em>{item.kind === "mail" ? t("mail") : t("plan")}</em>
        <strong>{item.title}</strong>
        <span>
          <Clock size={12} />
          {formatItemTime(item, timeFormatter)}
        </span>
        {item.location ? (
          <span>
            <MapPin size={12} />
            {item.location}
          </span>
        ) : null}
      </article>
    );
  }

  const dayItems = itemsByDay.get(dayKey(visibleDate)) ?? [];

  return (
    <section className="schedule-panel" aria-label={t("mailTimetable")}>
      <header className="schedule-header">
        <div className="schedule-title">
          <CalendarDays size={18} />
          <div>
            <strong>{t("mailTimetable")}</strong>
            <span>
              {scopeTitle} / {viewMode === "month" ? monthFormatter.format(visibleDate) : dayFormatter.format(visibleDate)}
            </span>
          </div>
        </div>

        <button className="schedule-add-button" onClick={() => openCreate()} type="button">
          <Plus size={15} />
          {t("newScheduleItem")}
        </button>

        <div className="schedule-nav" aria-label={t("scheduleNavigation")}>
          <button onClick={() => shift(-1)} type="button" title="Previous">
            <ChevronLeft size={17} />
          </button>
          <button className="today-button" onClick={setToday} type="button">
            {t("today")}
          </button>
          <button onClick={() => shift(1)} type="button" title="Next">
            <ChevronRight size={17} />
          </button>
        </div>

        <div className="schedule-tabs" aria-label={t("scheduleView")}>
          {(["day", "week", "month"] satisfies ScheduleViewMode[]).map((mode) => (
            <button
              key={mode}
              className={viewMode === mode ? "is-active" : ""}
              onClick={() => setViewMode(mode)}
              type="button"
            >
              {t(mode)}
            </button>
          ))}
        </div>
      </header>

      {viewMode === "day" ? (
        <div className="day-schedule" aria-label="Day schedule" onDoubleClick={() => openCreate()}>
          {hourSlots.map((hour) => {
            const slotItems = dayItems.filter((item) => itemHour(item) === hour);
            return (
              <div className="time-slot" key={hour}>
                <time>{`${hour.toString().padStart(2, "0")}:00`}</time>
                <div>{slotItems.map((item) => renderItem(item))}</div>
              </div>
            );
          })}
        </div>
      ) : null}

      {viewMode === "week" ? (
        <div className="week-schedule" aria-label="Week schedule">
          {weekDays.map((date, index) => (
            <section className="week-column" key={dayKey(date)} onDoubleClick={() => openCreate(date)}>
              <header>
                <strong>{weekdayLabels[index]}</strong>
                <span>{date.getDate()}</span>
              </header>
              {(itemsByDay.get(dayKey(date)) ?? []).map((item) => renderItem(item, true))}
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
              <section className={`month-day ${isOutsideMonth ? "is-muted" : ""}`} key={dayKey(date)} onDoubleClick={() => openCreate(date)}>
                <time>{date.getDate()}</time>
                {itemsForDate.slice(0, 3).map((item) => (
                  <button
                    aria-label={`${item.title} ${t("scheduleItem")}`}
                    className={`month-event item-${item.kind}`}
                    key={item.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      openEdit(item);
                    }}
                    onContextMenu={(event) => handleItemContextMenu(event, item)}
                    style={{ "--event-accent": itemAccent(item, accountById) } as CSSProperties}
                    type="button"
                  >
                    {item.title}
                  </button>
                ))}
                {itemsForDate.length > 3 ? <em>+{itemsForDate.length - 3}</em> : null}
              </section>
            );
          })}
        </div>
      ) : null}

      {contextMenu ? (
        <div
          aria-label={t("scheduleContextMenu")}
          className="schedule-context-menu"
          onClick={(event) => event.stopPropagation()}
          role="menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button onClick={() => openEdit(contextMenu.item)} role="menuitem" type="button">
            <Pencil size={14} />
            {t("editScheduleItem")}
          </button>
          <button onClick={() => duplicateItem(contextMenu.item)} role="menuitem" type="button">
            <Copy size={14} />
            {t("duplicateScheduleItem")}
          </button>
          <button className="danger" onClick={() => deleteItem(contextMenu.item)} role="menuitem" type="button">
            <Trash2 size={14} />
            {t("deleteScheduleItem")}
          </button>
        </div>
      ) : null}

      {editor ? (
        <div className="schedule-editor-backdrop" role="presentation">
          <form
            aria-label={editor.mode === "create" ? t("newScheduleItem") : t("editScheduleItem")}
            className="schedule-editor"
            onSubmit={saveEditor}
          >
            <header>
              <strong>{editor.mode === "create" ? t("newScheduleItem") : t("editScheduleItem")}</strong>
              <button aria-label={t("close")} onClick={() => setEditor(null)} type="button">
                <X size={16} />
              </button>
            </header>

            <label>
              <span>{t("title")}</span>
              <input
                autoFocus
                name="title"
                onChange={(event) => setEditor((current) => (current ? { ...current, title: event.target.value } : current))}
                placeholder={t("untitledScheduleItem")}
                value={editor.title}
              />
            </label>

            <div className="schedule-editor-grid">
              <label>
                <span>{t("date")}</span>
                <input
                  name="date"
                  onChange={(event) => setEditor((current) => (current ? { ...current, date: event.target.value } : current))}
                  type="date"
                  value={editor.date}
                />
              </label>
              <label>
                <span>{t("startTime")}</span>
                <input
                  name="start"
                  onChange={(event) => setEditor((current) => (current ? { ...current, start: event.target.value } : current))}
                  type="time"
                  value={editor.start}
                />
              </label>
              <label>
                <span>{t("endTime")}</span>
                <input
                  name="end"
                  onChange={(event) => setEditor((current) => (current ? { ...current, end: event.target.value } : current))}
                  type="time"
                  value={editor.end}
                />
              </label>
            </div>

            <label>
              <span>{t("location")}</span>
              <input
                name="location"
                onChange={(event) => setEditor((current) => (current ? { ...current, location: event.target.value } : current))}
                placeholder={t("optional")}
                value={editor.location}
              />
            </label>

            <footer>
              {editor.mode === "edit" && editor.item ? (
                <button
                  className="editor-delete"
                  onClick={() => {
                    deleteItem(editor.item!);
                    setEditor(null);
                  }}
                  type="button"
                >
                  {t("deleteScheduleItem")}
                </button>
              ) : null}
              <span />
              <button onClick={() => setEditor(null)} type="button">
                {t("cancel")}
              </button>
              <button className="editor-save" type="submit">
                {t("save")}
              </button>
            </footer>
          </form>
        </div>
      ) : null}
    </section>
  );
}
