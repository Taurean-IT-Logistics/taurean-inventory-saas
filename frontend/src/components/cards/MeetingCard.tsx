import { faCircle, faVideo } from 'lucide-react';
import {  } from '';
import { UilCalendarAlt } from '@iconscout/react-unicons';
import Avatar from 'components/base/Avatar';
import Badge from 'components/base/Badge';
import Button from 'components/base/Button';
import { Meeting } from 'data/crm/dealDetailsData';
import React from 'react';
import { Card } from 'components/ui';

const MeetingCard = ({ meeting }: { meeting: Meeting }) => {
  return (
    <Card>
      <Card.Body>
        <div className="flex justify-content-between align-items-start flex-wrap mb-4 gap-2">
          <div className="mb-3 mb-sm-0">
            <h4 className="line-clamp-1 mb-2 mb-sm-1">{meeting.title}</h4>
            <div>
              <UilCalendarAlt
                className="text-primary me-2"
                width={16}
                height={16}
              />
              <span className="font-semibold text-body-secondary fs-9">
                {meeting.date.from}
              </span>
              <span className="text-body-teritary text-opacity-85"> to </span>
              <span className="font-semibold text-body-secondary fs-9">
                {meeting.date.to}
              </span>
              <span className="text-body-secondary fs-9">
                {meeting.date.duration}
              </span>
            </div>
          </div>
          <Avatar.Group total={meeting.assigness.length} size="s">
            {meeting.assigness.slice(0, 4).map(assigne => (
              <Avatar key={assigne} size="s" src={assigne} />
            ))}
          </Avatar.Group>
        </div>
        <div className="flex align-items-center">
          <Badge
            variant={meeting.badge.variant}
            bg={meeting.badge.bg}
            className="me-2"
          >
            {meeting.badge.text}
          </Badge>
          <div className="flex align-items-center flex-1">
            <
              icon={faCircle}
              transform="shrink-6 up-1"
              className={`text-${meeting.priority.color} me-1`}
            />
            <span className="font-bold fs-9 text-body">
              {meeting.priority.label}
            </span>
          </div>
          <Button
            variant="phoenix-primary"
            startIcon={
              <
                icon={faVideo}
                className="me-2 d-none d-sm-inline-block"
              />
            }
          >
            Join
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MeetingCard;
