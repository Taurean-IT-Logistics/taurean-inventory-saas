import Avatar from 'components/base/Avatar';
import { useWizardFormContext } from 'providers/WizardFormProvider';
import { useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import avatarPlaceholder from 'assets/img/team/avatar.webp';
import AvatarDropzone from 'components/common/AvatarDropzone';
import DatePicker from 'components/base/DatePicker';
import { WizardFormData } from 'pages/modules/forms/WizardExample';

const WizardPersonalForm = () => {
  const methods = useWizardFormContext<WizardFormData>();
  const { formData, onChange, validation } = methods;
  const [avatar, setAvatar] = useState(avatarPlaceholder);

  const onDrop = (acceptedFiles: File[]) => {
    setAvatar(URL.createObjectURL(acceptedFiles[0]));
  };

  return (
    <>
      <Row className="mb-4">
        <Col md="auto">
          <Avatar src={avatar} placeholder size="4xl" />
        </Col>
        <Col>
          <AvatarDropzone onDrop={onDrop} />
        </Col>
      </Row>
      <Form.Group className="mb-2">
        <Form.Label>Gender</Form.Label>
        <Form.Select
          name="gender"
          value={formData.gender}
          onChange={onChange}
          required={validation}
        >
          <option value="">Select your gender ...</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          This field is required.
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>Phone</Form.Label>
        <Form.Control
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={onChange}
          required={validation}
        />
        <Form.Control.Feedback type="invalid">
          This field is required.
        </Form.Control.Feedback>
      </Form.Group>

      <DatePicker
        hideIcon
        render={(_, ref) => {
          return (
            <Form.Group className="mb-2">
              <Form.Label>Date of birth</Form.Label>
              <Form.Control
                type="date"
                placeholder="Date of birth"
                ref={ref}
                value={formData.dob}
                name="dob"
              />
            </Form.Group>
          );
        }}
      />

      <Form.Group className="mb-2">
        <Form.Label>Address</Form.Label>
        <Form.Control
          as="textarea"
          value={formData.address}
          onChange={onChange}
          rows={4}
          required={validation}
        />
        <Form.Control.Feedback type="invalid">
          This field is required.
        </Form.Control.Feedback>
      </Form.Group>
    </>
  );
};

export default WizardPersonalForm;
