import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  DollarSign,
  Filter,
  X
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

const eventTypeLabels = {
  transaction: "Transactions",
  bill: "Bills",
  recurring: "Recurring",
  goal: "Goals",
  debt: "Debt Payments",
  budget: "Budget Periods",
};

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [eventTypeFilters, setEventTypeFilters] = useState<Record<string, boolean>>({
    transaction: true,
    bill: true,
    recurring: true,
    goal: true,
    debt: true,
    budget: true,
  });

  // Calculate month range
  const monthStart = useMemo(() => {
    const date = new Date(currentDate);
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [currentDate]);

  const monthEnd = useMemo(() => {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    date.setHours(23, 59, 59, 999);
    return date;
  }, [currentDate]);

 type CalendarEvent = {
  id: string;
  type: keyof typeof eventTypeLabels;
  title: string;
  date: number;
  amount?: number;
  category?: string;
  color: string;
};

const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
  queryKey: ["calendar-events", monthStart.getTime(), monthEnd.getTime()],
  queryFn: () =>
    apiFetch<CalendarEvent[]>(
      `/calendar?startDate=${monthStart.getTime()}&endDate=${monthEnd.getTime()}`
    ),
});

  // Filter events
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events.filter((event) => eventTypeFilters[event.type]);
  }, [events, eventTypeFilters]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, typeof filteredEvents> = {};
    filteredEvents.forEach((event) => {
      const dateKey = new Date(event.date).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [filteredEvents]);

  // Get calendar days
  const calendarDays = useMemo(() => {
    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];
    const firstDay = new Date(monthStart);
    const startDay = firstDay.getDay();

    // Add previous month days
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(monthStart);
      date.setDate(date.getDate() - i - 1);
      days.push({ date, isCurrentMonth: false });
    }

    // Add current month days
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      days.push({ date, isCurrentMonth: true });
    }

    // Add next month days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(monthEnd);
      date.setDate(date.getDate() + i);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  }, [monthStart, monthEnd, currentDate]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = selectedDate.toDateString();
    return eventsByDate[dateKey] || [];
  }, [selectedDate, eventsByDate]);

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => {
      const date = new Date(prev);
      date.setMonth(date.getMonth() - 1);
      return date;
    });
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const date = new Date(prev);
      date.setMonth(date.getMonth() + 1);
      return date;
    });
    setSelectedDate(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const toggleEventType = (type: string) => {
    setEventTypeFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  if (events === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <CalendarIcon className="h-6 w-6 sm:h-8 sm:h-8 text-primary flex-shrink-0" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">{monthName}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {filteredEvents.length} events this month
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleToday} className="text-xs sm:text-sm">
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePreviousMonth}
                className="glass h-8 w-8 sm:h-9 sm:w-9"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                className="glass h-8 w-8 sm:h-9 sm:w-9"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant={showFilters ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="glass h-8 w-8 sm:h-9 sm:w-9"
              >
                <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 border-t border-border pt-4">
              {Object.entries(eventTypeLabels).map(([type, label]) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={eventTypeFilters[type]}
                    onCheckedChange={() => toggleEventType(type)}
                  />
                  <Label htmlFor={type} className="text-xs sm:text-sm cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardContent className="p-2 sm:p-4">
              {/* Day headers */}
              <div className="mb-2 grid grid-cols-7 gap-0.5 sm:gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="p-1 sm:p-2 text-center text-[10px] sm:text-xs font-semibold text-muted-foreground"
                  >
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.charAt(0)}</span>
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {calendarDays.map((day, index) => {
                  const dateKey = day.date.toDateString();
                  const dayEvents = eventsByDate[dateKey] || [];
                  const hasEvents = dayEvents.length > 0;

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day.date)}
                      className={`
                        relative min-h-[50px] sm:min-h-[70px] lg:min-h-[80px] rounded-md sm:rounded-lg border p-1 sm:p-2 text-left transition-all hover:border-primary
                        ${!day.isCurrentMonth ? "bg-muted/50 text-muted-foreground" : "bg-background/50"}
                        ${isToday(day.date) ? "border-primary ring-1 sm:ring-2 ring-primary/20" : "border-border"}
                        ${isSelected(day.date) ? "bg-primary/10 border-primary" : ""}
                      `}
                    >
                      <div
                        className={`
                          text-xs sm:text-sm font-medium
                          ${isToday(day.date) ? "text-primary" : ""}
                        `}
                      >
                        {day.date.getDate()}
                      </div>

                      {/* Event dots */}
                      {hasEvents && (
                        <div className="mt-0.5 sm:mt-1 flex flex-wrap gap-0.5 sm:gap-1">
                          {dayEvents.slice(0, 2).map((event, i) => (
                            <div
                              key={i}
                              className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full"
                              style={{ backgroundColor: event.color }}
                            />
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-[8px] sm:text-[10px] text-muted-foreground">
                              +{dayEvents.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Details */}
        <div className="lg:col-span-1">
          <Card className="glass-card lg:sticky lg:top-4">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                <span className="truncate">
                  {selectedDate
                    ? selectedDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Select a date"}
                </span>
                {selectedDate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedDate(null)}
                    className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate && selectedDateEvents.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="glass rounded-lg border border-border p-2 sm:p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div
                            className="mb-1 h-1 w-8 sm:w-12 rounded-full"
                            style={{ backgroundColor: event.color }}
                          />
                          <p className="font-medium text-xs sm:text-sm truncate">
                            {event.title}
                          </p>
                          {event.amount !== undefined && (
                            <p className="text-xs sm:text-sm font-semibold text-foreground mt-1">
                              KES {event.amount.toLocaleString()}
                            </p>
                          )}
                          {event.category && (
                            <Badge variant="secondary" className="mt-1 text-[10px] sm:text-xs">
                              {event.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedDate ? (
                <p className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-8">
                  No events on this date
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-8">
                  Click a date to view events
                </p>
              )}

              {/* Daily Summary */}
              {selectedDate && selectedDateEvents.length > 0 && (
                <div className="mt-3 sm:mt-4 space-y-2 border-t border-border pt-3 sm:pt-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Total Events</span>
                    <span className="font-semibold">{selectedDateEvents.length}</span>
                  </div>
                  {selectedDateEvents.some((e) => e.amount !== undefined) && (
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Total Amount</span>
                      <span className="font-semibold">
                        KES{" "}
                        {selectedDateEvents
                          .reduce((sum, e) => sum + (e.amount || 0), 0)
                          .toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}