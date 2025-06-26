import { useState } from 'react';
import { faKey, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/base/Button';
import { Col, Form, Row, Spinner } from 'react-bootstrap';
import { UserController } from 'controllers';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from 'hooks/useAppDispatch';
import { StateManagement } from 'lib';
import { AuthUser } from 'types';
import { showToast } from 'components/toaster/toaster';
import axios from 'axios';

const SignInForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      showToast('error', 'Email and password are required.');
      return;
    }

    setLoading(true);

    try {
      const response = await UserController.loginUser(
        trimmedEmail,
        trimmedPassword
      );

      if (response.success && response.data) {
        const data: AuthUser = {
          user: response.data.user,
          tokens: response.data.tokens,
          isAuthenticated: true
        };

        dispatch(StateManagement.AuthReducer.login(data));

        if (rememberMe) {
          localStorage.setItem('auth', JSON.stringify(data));
        }

        showToast('success', `Welcome ${data.user?.name.split(' ')[0]}`);
        navigate(redirectTo, { replace: true });
      } else {
        showToast('error', 'Login Unsuccessful');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        showToast(
          'error',
          err.response?.data?.message || 'Invalid credentials.'
        );
      } else {
        showToast('error', 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="text-center mb-4">
        <h3 className="text-body-highlight">Sign In</h3>
        <p className="text-body-tertiary">Get access to your account</p>
      </div>

      <Form.Group className="mb-3 text-start">
        <Form.Label htmlFor="email">Email address / Username</Form.Label>
        <div className="form-icon-container">
          <Form.Control
            id="email"
            type="text"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="form-icon-input"
            placeholder="name@example.com"
            required
          />
          <FontAwesomeIcon icon={faUser} className="text-body fs-9 form-icon" />
        </div>
      </Form.Group>

      <Form.Group className="mb-3 text-start">
        <Form.Label htmlFor="password">Password</Form.Label>
        <div className="form-icon-container">
          <Form.Control
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="form-icon-input"
            placeholder="Password"
            required
          />
          <FontAwesomeIcon icon={faKey} className="text-body fs-9 form-icon" />
        </div>
      </Form.Group>

      <Row className="flex-between-center mb-4">
        <Col xs="auto">
          <Form.Check type="checkbox" className="mb-0">
            <Form.Check.Input
              id="remember-me"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
            />
            <Form.Check.Label htmlFor="remember-me" className="mb-0">
              Remember me
            </Form.Check.Label>
          </Form.Check>
        </Col>
      </Row>

      <Button
        type="submit"
        variant="primary"
        className="w-100 mb-3"
        disabled={loading}
      >
        {loading ? <Spinner animation="border" size="sm" /> : 'Sign In'}
      </Button>

      <div className="text-center mt-3">
        <span className="text-muted me-1">Don't have an account?</span>
        <Link to="/sign-up" className="fs-9 fw-bold">
          Create one
        </Link>
      </div>
    </Form>
  );
};

export default SignInForm;
