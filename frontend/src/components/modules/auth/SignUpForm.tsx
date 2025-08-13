import Button from 'components/base/Button';
import { Col, Form, Row } from 'components/ui';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from 'hooks/useAppDispatch';
import { useState } from 'react';
import { showToast } from 'components/toaster/toaster';
import { StateManagement } from 'lib';
import { AuthUser } from 'types';
import axios from 'axios';
import { UserController } from 'controllers';

const SignUpForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      name,
      username,
      email,
      password,
      confirmPassword,
      agreeToTerms,
      phone
    } = form;

    if (
      !name ||
      !username ||
      !email ||
      !password ||
      !confirmPassword ||
      !phone
    ) {
      showToast('error', 'All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      showToast('error', 'Passwords do not match.');
      return;
    }

    if (!agreeToTerms) {
      showToast('error', 'You must accept the terms and privacy policy.');
      return;
    }

    setLoading(true);

    try {
      const response = await UserController.createUser({
        name,
        username,
        email,
        password,
        phone
      });

      if (response.success && response.data) {
        const data: AuthUser = {
          user: response.data.user,
          tokens: response.data.tokens,
          isAuthenticated: true
        };

        dispatch(StateManagement.AuthReducer.login(data));
        showToast('success', `Welcome ${data.user?.name.split(' ')[0]}`);
        navigate('/');
      } else {
        showToast('error', 'Signup failed. Please try again.');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        showToast(
          'error',
          err.response?.data?.message || 'Invalid signup data.'
        );
      } else {
        showToast('error', 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-7">
        <h3 className="text-body-highlight">Sign Up</h3>
        <p className="text-body-tertiary">Create your account today</p>
      </div>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3 text-start">
          <Form.Label htmlFor="name">Name</Form.Label>
          <Form.Control
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Your full name"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3 text-start">
          <Form.Label htmlFor="username">Username</Form.Label>
          <Form.Control
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            placeholder="Choose a username"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3 text-start">
          <Form.Label htmlFor="phone">Phone</Form.Label>
          <Form.Control
            id="phone"
            name="phone"
            type="telephone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3 text-start">
          <Form.Label htmlFor="email">Email address</Form.Label>
          <Form.Control
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="name@example.com"
            required
          />
        </Form.Group>

        <Row className="g-3 mb-3">
          <Col sm={6} lg={6}>
            <Form.Group>
              <Form.Label htmlFor="password">Password</Form.Label>
              <Form.Control
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
            </Form.Group>
          </Col>
          <Col sm={6} lg={6}>
            <Form.Group>
              <Form.Label htmlFor="confirmPassword">
                Confirm Password
              </Form.Label>
              <Form.Control
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Check type="checkbox" className="mb-3">
          <Form.Check.Input
            type="checkbox"
            name="agreeToTerms"
            id="termsService"
            checked={form.agreeToTerms}
            onChange={handleChange}
          />
          <Form.Check.Label
            htmlFor="termsService"
            className="fs-9 text-transform-none"
          >
            I accept the <Link to="#!">terms</Link> and{' '}
            <Link to="#!">privacy policy</Link>
          </Form.Check.Label>
        </Form.Check>

        <Button
          type="submit"
          variant="primary"
          className="w-100 mb-3"
          disabled={loading}
        >
          {loading ? 'Signing up...' : 'Sign up'}
        </Button>

        <div className="text-center">
          <Link to="/sign-in" className="fs-9 fw-bold">
            Sign in to an existing account
          </Link>
        </div>
      </Form>
    </>
  );
};

export default SignUpForm;
