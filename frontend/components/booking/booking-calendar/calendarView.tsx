"use client";

import { useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Loader2, Calendar } from "lucide-react";
import type { BookingEvent } from "@/types/index";

interface CalendarViewProps {
  viewType: "dayGridMonth" | "timeGridWeek" | "timeGridDay";
  events: BookingEvent[];
  isLoading: boolean;
  onEventClick: (info: any) => void;
  onDateSelect: (selectInfo: any) => void;
}

export const CalendarView = ({
  viewType,
  events,
  isLoading,
  onEventClick,
  onDateSelect,
}: CalendarViewProps) => {
  const calendarRef = useRef<FullCalendar>(null);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600 font-medium">Loading bookings...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Calendar className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              No bookings match your current filters. Try adjusting your search
              criteria or create a new booking.
            </p>
          </div>
        ) : (
          <div className="calendar-container">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={viewType}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={events}
              eventClick={onEventClick}
              selectable
              selectMirror
              select={onDateSelect}
              height="auto"
              dayMaxEvents={3}
              eventTimeFormat={{
                hour: "numeric",
                minute: "2-digit",
                meridiem: "short",
              }}
              eventDisplay="block"
              dayHeaderFormat={{ weekday: "short" }}
              slotLabelFormat={{
                hour: "numeric",
                minute: "2-digit",
                meridiem: "short",
              }}
            />
          </div>
        )}
      </div>

      <style jsx global>{`
        .calendar-container .fc {
          font-family: inherit;
        }

        .calendar-container .fc-toolbar {
          margin-bottom: 1.5rem;
        }

        .calendar-container .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        .calendar-container .fc-button {
          background: white;
          border: 1px solid #e5e7eb;
          color: #374151;
          font-weight: 500;
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          transition: all 0.2s ease;
        }

        .calendar-container .fc-button:hover {
          background: #f9fafb;
          border-color: #d1d5db;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        .calendar-container .fc-button-active {
          background: #3b82f6 !important;
          border-color: #3b82f6 !important;
          color: white !important;
          box-shadow: 0 4px 6px -1px rgb(59 130 246 / 0.3);
        }

        .calendar-container .fc-daygrid-day {
          border-color: #f3f4f6;
        }

        .calendar-container .fc-col-header-cell {
          background: #f9fafb;
          border-color: #f3f4f6;
          font-weight: 600;
          color: #374151;
          padding: 0.75rem 0.5rem;
        }

        .calendar-container .fc-event {
          border-radius: 0.5rem;
          border: 2px solid;
          font-weight: 500;
          font-size: 0.875rem;
          color: #ffffff;
          padding: 0.25rem 0.5rem;
          box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.1);
          transition: all 0.2s ease;
        }

        .calendar-container .fc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px 0 rgb(0 0 0 / 0.15);
        }

        .calendar-container .fc-daygrid-day-number {
          color: #374151;
          font-weight: 500;
          padding: 0.5rem;
        }

        .calendar-container .fc-day-today {
          background: #eff6ff !important;
        }

        .calendar-container .fc-day-today .fc-daygrid-day-number {
          color: #3b82f6;
          font-weight: 700;
        }

        .calendar-container .fc-event-main {
          color: inherit;
        }

        .calendar-container .fc-event-main-frame {
          color: inherit;
        }
      `}</style>
    </div>
  );
};
