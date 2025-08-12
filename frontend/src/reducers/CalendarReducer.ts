import { CalendarState } from 'providers/CalendarProvider';
import { CalendarApi } from '@fullcalendar/core';
import { CalendarEvent } from 'data/calendarEvents';

//Action types
export const SET_CALENDAR_STATE = 'SET_CALENDAR_STATE';
export const INITIALIZE_CALENDAR = 'INITIALIZE_CALENDAR';
export const HANDLE_SELECT = 'HANDLE_SELECT';
export const REMOVE_EVENT = 'REMOVE_EVENT';
export const ADD_NEW_EVENT = 'ADD_NEW_EVENT';

//Action ts type
export type CALENDAR_ACTION_TYPE =
  | {
      type: typeof SET_CALENDAR_STATE;
      payload: Partial<CalendarState>;
    }
  | {
      type: typeof INITIALIZE_CALENDAR;
      payload: CalendarApi;
    }
  | {
      type: typeof HANDLE_SELECT;
      payload: { start: Date; end: Date };
    }
  | {
      type: typeof REMOVE_EVENT;
    }
  | {
      type: typeof ADD_NEW_EVENT;
      payload: CalendarEvent;
    };

// Reducer function
export const calendarReducer = (
  state: CalendarState,
  action: CALENDAR_ACTION_TYPE
) => {
  switch (action.type) {
    case SET_CALENDAR_STATE: {
      const { payload } = action;
      return {
        ...state,
        ...payload
      };
    }
    case INITIALIZE_CALENDAR: {
      const { payload } = action;
      return {
        ...state,
        calendarApi: payload
      };
    }
    case HANDLE_SELECT: {
      const { payload } = action;
      return {
        ...state,
        openNewEventModal: true,
        selectedStartDate: payload.start,
        selectedEndDate: payload.end
      };
    }
    case REMOVE_EVENT: {
      state.selectedEvent?.remove();
      return {
        ...state,
        selectedEvent: null
      };
    }
    case ADD_NEW_EVENT: {
      const { payload } = action;
      state.calendarApi?.addEvent(payload);
      return {
        ...state,
        openNewEventModal: false
      };
    }
    default:
      return state;
  }
};
