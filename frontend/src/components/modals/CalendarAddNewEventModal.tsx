import { faAngleRight, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/base/Button';
import DatePicker from 'components/base/DatePicker';
import { FormEvent } from 'react';
import { FloatingLabel, Form, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { getRandomNumber } from 'helpers/utils';
import { useCalendarContext } from 'providers/CalendarProvider';
import { ADD_NEW_EVENT, SET_CALENDAR_STATE } from 'reducers/CalendarReducer';
import { CalendarEvent } from 'data/calendarEvents';
import usePhoenixForm from 'hooks/usePhoenixForm';

const CalendarAddNewEventModal = () => {
  const {
    openNewEventModal,
    selectedStartDate,
    selectedEndDate,
    calendarDispatch
  } = useCalendarContext();

  const { formData, setFormData, onChange } = usePhoenixForm<CalendarEvent>({
    id: String(getRandomNumber(2000, 3000)),
    start: selectedStartDate,
    end: selectedEndDate
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    calendarDispatch({
      type: ADD_NEW_EVENT,
      payload: formData
    });
  };

  const handleClose = () => {
    calendarDispatch({
      type: SET_CALENDAR_STATE,
      payload: {
        openNewEventModal: false
      }
    });
  };

  useEffect(() => {
    setFormData({
      ...formData,
      start: selectedStartDate,
      end: selectedEndDate
    });
  }, [selectedEndDate, selectedStartDate]);

  return (
    <Modal
      show={openNewEventModal}
      contentClassName="border-translucent"
      onHide={handleClose}
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header className="px-card border-0">
          <div className="w-100 d-flex justify-content-between align-items-start">
            <div>
              <h5 className="mb-0 lh-sm text-body-highlight">Add new</h5>
              <div className="mt-2">
                <Form.Check
                  type="radio"
                  id="event"
                  className="form-check-inline"
                >
                  <Form.Check.Input
                    type="radio"
                    name="pricingRadio"
                    defaultChecked
                  />
                  <Form.Check.Label htmlFor="event">Event</Form.Check.Label>
                </Form.Check>
                <Form.Check
                  type="radio"
                  id="task"
                  className="form-check-inline"
                >
                  <Form.Check.Input type="radio" name="pricingRadio" />
                  <Form.Check.Label htmlFor="task">Task</Form.Check.Label>
                </Form.Check>
              </div>
            </div>
            <Button className="p-1 fs-10 text-body" onClick={handleClose}>
              DISCARD
            </Button>
          </div>
        </Modal.Header>
        <Modal.Body className="p-card py-0">
          <FloatingLabel controlId="event-title" label="Title" className="mb-3">
            <input
              className="form-control"
              onChange={onChange}
              name="title"
              type="text"
              placeholder="Title"
            />
          </FloatingLabel>
          <FloatingLabel controlId="eventLabel" label="Label" className="mb-5">
            <Form.Select onChange={onChange} name="className">
              <option>Select</option>
              <option value="text-primary">Business</option>
              <option value="text-secondary">Personal</option>
              <option value="text-success">Meeting</option>
              <option value="text-danger">Birthday</option>
              <option value="text-info">Report</option>
              <option value="text-warning">Must attend</option>
            </Form.Select>
          </FloatingLabel>
          <DatePicker
            options={{
              enableTime: true,
              dateFormat: 'Y-m-d H:i',
              defaultDate: selectedStartDate
            }}
            onChange={([date]) => {
              setFormData({
                ...formData,
                start: date
              });
            }}
            render={(_, ref) => {
              return (
                <Form.Floating className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Starts at"
                    ref={ref}
                    id="startDatepicker"
                  />
                  <label htmlFor="startDatepicker" className="ps-6">
                    Starts at
                  </label>
                </Form.Floating>
              );
            }}
          />
          <DatePicker
            value={selectedEndDate}
            options={{ enableTime: true, dateFormat: 'Y-m-d H:i' }}
            onChange={([date]) => {
              setFormData({
                ...formData,
                end: date
              });
            }}
            render={(_, ref) => {
              return (
                <Form.Floating className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Ends at"
                    ref={ref}
                    id="endDatepicker"
                  />
                  <label htmlFor="endDatepicker" className="ps-6">
                    Ends at
                  </label>
                </Form.Floating>
              );
            }}
          />
          <Form.Check>
            <Form.Check.Input
              onChange={onChange}
              name="allDay"
              type="checkbox"
              id="all-day"
              checked={formData.allDay === true}
            />
            <Form.Check.Label htmlFor="all-day">All day event</Form.Check.Label>
          </Form.Check>
          <div className="py-5">
            <FloatingLabel controlId="description" label="Description">
              <textarea
                className="form-control"
                onChange={onChange}
                placeholder="Description"
                name="description"
                style={{ height: '128px' }}
              />
            </FloatingLabel>
          </div>
          <FloatingLabel
            controlId="repetition"
            label="Repetition"
            className="mb-3"
          >
            <Form.Select onChange={onChange} name="repetition">
              <option>Select</option>
              <option value="noRepeat">No Repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="DailyExceptHolidays">
                Daily (except holidays)
              </option>
              <option value="custom">Custom</option>
            </Form.Select>
          </FloatingLabel>
          <FloatingLabel controlId="reminder" label="Reminder" className="mb-3">
            <Form.Select onChange={onChange} name="reminder">
              <option>Select</option>
              <option value="1">30 minutes earlier</option>
              <option value="2">8 am on the day</option>
              <option value="3">8 am on the day before</option>
              <option value="4">2 days earlier</option>
              <option value="5">a week earlier</option>
            </Form.Select>
          </FloatingLabel>
          <Button
            variant="link"
            className="p-0 mb-3"
            startIcon={<FontAwesomeIcon icon={faPlus} className="me-2" />}
          >
            Add Reminder
          </Button>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between align-items-center border-0">
          <Link
            to="/apps/events/create-an-event"
            className="me-3 fs-9 text-body"
          >
            More options
            <FontAwesomeIcon icon={faAngleRight} className="ms-1 fs-10" />
          </Link>
          <Button variant="primary" type="submit" className="px-4">
            Save
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CalendarAddNewEventModal;
