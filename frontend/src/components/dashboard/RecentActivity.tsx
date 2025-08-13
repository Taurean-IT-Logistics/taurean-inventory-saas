import { Card, Table, Badge } from 'components/ui';
import {  } from '';
import {
  faBox,
  Users,
  faBell,
  faBuilding
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'inventory' | 'user' | 'alert' | 'facility';
  action: string;
  description: string;
  timestamp: Date;
  user: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const RecentActivity = ({ activities }: RecentActivityProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'inventory':
        return faBox;
      case 'user':
        return Users;
      case 'alert':
        return faBell;
      case 'facility':
        return faBuilding;
      default:
        return faBox;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'inventory':
        return 'primary';
      case 'user':
        return 'info';
      case 'alert':
        return 'warning';
      case 'facility':
        return 'success';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="border-secondary">
      <Card.Header className="border-secondary">
        <h5 className="mb-0">Recent Activity</h5>
      </Card.Header>
      <Card.Body className="px-2">
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead>
              <tr>
                <th>Type</th>
                <th>Action</th>
                <th>Description</th>
                <th>User</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {activities.map(activity => (
                <tr key={activity.id}>
                  <td>
                    <Badge
                      bg={getActivityColor(activity.type)}
                      className="flex align-items-center"
                      style={{ width: 'fit-content' }}
                    >
                      <
                        icon={getActivityIcon(activity.type)}
                        className="me-1"
                      />
                      {activity.type}
                    </Badge>
                  </td>
                  <td className="font-semibold">{activity.action}</td>
                  <td className="text-gray-600 dark:text-gray-400">{activity.description}</td>
                  <td>{activity.user}</td>
                  <td className="text-gray-600 dark:text-gray-400 small">
                    {activity.timestamp.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        {activities.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-600 dark:text-gray-400 mb-0">No recent activity</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default RecentActivity;
