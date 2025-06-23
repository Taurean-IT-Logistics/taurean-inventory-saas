import {
  faCheck,
  faFileAlt,
  faLock,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { Nav } from 'react-bootstrap';
import WizardNavItem from './WizardNavItem';

const WizardNav = () => {
  return (
    <Nav className="justify-content-between nav-wizard nav-wizard-success">
      <WizardNavItem icon={faLock} step={1} label="Account" />
      <WizardNavItem icon={faUser} step={2} label="Personal" />
      <WizardNavItem icon={faFileAlt} step={3} label="Billing" />
      <WizardNavItem icon={faCheck} step={4} label="Done" />
    </Nav>
  );
};

export default WizardNav;
