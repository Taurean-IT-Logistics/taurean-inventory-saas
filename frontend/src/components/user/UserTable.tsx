import { Card, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTrash,
  faTrashRestore
} from '@fortawesome/free-solid-svg-icons';
import { Transaction, User } from 'types';
import SimplePaginatedList from 'booking/PaginatedComponent';

interface UserTableProps {
  users: User[];
  transactions: Transaction[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onRestore: (userId: string) => void;
}

const UserTable = ({
  users,
  transactions,
  onEdit,
  onDelete,
  onRestore
}: UserTableProps) => {
  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { bg: 'danger', text: 'Admin' },
      staff: { bg: 'warning', text: 'Staff' },
      user: { bg: 'primary', text: 'User' }
    };

    const config =
      roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const getLoyaltyTierBadge = (tier?: string) => {
    if (!tier) return <Badge bg="secondary">None</Badge>;

    const tierConfig = {
      bronze: { bg: 'secondary', text: 'Bronze' },
      silver: { bg: 'light', text: 'Silver' },
      gold: { bg: 'warning', text: 'Gold' },
      platinum: { bg: 'info', text: 'Platinum' }
    };

    const config =
      tierConfig[tier as keyof typeof tierConfig] || tierConfig.bronze;
    return (
      <Badge bg={config.bg} text={config.bg === 'light' ? 'dark' : undefined}>
        {config.text}
      </Badge>
    );
  };

  return (
    <Card className="border-secondary">
      <Card.Body className="px-2">
        <SimplePaginatedList
          data={users}
          itemsPerPage={5}
          emptyMessage="No users found."
          tableHeaders={
            <tr>
              <th>Details</th>
              <th>Role</th>
              <th>Tier</th>
              <th>Bookings</th>
              <th>Transactions</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          }
          renderRow={(user, index) => (
            <tr key={index}>
              <td>
                <div>
                  <div className="fw-semibold">{user.name}</div>
                  <small className="text-muted">{user.email}</small>
                  <div className="text-muted small">@{user.username}</div>
                </div>
              </td>
              <td>{getRoleBadge(user.role)}</td>
              <td>{getLoyaltyTierBadge(user.loyaltyProfile?.loyaltyTier)}</td>
              <td>
                <span>{user.loyaltyProfile?.totalBookings || 0}</span>
              </td>
              <td>
                <span>
                  {transactions.filter(t => t.user._id === user._id).length ||
                    0}
                </span>
              </td>
              <td>
                <span>
                  {new Date(user.createdAt)?.toLocaleDateString() || 'N/A'}
                </span>
              </td>
              <td>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onEdit(user)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                  {!user.isDeleted && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onDelete(user._id!)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  )}
                  {user.isDeleted && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => onRestore(user._id)}
                    >
                      <FontAwesomeIcon icon={faTrashRestore} />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          )}
        />
      </Card.Body>
    </Card>
  );
};

export default UserTable;
