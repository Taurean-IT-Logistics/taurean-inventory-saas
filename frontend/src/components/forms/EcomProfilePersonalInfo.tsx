import Button from 'components/base/Button';
import { getNumbersInRange } from 'helpers/utils';
import { Col, Form, Row } from 'components/ui';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const EcomProfilePersonalInfo = () => {
  return (
    <form>
      <Row className="gx-3 gy-4 mb-5">
        <Col xs={12} lg={6}>
          <h5 className="text-body-highlight mb-2">Full name</h5>
          <Form.Control type="text" placeholder="Full name" />
        </Col>
        <Col xs={12} lg={6}>
          <h5 className="text-body-highlight mb-2">Gender</h5>
          <Form.Select>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="not-to-say">Prefer not to say</option>
          </Form.Select>
        </Col>
        <Col xs={12} lg={6}>
          <h5 className="text-body-highlight mb-2">Gender Email</h5>
          <Form.Control type="text" placeholder="Email" />
        </Col>
        <Col xs={12} lg={6}>
          <Row className="g-2 gy-lg-0">
            <Col xs={12}>
              <h5 className="text-body-highlight mb-2"> Date of birth</h5>
            </Col>
            <Col xs={4} sm={2} lg={3} xl={2}>
              <Form.Select>
                {getNumbersInRange(1, 31).map(date => (
                  <option value={date} key={date}>
                    {date}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={4} sm={3} lg={4} xl={3}>
              <Form.Select>
                {MONTHS.map(month => (
                  <option value={month} key={month}>
                    {month.slice(0, 3)}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={4} sm={4} lg={5} xl={3}>
              <Form.Select>
                {getNumbersInRange(1990, 2023).map(year => (
                  <option value={year} key={year}>
                    {year}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Col>
        <Col xs={12} lg={6}>
          <h5 className="text-body-highlight mb-2">Phone</h5>
          <Form.Control type="text" placeholder="+1234567890" />
        </Col>
        <Col xs={12} lg={6}>
          <h5 className="text-body-highlight mb-2">Alternative phone</h5>
          <Form.Control type="text" placeholder="+1234567890" />
        </Col>
        <Col xs={12} className="text-end">
          <Button type="submit" variant="primary" className="px-7">
            Save changes
          </Button>
        </Col>
      </Row>
    </form>
  );
};

export default EcomProfilePersonalInfo;
