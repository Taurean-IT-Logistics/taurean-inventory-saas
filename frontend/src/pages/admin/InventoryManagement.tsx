import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { InventoryItem } from 'types';
import EditInventoryModal from 'components/inventory/EditInventoryModal';
import InventoryStatsCards from 'components/inventory/InventoryStatsCard';
import InventoryFilters from 'components/inventory/InventoryFilters';
import InventoryTable from 'components/inventory/InventoryTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';
import { InventoryItemController } from 'controllers';
import { useAppSelector } from 'hooks/useAppDispatch';
import { StateManagement } from 'lib';
import { showToast } from 'components/toaster/toaster';

const InventoryManagement = () => {
  const { tokens } = useAppSelector(
    (state: StateManagement.RootState) => state.auth
  );
  const accessToken = tokens.accessToken;
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    async function fetchData() {
      const data = await InventoryItemController.getAllInventoryItems();
      console.log(data);
      setItems(data.data);
    }

    fetchData();
  }, []);

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleSaveItem = async (
    updatedItem: InventoryItem,
    rawFiles: File[],
    removedImageIds: string[]
  ) => {
    try {
      const response = await InventoryItemController.updateItem(
        updatedItem._id,
        updatedItem,
        accessToken,
        rawFiles,
        removedImageIds
      );

      if (response.success) {
        // Update your local state
        setItems(prev =>
          prev.map(item =>
            item._id === updatedItem._id ? response.data : item
          )
        );

        showToast('success', 'Item updated successfully!');
      }

      console.log(response);
    } catch (error: any) {
      showToast('error', error.message || 'Failed to update item');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await InventoryItemController.deleteItem(
          itemId,
          accessToken
        );

        if (response.success) {
          setItems(prev =>
            prev.map(item =>
              item._id === itemId
                ? { ...item, isDeleted: !item.isDeleted }
                : item
            )
          );

          showToast('success', 'Item deleted successfully');
        }
      } catch (error) {
        showToast('error', error.message || 'Failed to delete item');
      }
    }
  };

  const handleRestore = async (itemId: string) => {
    try {
      const response = await InventoryItemController.restoreItem(
        itemId,
        accessToken
      );

      if (response.success) {
        setItems(prev =>
          prev.map(item =>
            item._id === itemId ? { ...item, isDeleted: !item.isDeleted } : item
          )
        );

        showToast('success', 'Item restored Succesfully');
      }
    } catch (error) {
      showToast('error', error.message || 'Failed to restore item');
    }
  };

  return (
    <div className="min-vh-100">
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">Inventory Management</h1>
            <p className="text-muted mb-0">
              Manage your facility equipment and items
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/admin/create-inventory-item" className="btn btn-primary">
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Add New Item
            </Link>
            <Link to="/admin" className="btn btn-outline-secondary">
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <InventoryStatsCards items={items} />

        {/* Filters */}
        <InventoryFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          filteredCount={filteredItems.length}
          totalCount={items.filter(i => !i.isDeleted).length}
        />

        {/* Items Table */}
        <InventoryTable
          items={filteredItems}
          onEdit={handleEdit}
          onRestore={handleRestore}
          onDelete={handleDelete}
        />

        {filteredItems.length === 0 && (
          <div className="text-center py-5">
            <i className="fas fa-search fs-1 text-muted mb-3"></i>
            <h5 className="text-muted">No items found</h5>
            <p className="text-muted">
              Try adjusting your search criteria or add new items.
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditInventoryModal
        item={editingItem}
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
      />
    </div>
  );
};

export default InventoryManagement;
