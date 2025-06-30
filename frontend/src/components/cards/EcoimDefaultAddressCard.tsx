import { Card } from 'react-bootstrap';
import { User } from 'types';

interface AddressCardPops {
  user: User;
}
const EcoimDefaultAddressCard = ({ user }: AddressCardPops) => {
  return (
    <Card className="h-100">
      <Card.Body>
        <div className="border-bottom border-dashed mb-4">
          <h4 className="mb-3 lh-sm lh-xl-1">Email & Phone</h4>
        </div>
        <div>
          <div className="d-flex justify-content-between gap-2 mb-3">
            <h5 className="text-body-highlight mb-0">Email</h5>
            <a className="lh-1" href="mailto:shatinon@jeemail.com">
              {user.email}
            </a>
          </div>
          <div className="d-flex justify-content-between align-items-center gap-2">
            <h5 className="text-body-highlight mb-0">Phone</h5>
            <a href="tel:+1234567890">{user.phone || 'No Phone'}</a>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default EcoimDefaultAddressCard;
