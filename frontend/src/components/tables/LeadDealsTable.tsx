import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from 'components/base/AdvanceTable';
import { currencyFormat, getProgressColorVariant } from 'helpers/utils';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import { Link } from 'react-router-dom';
import AdvanceTableFooter from 'components/base/AdvanceTableFooter';
import { LeadDeal, leadDealsTableData } from 'data/crm/leadsData';
import RevealDropdown, {
  RevealDropdownTrigger
} from 'components/base/RevealDropdown';
import ActionDropdownItems from 'components/common/ActionDropdownItems';
import Badge, { BadgeBg } from 'components/base/Badge';
import { ProgressBar } from 'react-bootstrap';

const getBadgeBg = (label: string): BadgeBg => {
  switch (label) {
    case 'won deal':
    case 'cold':
      return 'success';

    case 'new deal':
      return 'primary';

    case 'canceled':
      return 'secondary';

    case 'in progress':
    case 'warm':
      return 'info';

    case 'hot':
      return 'danger';

    default:
      return 'primary';
  }
};

const columns: ColumnDef<LeadDeal>[] = [
  {
    header: 'deal name',
    accessorKey: 'name',
    cell: ({ row: { original } }) => (
      <Link to="#!" className="fw-semibold">
        {original.name}
      </Link>
    ),
    meta: {
      cellProps: { className: 'py-0 ps-0' },
      headerProps: { style: { width: '15%', minWidth: 200 }, className: 'px-0' }
    }
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row: { original } }) => currencyFormat(original.amount),
    meta: {
      headerProps: {
        style: { minWidth: 100, width: '15%' },
        className: 'text-end pe-6'
      },
      cellProps: {
        className: 'text-start fw-bold text-body-tertiary text-end pe-6'
      }
    }
  },
  {
    accessorKey: 'stage',
    header: 'Stage',
    cell: ({ row: { original } }) => (
      <Badge variant="phoenix" bg={getBadgeBg(original.stage)}>
        {original.stage}
      </Badge>
    ),
    meta: {
      headerProps: { style: { minWidth: 200, width: '20%' } }
    }
  },
  {
    accessorKey: 'probability',
    header: 'Probability',
    cell: ({ row: { original } }) => {
      const { probability } = original;
      const variant = getProgressColorVariant(probability);
      return (
        <>
          <p className="text-body-secondary fs-10 mb-0">{probability}%</p>
          <ProgressBar
            now={probability}
            style={{ height: 3 }}
            variant={variant}
            className="bg-primary-subtle"
          />
        </>
      );
    },
    meta: {
      headerProps: { style: { minWidth: 100, width: '20%' } },
      cellProps: { className: 'text-body-tertiary fw-semibold' }
    }
  },
  {
    accessorKey: 'closing_date',
    header: () => 'Closing date',
    meta: {
      headerProps: {
        style: { minWidth: 120, width: '15%' },
        className: 'text-end'
      },
      cellProps: { className: 'text-body-tertiary text-center' }
    }
  },
  {
    accessorKey: 'type',
    header: () => 'Type',
    cell: ({ row: { original } }) => (
      <Badge variant="phoenix" bg={getBadgeBg(original.type)}>
        {original.type}
      </Badge>
    ),
    meta: {
      headerProps: {
        style: { minWidth: 140, width: '15%' },
        className: 'text-end'
      },
      cellProps: { className: 'text-end fw-semibold' }
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
      headerProps: { style: { width: '15%' } },
      cellProps: { className: 'py-2' }
    }
  }
];

const LeadDealsTable = () => {
  const table = useAdvanceTable({
    data: leadDealsTableData,
    columns,
    pageSize: 5,
    pagination: true,
    sortable: true,
    selection: true
  });

  return (
    <div>
      <AdvanceTableProvider {...table}>
        <div className="border-y border-translucent">
          <AdvanceTable tableProps={{ className: 'phoenix-table fs-9' }} />
          <AdvanceTableFooter pagination />
        </div>
      </AdvanceTableProvider>
    </div>
  );
};

export default LeadDealsTable;
