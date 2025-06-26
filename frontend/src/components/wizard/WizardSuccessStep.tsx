import Button from 'components/base/Button';
import { Col, Row } from 'react-bootstrap';
import illus38 from 'assets/img/spot-illustrations/38.webp';
import illusDark38 from 'assets/img/spot-illustrations/dark_38.webp';
import { useWizardFormContext } from 'providers/WizardFormProvider';

const WizardSuccessStep = () => {
  const { startOver } = useWizardFormContext();
  return (
    <Row className="flex-center pb-8 pt-4 gx-3 gy-4">
      <Col xs={12} sm="auto" className="text-center text-sm-start">
        <img src={illus38} alt="" width={220} className="d-dark-none" />
        <img src={illusDark38} alt="" width={220} className="d-light-none" />
      </Col>
      <Col xs={12} sm="auto" className="text-center text-sm-start">
        <h5 className="mb-3">You are all set!</h5>
        <p className="text-body-emphasis fs--1">
          Now you can access your account
          <br />
          anytime anywhere
        </p>
        <Button variant="primary" className="px-6" onClick={() => startOver()}>
          Start Over
        </Button>
      </Col>
    </Row>
  );
};

export default WizardSuccessStep;
