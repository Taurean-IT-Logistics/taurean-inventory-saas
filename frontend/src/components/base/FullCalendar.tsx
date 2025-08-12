import ReactFullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEffect, useRef } from 'react';
import { CalendarOptions } from '@fullcalendar/core';
import { useCalendarContext } from 'providers/CalendarProvider';
import { useAppContext } from 'providers/AppProvider';
import { INITIALIZE_CALENDAR } from 'reducers/CalendarReducer';

interface FullCalendarProps extends CalendarOptions {}

const FullCalendar = ({ ...rest }: FullCalendarProps) => {
  const calendarRef = useRef<ReactFullCalendar>(null);
  const {
    config: { isRTL }
  } = useAppContext();

  const { view, calendarDispatch } = useCalendarContext();

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      calendarDispatch({ type: INITIALIZE_CALENDAR, payload: api });
    }
  }, []);

  return (
    <ReactFullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView={view}
      headerToolbar={false}
      dayMaxEvents={3}
      stickyHeaderDates={false}
      editable
      selectable
      selectMirror
      direction={isRTL ? 'rtl' : 'ltr'}
      eventTimeFormat={{
        hour: 'numeric',
        minute: '2-digit',
        omitZeroMinute: true,
        meridiem: true
      }}
      {...rest}
    />
  );
};

export default FullCalendar;
