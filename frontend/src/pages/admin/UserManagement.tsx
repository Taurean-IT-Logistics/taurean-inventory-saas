import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { User } from 'types';
import UserStatsCards from 'components/user/UserStatsCard';
import UserFilters from 'components/user/UserFilters';
import UserTable from 'components/user/UserTable';
import EditUserModal from 'components/user/EditUserModal';
import { mockUser } from 'data';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([mockUser]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole && !user.isDeleted;
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedUser: User) => {
    setUsers(prev =>
      prev.map(user => (user.email === updatedUser.email ? updatedUser : user))
    );
  };

  const handleDelete = (userEmail: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev =>
        prev.map(user =>
          user.email === userEmail ? { ...user, isDeleted: true } : user
        )
      );
    }
  };

  return (
    <div className="min-vh-100">
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">User Management</h1>
            <p className="text-muted mb-0">
              Manage system users and their profiles
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/admin/create-user" className="btn btn-primary">
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Add New User
            </Link>
            <Link to="/admin" className="btn btn-outline-secondary">
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        <UserStatsCards users={users} />

        <UserFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          filteredCount={filteredUsers.length}
          totalCount={users.filter(u => !u.isDeleted).length}
        />

        <UserTable
          users={filteredUsers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <EditUserModal
          user={editingUser}
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
          onSave={handleSaveEdit}
        />
      </Container>
    </div>
  );
};

export default UserManagement;
