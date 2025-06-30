import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { User, Transaction } from 'types';
import UserStatsCards from 'components/user/UserStatsCard';
import UserFilters from 'components/user/UserFilters';
import UserTable from 'components/user/UserTable';
import EditUserModal from 'components/user/EditUserModal';
import { TransactionController, UserController } from 'controllers';
import { useAppSelector } from 'hooks/useAppDispatch';
import { StateManagement } from 'lib';
import { showToast } from 'components/toaster/toaster';

const UserManagement = () => {
  const { tokens } = useAppSelector(
    (state: StateManagement.RootState) => state.auth
  );

  const accessToken = tokens?.accessToken;
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    if (!accessToken) return;

    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        const [userData, transactionData] = await Promise.all([
          UserController.getAllusers(accessToken),
          TransactionController.getAllTransactions(accessToken)
        ]);

        setUsers((userData.data as any).users as User[]);
        setTransactions(transactionData.data as Transaction[]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [accessToken]);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedUser: User) => {
    if (!accessToken || !editingUser?._id) {
      console.error('Missing access token or user ID');
      return;
    }

    try {
      if (updatedUser.role) {
        updatedUser.role = updatedUser.role.toLowerCase().trim() as
          | 'staff'
          | 'admin'
          | 'user';
      }

      const response = await UserController.updateUser(
        editingUser._id,
        updatedUser,
        accessToken
      );

      if (response.success) {
        setUsers(prev =>
          prev.map(user =>
            user._id === editingUser._id ? { ...user, ...updatedUser } : user
          )
        );

        showToast('success', 'User updated successfully');

        setShowEditModal(false);
        setEditingUser(null);
      }
    } catch (error) {
      showToast('error', error.message || 'Failed to update user');
    }
  };

  const handleRestore = async (userId: string) => {
    const userToRestore = users.find(user => user._id === userId);
    if (!userToRestore || !accessToken) {
      showToast('error', 'User not found');
      return;
    }

    try {
      userToRestore.isDeleted = false;
      const response = await UserController.updateUser(
        userToRestore._id,
        userToRestore,
        accessToken
      );

      console.log(userToRestore);

      if (response.success) {
        showToast('success', 'User restored successfully');
        setUsers(prev =>
          prev.map(user =>
            user._id === userId ? { ...user, isDeleted: false } : user
          )
        );
      }
    } catch (error) {
      showToast('error', error.message || 'Failed to restore user');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    const userToDelete = users.find(user => user._id === userId);
    if (!userToDelete || !accessToken) {
      showToast('error', 'User not found or missing access token');
      return;
    }

    try {
      // If you have a delete endpoint, call it here
      const response = await UserController.deleteUser(
        userToDelete._id,
        accessToken
      );

      if (response.success) {
        setUsers(prev =>
          prev.map(user =>
            user._id === userId ? { ...user, isDeleted: false } : user
          )
        );

        showToast('success', 'User Deleted successfully');
      }
    } catch (error) {
      showToast('error', error.message || 'Failed to deleted user');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
          totalCount={users.length}
        />

        <UserTable
          transactions={transactions}
          users={filteredUsers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRestore={handleRestore}
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
