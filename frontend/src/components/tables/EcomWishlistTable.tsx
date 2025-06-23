import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from 'components/base/AdvanceTable';
import { currencyFormat } from 'helpers/utils';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import { Link } from 'react-router-dom';
import AdvanceTableFooter from 'components/base/AdvanceTableFooter';
import Button from 'components/base/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faTrash } from '@fortawesome/free-solid-svg-icons';
import { InventoryItem, Facility } from 'types';

type TableItem = InventoryItem | Facility;

const isInventoryItem = (item: TableItem): item is InventoryItem =>
  (item as InventoryItem).quantity !== undefined;

const columns: ColumnDef<TableItem>[] = [
  {
    id: 'image',
    accessorKey: '',
    cell: ({ row: { original } }) => {
      const image = isInventoryItem(original)
        ? original.associatedFacility?.images?.[0]?.path
        : original.images?.[0]?.path;
      return image ? (
        <div className="rounded-2 border border-translucent d-inline-block">
          <img src={image} alt="" width={40} />
        </div>
      ) : null;
    },
    meta: {
      cellProps: { className: 'py-0' },
      headerProps: { style: { width: '7%' } }
    }
  },
  {
    accessorKey: 'name',
    header: 'Item',
    cell: ({ row: { original } }) => (
      <Link to="#!" className="fw-semibold line-clamp-1">
        {original.name}
      </Link>
    ),
    meta: {
      headerProps: { style: { minWidth: 250, width: '30%' } },
      cellProps: { className: 'pe-11' }
    }
  },
  {
    accessorKey: 'associatedFacility.name',
    header: 'Facility',
    cell: ({ row: { original } }) =>
      isInventoryItem(original)
        ? original.associatedFacility?.name || '-'
        : '-',
    meta: {
      headerProps: { style: { width: '16%' } },
      cellProps: { className: 'white-space-nowrap' }
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row: { original } }) =>
      isInventoryItem(original)
        ? original.status
        : original.isActive
        ? 'active'
        : 'inactive',
    meta: {
      headerProps: { style: { width: '10%' } },
      cellProps: { className: 'text-body-tertiary fw-semibold' }
    }
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    cell: ({ row: { original } }) =>
      isInventoryItem(original) ? original.quantity : '-',
    meta: {
      headerProps: { style: { width: '10%' }, className: 'text-end' },
      cellProps: { className: 'text-end fw-semibold' }
    }
  },
  {
    accessorKey: 'purchaseInfo.purchasePrice',
    header: 'Purchase Price',
    cell: ({ row: { original } }) =>
      isInventoryItem(original) && original.purchaseInfo?.purchasePrice
        ? currencyFormat(original.purchaseInfo.purchasePrice)
        : '-',
    meta: {
      headerProps: { style: { width: '10%' }, className: 'text-end' },
      cellProps: { className: 'text-end fw-semibold' }
    }
  },
  {
    id: 'action',
    cell: () => (
      <div className="d-flex gap-2 justify-content-end">
        <Button
          size="sm"
          className="text-body-quaternary text-body-tertiary-hover"
        >
          <FontAwesomeIcon icon={faTrash} />
        </Button>
        <Button
          variant="primary"
          className="fs-10 text-nowrap"
          startIcon={<FontAwesomeIcon icon={faShoppingCart} />}
        >
          Add to cart
        </Button>
      </div>
    ),
    meta: {
      headerProps: { style: { width: '35%' } }
    }
  }
];

const EcomWishlistTable = ({ data = [] }: { data: TableItem[] }) => {
  const table = useAdvanceTable({
    data,
    columns,
    pageSize: 5,
    pagination: true,
    sortable: true
  });

  return (
    <div>
      <AdvanceTableProvider {...table}>
        <div className="border-y border-translucent"></div>
        <AdvanceTable tableProps={{ className: 'phoenix-table fs-9' }} />
        <AdvanceTableFooter pagination />
      </AdvanceTableProvider>
    </div>
  );
};

export default EcomWishlistTable;
