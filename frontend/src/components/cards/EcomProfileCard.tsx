import React from 'react';
import { Card, Col, Row } from 'components/ui';
import Avatar from 'components/base/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { User } from 'types';

interface ProfileCardProps {
  user: User;
}
const EcomProfileCard = ({ user }: ProfileCardProps) => {
  return (
    <Card className="h-100">
      <Card.Body>
        <div className="border-bottom border-dashed pb-4">
          <Row className="items-center g-3 g-sm-5 text-center text-sm-start">
            <Col xs={12} sm="auto">
              <Avatar size="5xl" variant="name">
                {user?.name.split(' ')[0][0]}
              </Avatar>
            </Col>
            <Col xs={12} sm="auto" className="flex-1">
              <h3>{user?.name}</h3>
              <p className="text-body-secondary">
                Joined{' '}
                {user?.createdAt
                  ? formatDistanceToNow(new Date(user?.createdAt), {
                      addSuffix: true
                    })
                  : 'N/A'}
              </p>
            </Col>
          </Row>
        </div>
        <div className="flex flex-between-center pt-4">
          <div>
            <h6 className="mb-2 text-body-secondary">Total Spent</h6>
            <h4 className="fs-7 text-body-highlight mb-0">
              {user?.loyaltyProfile.totalSpent}
            </h4>
          </div>
          <div className="text-end">
            <h6 className="mb-2 text-body-secondary">Total Bookings</h6>
            <h4 className="fs-7 text-body-highlight mb-0">
              {user?.loyaltyProfile.totalBookings}
            </h4>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default EcomProfileCard;
