import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    CalendarDays,
    ExternalLink,
    Loader2,
    User,
    FileText,
    Hash,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Ban,
    Eye,
    X,
    ArrowDownToLine,
    ArrowUpFromLine,
} from "lucide-react";

import { GetCalendarEvents } from "@/services/dashboardService";

const DISMISSED_KEY = "dashboard_dismissed_calendar_events";

function loadDismissed() {
    try {
        return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]"));
    } catch {
        return new Set();
    }
}

function saveDismissed(set) {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]));
}

function getTypeStyle(type) {
    if (type === "incoming") {
        return {
            bg: "bg-red-500",
            text: "text-white",
            hoverBg: "hover:bg-red-600",
            label: "Incoming",
            labelClass: "bg-red-100 text-red-700 border-red-200",
            Icon: ArrowDownToLine,
        };
    }
    return {
        bg: "bg-blue-500",
        text: "text-white",
        hoverBg: "hover:bg-blue-600",
        label: "Outgoing",
        labelClass: "bg-blue-100 text-blue-700 border-blue-200",
        Icon: ArrowUpFromLine,
    };
}

function getStatusBadgeClass(status) {
    switch (status) {
        case "Requested":    return "bg-sky-100 text-sky-700 border-sky-200";
        case "Acknowledged": return "bg-yellow-100 text-yellow-700 border-yellow-200";
        case "Submitted":    return "bg-green-100 text-green-700 border-green-200";
        case "Overdue":      return "bg-red-100 text-red-700 border-red-200";
        case "Cancelled":    return "bg-gray-100 text-gray-600 border-gray-200";
        // DocumentRequest statuses
        case "Pending":      return "bg-blue-100 text-blue-700 border-blue-200";
        case "Processing":   return "bg-purple-100 text-purple-700 border-purple-200";
        case "Fulfilled":    return "bg-green-100 text-green-700 border-green-200";
        case "Unavailable":  return "bg-red-100 text-red-700 border-red-200";
        default:             return "bg-muted text-muted-foreground border-border";
    }
}

function getStatusIcon(status) {
    switch (status) {
        case "Requested":
        case "Pending":      return Clock;
        case "Acknowledged": return Eye;
        case "Submitted":
        case "Fulfilled":
        case "Processing":   return CheckCircle2;
        case "Overdue":      return AlertTriangle;
        case "Cancelled":
        case "Unavailable":  return Ban;
        default:             return FileText;
    }
}

function EventPopoverContent({ event }) {
    const typeStyle = getTypeStyle(event.type);
    const TypeIcon  = typeStyle.Icon;
    const StatusIcon = getStatusIcon(event.status);

    return (
        <div className="space-y-2 text-sm w-64">
            {/* Type pill */}
            <div className="flex items-center gap-1.5">
                <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${typeStyle.labelClass}`}
                >
                    <TypeIcon className="w-3 h-3" />
                    {event.type === "incoming" ? "Incoming (Teacher)" : "Outgoing (Admin)"}
                </span>
            </div>

            {/* Status pill */}
            <div className="flex items-center gap-1.5">
                <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(event.status)}`}
                >
                    <StatusIcon className="w-3 h-3" />
                    {event.status}
                </span>
            </div>

            <Separator />

            <div className="space-y-1 text-xs">
                <PopoverRow icon={FileText} label={event.document_name} />
                {event.teacher?.name && (
                    <PopoverRow icon={User} label={event.teacher.name} />
                )}
                {event.type === "outgoing" && event.due_date && (
                    <PopoverRow
                        icon={CalendarDays}
                        label={`Due ${format(parseISO(event.due_date), "MMM d, yyyy")}`}
                        highlight={event.status === "Overdue"}
                    />
                )}
                {event.type === "incoming" && event.request_date && (
                    <PopoverRow
                        icon={CalendarDays}
                        label={`Received ${format(parseISO(event.request_date), "MMM d, yyyy")}`}
                    />
                )}
            </div>
        </div>
    );
}

function PopoverRow({ icon: Icon, label, highlight = false }) {
    return (
        <div className={`flex items-start gap-1.5 ${highlight ? "text-red-600 font-medium" : "text-foreground"}`}>
            <Icon className="w-3 h-3 mt-0.5 shrink-0 text-muted-foreground" />
            <span className="leading-snug break-words min-w-0">{label}</span>
        </div>
    );
}

function EventBar({ event, onSelect, onDismiss }) {
    const { bg, text } = getTypeStyle(event.type);
    const [popoverOpen, setPopoverOpen] = React.useState(false);

    const handleDismissClick = (e) => {
        e.stopPropagation();
        setPopoverOpen(false);
        onDismiss(event.id);
    };

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                {/* The main clickable bar */}
                <div
                    role="button"
                    tabIndex={0}
                    className={`
                        group relative flex items-center w-full rounded px-1 py-0.5
                        text-[10px] leading-none font-medium cursor-pointer
                        ${bg} ${text}
                        hover:opacity-90 transition-opacity
                        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50
                    `}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(event);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            onSelect(event);
                        }
                    }}
                    onMouseEnter={() => setPopoverOpen(true)}
                    onMouseLeave={() => setPopoverOpen(false)}
                >
                    <span className="flex-1 truncate pr-1 uppercase">{event.document_code}</span>

                    {/* Remove (×) button — always visible on small bar, easy to tap */}
                    <button
                        type="button"
                        aria-label={`Remove ${event.document_name} from calendar`}
                        className="
                            ml-auto shrink-0 rounded-sm p-0.5
                            opacity-0 group-hover:opacity-100 focus:opacity-100
                            hover:bg-white/20 transition-opacity
                        "
                        onClick={handleDismissClick}
                        onMouseEnter={(e) => e.stopPropagation()}
                    >
                        <X className="w-2.5 h-2.5" />
                    </button>
                </div>
            </PopoverTrigger>

            <PopoverContent
                side="right"
                align="start"
                sideOffset={6}
                className="w-auto max-w-[260px] p-3"
                onMouseEnter={() => setPopoverOpen(true)}
                onMouseLeave={() => setPopoverOpen(false)}
                // Stop popover clicks from bubbling to the calendar day
                onClick={(e) => e.stopPropagation()}
            >
                <EventPopoverContent event={event} />
            </PopoverContent>
        </Popover>
    );
}

function DismissConfirmDialog({ event, onConfirm, onCancel }) {
    if (!event) return null;
    return (
        <Dialog open={!!event} onOpenChange={(v) => !v && onCancel()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Remove from calendar?</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                    <strong>{event.document_name}</strong> will be hidden from this calendar view.
                    The underlying request and its data will not be deleted.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={onCancel}>
                        Keep
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => onConfirm(event.id)}>
                        Remove
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function RequestDetailDialog({ event, open, onClose }) {
    const navigate = useNavigate();

    if (!event) return null;

    const typeStyle  = getTypeStyle(event.type);
    const TypeIcon   = typeStyle.Icon;
    const StatusIcon = getStatusIcon(event.status);

    const canNavigate = !["Cancelled", "Fulfilled", "Unavailable"].includes(event.status);
    const navPath = event.type === "incoming" ? "/document-requests" : "/submission-requests";
    const navLabel = event.type === "incoming"
        ? "View in Document Requests"
        : "View in Submission Requests";

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-muted-foreground" />
                        {event.type === "incoming" ? "Incoming Document Request" : "Submission Request"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 text-sm">
                    {/* Type + Status badges */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeStyle.labelClass}`}
                        >
                            <TypeIcon className="w-3 h-3" />
                            {event.type === "incoming" ? "Incoming (Teacher)" : "Outgoing (Admin)"}
                        </span>
                        <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(event.status)}`}
                        >
                            <StatusIcon className="w-3 h-3" />
                            {event.status}
                        </span>
                    </div>

                    <Separator />

                    {/* Details */}
                    <div className="grid gap-2.5">
                        <DetailRow icon={Hash}         label="Request Code" value={event.request_code} />
                        <DetailRow icon={FileText}     label="Document"     value={event.document_name} />
                        <DetailRow
                            icon={User}
                            label="Teacher"
                            value={
                                event.teacher
                                    ? `${event.teacher.name}${event.teacher.class_advisory ? ` · ${event.teacher.class_advisory}` : ""}`
                                    : "—"
                            }
                        />
                        {event.type === "outgoing" && (
                            <DetailRow
                                icon={CalendarDays}
                                label="Due Date"
                                value={event.due_date ? format(parseISO(event.due_date), "MMMM d, yyyy") : "—"}
                                highlight={event.status === "Overdue"}
                            />
                        )}
                        <DetailRow
                            icon={Clock}
                            label="Request Date"
                            value={event.request_date ? format(parseISO(event.request_date), "MMMM d, yyyy") : "—"}
                        />
                        {event.notes && (
                            <DetailRow icon={FileText} label={event.type === "incoming" ? "Purpose" : "Notes"} value={event.notes} />
                        )}
                    </div>

                    {/* Navigation */}
                    {canNavigate && (
                        <>
                            <Separator />
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full gap-2"
                                onClick={() => {
                                    onClose();
                                    navigate(navPath);
                                }}
                            >
                                <ExternalLink className="w-4 h-4" />
                                {navLabel}
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function DetailRow({ icon: Icon, label, value, highlight = false }) {
    return (
        <div className="flex items-start gap-2">
            <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground leading-none mb-0.5">{label}</p>
                <p className={`font-medium leading-snug ${highlight ? "text-red-600" : ""}`}>
                    {value || "—"}
                </p>
            </div>
        </div>
    );
}


function buildDayButtonComponent(eventsByDate, onEventSelect, onDismissRequest) {
    return function CustomDayButton({ day, modifiers, ...props }) {
        const dateKey  = format(day.date, "yyyy-MM-dd");
        const dayEvents = eventsByDate[dateKey] ?? [];

        return (
            <button
                type="button"
                data-day={day.date.toLocaleDateString()}
                data-selected-single={
                    modifiers.selected &&
                    !modifiers.range_start &&
                    !modifiers.range_end &&
                    !modifiers.range_middle
                }
                data-range-start={modifiers.range_start}
                data-range-end={modifiers.range_end}
                data-range-middle={modifiers.range_middle}
                className={[
                    "relative isolate z-10 flex w-full min-w-[var(--cell-size)] flex-col items-stretch",
                    "aspect-auto h-auto border-0 leading-none font-normal",
                    "rounded-[var(--cell-radius)] p-0.5 pb-1",
                    "hover:bg-accent hover:text-accent-foreground transition-colors",
                    "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
                    modifiers.today   ? "font-bold" : "",
                    modifiers.outside ? "text-muted-foreground opacity-60" : "",
                ].join(" ")}
                {...props}
            >
                <span className="flex items-center justify-center text-xs min-h-[var(--cell-size)] w-full">
                    {day.date.getDate()}
                </span>

                {dayEvents.length > 0 && (
                    <div className="flex flex-col gap-0.5 px-0.5">
                        {dayEvents.slice(0, 2).map((evt) => (
                            <EventBar
                                key={evt.id}
                                event={evt}
                                onSelect={onEventSelect}
                                onDismiss={onDismissRequest}
                            />
                        ))}
                        {dayEvents.length > 2 && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEventSelect(dayEvents[2]);
                                }}
                                className="w-full text-left truncate rounded px-1 py-0.5 text-[10px] leading-none font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                            >
                                +{dayEvents.length - 2} more
                            </button>
                        )}
                    </div>
                )}
            </button>
        );
    };
}

const DashboardCalendar = () => {
    const [selectedDate,   setSelectedDate]   = React.useState(new Date());
    const [displayMonth,   setDisplayMonth]   = React.useState(new Date());
    const [selectedEvent,  setSelectedEvent]  = React.useState(null);
    const [dialogOpen,     setDialogOpen]     = React.useState(false);
    const [dismissTarget,  setDismissTarget]  = React.useState(null);
    const [dismissed,      setDismissed]      = React.useState(() => loadDismissed());

    const queryClient = useQueryClient();

    const rangeFrom = format(
        startOfMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1)),
        "yyyy-MM-dd"
    );
    const rangeTo = format(
        endOfMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0)),
        "yyyy-MM-dd"
    );

    const { data, isLoading, isError } = useQuery({
        queryKey: ["dashboard-calendar-events", rangeFrom, rangeTo],
        queryFn: () => GetCalendarEvents({ from: rangeFrom, to: rangeTo }),
        staleTime: 30_000,
    });

    // Filter out dismissed events
    const events = React.useMemo(
        () => (data?.events ?? []).filter((e) => !dismissed.has(e.id)),
        [data, dismissed]
    );

    // Build lookup: { "yyyy-MM-dd": [event, ...] }
    const eventsByDate = React.useMemo(() => {
        const map = {};
        for (const evt of events) {
            const key = evt.calendar_date;
            if (!key) continue;
            if (!map[key]) map[key] = [];
            if (!map[key].some((e) => e.id === evt.id)) {
                map[key].push(evt);
            }
        }
        return map;
    }, [events]);

    const eventDates = React.useMemo(
        () => Object.keys(eventsByDate).map((k) => parseISO(k)),
        [eventsByDate]
    );

    const handleEventSelect = React.useCallback((event) => {
        setSelectedEvent(event);
        setDialogOpen(true);
    }, []);

    // Ask for confirmation before dismissing
    const handleDismissRequest = React.useCallback((eventId) => {
        const evt = events.find((e) => e.id === eventId);
        if (evt) setDismissTarget(evt);
    }, [events]);

    const handleDismissConfirm = React.useCallback((eventId) => {
        setDismissed((prev) => {
            const next = new Set(prev);
            next.add(eventId);
            saveDismissed(next);
            return next;
        });
        setDismissTarget(null);
    }, []);

    const CustomDayButton = React.useMemo(
        () => buildDayButtonComponent(eventsByDate, handleEventSelect, handleDismissRequest),
        [eventsByDate, handleEventSelect, handleDismissRequest]
    );

    const handleToday = () => {
        const today = new Date();
        setSelectedDate(today);
        setDisplayMonth(today);
    };

    return (
        <div className="space-y-2">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <Button variant="outline" className="bg-white" size="sm" onClick={handleToday}>
                    Today's date
                </Button>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                    <LegendItem color="bg-red-500"  label="Incoming (Teacher)" />
                    <LegendItem color="bg-blue-500" label="Outgoing (Admin)" />
                </div>
            </div>

            {isError && (
                <p className="text-xs text-destructive px-1">Failed to load calendar events.</p>
            )}

            {/* Calendar */}
            <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={displayMonth}
                onMonthChange={setDisplayMonth}
                className="
                    w-full bg-white border rounded-lg
                    [&_table]:w-full [&_table]:border-collapse
                    [&_tbody]:border-spacing-0 [&_tbody_tr]:m-0
                    [&_td]:p-0 [&_th]:p-0
                "
                captionLayout="dropdown"
                fixedWeeks
                formatters={{
                    formatMonthDropdown: (date) =>
                        date.toLocaleString("en-US", { month: "long" }),
                }}
                modifiers={{ hasEvents: eventDates }}
                components={{ DayButton: CustomDayButton }}
            />

            {/* Request detail dialog */}
            <RequestDetailDialog
                event={selectedEvent}
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setSelectedEvent(null);
                }}
            />

            {/* Dismiss confirmation dialog */}
            <DismissConfirmDialog
                event={dismissTarget}
                onConfirm={handleDismissConfirm}
                onCancel={() => setDismissTarget(null)}
            />
        </div>
    );
};

function LegendItem({ color, label }) {
    return (
        <span className="flex items-center gap-1">
            <span className={`inline-block h-2 w-2 rounded-sm ${color}`} />
            {label}
        </span>
    );
}

export default DashboardCalendar;
