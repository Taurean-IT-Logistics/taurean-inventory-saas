import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from 'components/base/AdvanceTable';
import Badge, { BadgeBg } from 'components/base/Badge';
import { currencyFormat } from 'helpers/utils';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import { Link } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import AdvanceTableFooter from 'components/base/AdvanceTableFooter';
import RevealDropdown, {
  RevealDropdownTrigger
} from 'components/base/RevealDropdown';
import ActionDropdownItems from 'components/common/ActionDropdownItems';
import { Booking } from 'types';

// Dummy data for demonstration
const bookings: Booking[] = []; // Replace with your actual data

const statusMap: Record<
  Booking['status'],
  { label: string; color: string; icon: string }
> = {
  pending: { label: 'Pending', color: 'warning', icon: 'clock' },
  confirmed: { label: 'Confirmed', color: 'success', icon: 'check-circle' },
  cancelled: { label: 'Cancelled', color: 'danger', icon: 'x-circle' },
  completed: { label: 'Completed', color: 'primary', icon: 'check' },
  no_show: { label: 'No Show', color: 'secondary', icon: 'slash' }
};

const paymentStatusMap: Record<
  Booking['paymentStatus'],
  { label: string; color: string; icon: string }
> = {
  pending: { label: 'Pending', color: 'warning', icon: 'clock' },
  completed: { label: 'Completed', color: 'success', icon: 'check-circle' },
  failed: { label: 'Failed', color: 'danger', icon: 'x-circle' },
  refunded: { label: 'Refunded', color: 'info', icon: 'corner-up-left' },
  partial_refund: {
    label: 'Partial Refund',
    color: 'info',
    icon: 'corner-up-left'
  }
};

const columns: ColumnDef<Booking>[] = [
  {
    accessorKey: 'facility.name',
    header: 'Facility',
    cell: ({ row: { original } }) => (
      <Link to="#!" className="font-semibold text-primary">
        {original.facility?.name}
      </Link>
    ),
    meta: {
      headerProps: { style: { width: '18%', minWidth: 140 } },
      cellProps: { className: 'py-2' }
    }
  },
  {
    accessorKey: 'user.name',
    header: 'User',
    cell: ({ row: { original } }) => original.user?.name,
    meta: {
      headerProps: { style: { width: '15%', minWidth: 120 } }
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row: { original } }) => {
      const status = statusMap[original.status];
      return (
        <Badge
          bg={status.color as BadgeBg}
          variant="phoenix"
          iconPosition="end"
          className="fs-10"
          icon={<FeatherIcon icon={status.icon} size={12} className="ms-1" />}
        >
          {status.label}
        </Badge>
      );
    },
    meta: {
      headerProps: { style: { width: '13%', minWidth: 120 } }
    }
  },
  {
    accessorKey: 'paymentStatus',
    header: 'Payment',
    cell: ({ row: { original } }) => {
      const payment = paymentStatusMap[original.paymentStatus];
      return (
        <Badge
          bg={payment.color as BadgeBg}
          variant="phoenix"
          iconPosition="end"
          className="fs-10"
          icon={<FeatherIcon icon={payment.icon} size={12} className="ms-1" />}
        >
          {payment.label}
        </Badge>
      );
    },
    meta: {
      headerProps: { style: { width: '13%', minWidth: 120 } }
    }
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: ({ row: { original } }) =>
      original.startDate ? new Date(original.startDate).toLocaleString() : '',
    meta: {
      headerProps: {
        style: { width: '13%', minWidth: 140 },
        className: 'text-end'
      },
      cellProps: { className: 'text-body-tertiary text-end' }
    }
  },
  {
    accessorKey: 'endDate',
    header: 'End Date',
    cell: ({ row: { original } }) =>
      original.endDate ? new Date(original.endDate).toLocaleString() : '',
    meta: {
      headerProps: {
        style: { width: '13%', minWidth: 140 },
        className: 'text-end'
      },
      cellProps: { className: 'text-body-tertiary text-end' }
    }
  },
  {
    accessorKey: 'totalPrice',
    header: 'Total',
    cell: ({ row: { original } }) => currencyFormat(original.totalPrice),
    meta: {
      headerProps: {
        style: { width: '10%', minWidth: 100 },
        className: 'text-end'
      },
      cellProps: { className: 'fw-semibold text-end text-body-highlight' }
    }
  },
  {
    id: 'action',
    cell: () => (
      <RevealDropdownTrigger>
        <RevealDropdown>
          <ActionDropdownItems />
        </RevealDropdown>
      </RevealDropdownTrigger>
    ),
    meta: {
      headerProps: { style: { width: '5%' }, className: 'text-end' },
      cellProps: { className: 'text-end py-2' }
    }
  }
];

const EcomProfileOrdersTable = () => {
  const table = useAdvanceTable({
    data: bookings,
    columns,
    pageSize: 6,
    pagination: true,
    sortable: true
  });

  return (
    <div>
      <AdvanceTableProvider {...table}>
        <div className="border-y border-translucent">
          <AdvanceTable
            tableProps={{ size: 'sm', className: 'phoenix-table fs-9' }}
          />
          <AdvanceTableFooter pagination />
        </div>
      </AdvanceTableProvider>
    </div>
  );
};

export default EcomProfileOrdersTable;
