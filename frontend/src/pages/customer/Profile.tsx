import {
  faKey,
  faPencil,
  faTrashAlt,
  faSave,
  faTimes,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/base/Button';
import Section from 'components/base/Section';
import EcoimDefaultAddressCard from 'components/cards/EcoimDefaultAddressCard';
import EcomProfileCard from 'components/cards/EcomProfileCard';
import { showToast } from 'components/toaster/toaster';
import { UserController } from 'controllers';
import { useAppSelector, useAppDispatch } from 'hooks/useAppDispatch';
import { StateManagement } from 'lib';
import { RootState } from 'lib/store';
import { useEffect, useState } from 'react';
import { Col, Modal, Row, Form } from 'react-bootstrap';
import { User } from 'types';

interface EditDetailsModalProps {
  show: boolean;
  user: Partial<User>;
  onSave: (data: any) => Promise<void>;
  onHide: () => void;
}

const EditDetailsModal = ({
  show,
  onHide,
  user,
  onSave
}: EditDetailsModalProps) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Update form data when user prop changes
  useEffect(() => {
    setFormData({
      name: user?.name || '',
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      username: '',
      email: '',
      phone: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Password validation - only if user is trying to change password
    const isChangingPassword =
      formData.currentPassword ||
      formData.newPassword ||
      formData.confirmPassword;

    if (isChangingPassword) {
      if (!formData.currentPassword.trim()) {
        newErrors.currentPassword = 'Current password is required';
      }

      if (!formData.newPassword.trim()) {
        newErrors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'New password must be at least 6 characters';
      }

      if (!formData.confirmPassword.trim()) {
        newErrors.confirmPassword = 'Please confirm your new password';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (
        formData.currentPassword === formData.newPassword &&
        formData.currentPassword
      ) {
        newErrors.newPassword =
          'New password must be different from current password';
      }
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data to send (exclude empty password fields)
      const dataToSend = { ...formData };

      // If not changing password, remove password fields
      const isChangingPassword =
        formData.currentPassword ||
        formData.newPassword ||
        formData.confirmPassword;
      if (!isChangingPassword) {
        delete dataToSend.currentPassword;
        delete dataToSend.newPassword;
        delete dataToSend.confirmPassword;
      }

      await onSave(dataToSend);
      handleClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      // You might want to show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form data to original values when closing
    setFormData({
      name: user?.name || '',
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({
      name: '',
      username: '',
      email: '',
      phone: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="border-bottom">
        <Modal.Title className="d-flex align-items-center">
          <FontAwesomeIcon icon={faPencil} className="me-2 text-primary" />
          Edit Profile Details
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Full Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  isInvalid={!!errors.name}
                  placeholder="Enter your full name"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Username <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  isInvalid={!!errors.username}
                  placeholder="Enter username"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.username}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Email Address <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  isInvalid={!!errors.email}
                  placeholder="Enter email address"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  isInvalid={!!errors.phone}
                  placeholder="Enter phone number (optional)"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Password Change Section */}
          <div className="mt-4 pt-3 border-top">
            <h6 className="mb-3 d-flex align-items-center">
              <FontAwesomeIcon icon={faKey} className="me-2 text-primary" />
              Change Password (Optional)
            </h6>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Current Password
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      isInvalid={!!errors.currentPassword}
                      placeholder="Enter current password"
                    />
                    <Button
                      variant="link"
                      className="position-absolute end-0 top-50 translate-middle-y border-0 p-2"
                      style={{ zIndex: 5 }}
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      type="button"
                    >
                      <FontAwesomeIcon
                        icon={showCurrentPassword ? faEyeSlash : faEye}
                        className="text-muted"
                      />
                    </Button>
                  </div>
                  <Form.Control.Feedback type="invalid">
                    {errors.currentPassword}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">New Password</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      isInvalid={!!errors.newPassword}
                      placeholder="Enter new password"
                    />
                    <Button
                      variant="link"
                      className="position-absolute end-0 top-50 translate-middle-y border-0 p-2"
                      style={{ zIndex: 5 }}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      type="button"
                    >
                      <FontAwesomeIcon
                        icon={showNewPassword ? faEyeSlash : faEye}
                        className="text-muted"
                      />
                    </Button>
                  </div>
                  <Form.Control.Feedback type="invalid">
                    {errors.newPassword}
                  </Form.Control.Feedback>
                  {formData.newPassword && formData.newPassword.length < 6 && (
                    <Form.Text className="text-muted">
                      Password must be at least 6 characters long
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Confirm New Password
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      isInvalid={!!errors.confirmPassword}
                      placeholder="Confirm new password"
                    />
                    <Button
                      variant="link"
                      className="position-absolute end-0 top-50 translate-middle-y border-0 p-2"
                      style={{ zIndex: 5 }}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      type="button"
                    >
                      <FontAwesomeIcon
                        icon={showConfirmPassword ? faEyeSlash : faEye}
                        className="text-muted"
                      />
                    </Button>
                  </div>
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <small className="text-muted mt-2 d-block">
              Leave password fields empty if you don't want to change your
              password
            </small>
          </div>

          <div className="mt-4 pt-3 border-top">
            <small className="text-muted">
              <span className="text-danger">*</span> Required fields
            </small>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer className="border-top d-flex justify-content-end gap-2">
        <Button
          variant="phoenix-secondary"
          onClick={handleClose}
          disabled={isLoading}
          startIcon={<FontAwesomeIcon icon={faTimes} />}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isLoading}
          startIcon={<FontAwesomeIcon icon={faSave} />}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const Profile = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const { user, tokens } = useAppSelector((state: RootState) => state.auth);
  const accessToken = tokens?.accessToken;
  const userData = user as User;
  const [userDetails, setUserDetails] = useState<User | undefined>(userData);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (user) {
      setUserDetails(userData);
    }
  }, [user, userData]); // Added dependencies

  const handleEditDetails = () => {
    setShowEditModal(true);
  };

  const handleSaveUserDetails = async (
    updatedData: Partial<User>
  ): Promise<void> => {
    try {
      // Here you would typically make an API call to update the user
      // const response = await updateUserProfile(user._id, updatedData);

      const response = await UserController.updateUser(
        user.id,
        updatedData,
        accessToken
      );

      if (response.success) {
        showToast('success', 'Details updated');
        setUserDetails(prev => ({
          ...prev,
          ...updatedData
        }));

        dispatch(StateManagement.AuthReducer.updateProfile(updatedData));
      }
    } catch (error) {
      showToast('error', error || 'Error updating user details');
    }
  };

  return (
    <div className="pt-5 mb-9">
      <Section fluid className="py-0">
        <Row className="align-items-center justify-content-between g-3 mb-4">
          <Col xs="auto">
            <h2 className="mb-0">Profile</h2>
          </Col>
          <Col xs="auto" className="d-flex flex-wrap gap-2 gap-sm-3">
            <Button
              variant="phoenix-danger"
              startIcon={<FontAwesomeIcon className="me-2" icon={faTrashAlt} />}
            >
              Request Account Deletion
            </Button>
            <Button
              variant="phoenix-secondary"
              startIcon={<FontAwesomeIcon className="me-2" icon={faPencil} />}
              onClick={handleEditDetails}
            >
              Edit Details
            </Button>
          </Col>
        </Row>
        <Row className="g-3 mb-6">
          <Col xs={12} lg={8}>
            <EcomProfileCard user={user} />
          </Col>
          <Col xs={12} lg={4}>
            <EcoimDefaultAddressCard user={user} />
          </Col>
        </Row>
      </Section>

      <EditDetailsModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        user={userDetails || {}}
        onSave={handleSaveUserDetails}
      />
    </div>
  );
};

export default Profile;
