import Avatar from 'components/base/Avatar';
import avatar from 'assets/img/team/30.webp';
import { Form } from 'react-bootstrap';
import Button from 'components/base/Button';
import { Link } from 'react-router-dom';

const LockScreenForm = () => {
  return (
    <div>
      <div className="text-center mb-5">
        <Avatar size="4xl" src={avatar} className="mb-3 d-inline-block" />
        <h2 className="text-body-highlight">
          <span className="fw-normal">Hello </span>
          John Smith
        </h2>
        <p className="text-body-tertiary">
          Enter your password to access the admin
        </p>
      </div>
      <Form>
        <Form.Control
          className="mb-3"
          id="password"
          type="password"
          placeholder="Enter Password"
        />
        <Button variant="primary" as={Link} to="/" className="w-100">
          Sign In
        </Button>
      </Form>
    </div>
  );
};

export default LockScreenForm;
