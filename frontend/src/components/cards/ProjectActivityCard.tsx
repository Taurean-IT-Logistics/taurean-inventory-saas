import ActivityTimeline from 'components/timelines/ActivityTimeline';
import { activityTimelineData } from 'data/project-management/activityTimelineData';
import React from 'react';
import { Card } from 'react-bootstrap';

const ProjectActivityCard = () => {
  return (
    <Card className="h-100">
      <Card.Body>
        <Card.Title className="mb-1">
          <h3 className="text-body-emphasis">Activity</h3>
        </Card.Title>
        <p className="text-body-tertiary mb-4">
          Recent activity across all projects
        </p>
        <ActivityTimeline data={activityTimelineData} />
      </Card.Body>
    </Card>
  );
};

export default ProjectActivityCard;
