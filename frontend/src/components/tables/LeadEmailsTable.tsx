import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from 'components/base/AdvanceTable';
import { Link } from 'react-router-dom';
import AdvanceTableFooter from 'components/base/AdvanceTableFooter';
import { LeadEmail } from 'data/crm/leadsData';
import Badge, { BadgeBg } from 'components/base/Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';

const getBadgeBg = (label: string): BadgeBg => {
  switch (label) {
    case 'sent':
      return 'success';

    case 'delivered':
      return 'info';

    case 'spam':
      return 'danger';

    case 'bounced':
      return 'warning';

    default:
      return 'primary';
  }
};

export const leadEmailsColumns: ColumnDef<LeadEmail>[] = [
  {
    header: 'Subject',
    accessorFn: ({ mail }) => mail.subject,
    cell: ({
      row: {
        original: { mail }
      }
    }) => (
      <>
        <Link to="#!" className="fw-semibold">
          {mail.subject}
        </Link>
        <p className="mb-0 fs-10">{mail.email}</p>
      </>
    ),
    meta: {
      headerProps: {
        style: { width: '30%', minWidth: 350 },
        className: 'ps-0'
      },
      cellProps: { className: 'py-2 ps-0' }
    }
  },
  {
    accessorKey: 'sentBy',
    header: 'Sent By',
    meta: {
      headerProps: {
        style: { minWidth: 130, width: '15%' },
        className: 'pe-3'
      },
      cellProps: {
        className: 'fw-bold text-body-tertiary'
      }
    }
  },
  {
    accessorKey: 'date',
    header: 'Date',
    meta: {
      headerProps: { style: { minWidth: 165 } },
      cellProps: {
        className: 'text-body'
      }
    }
  },
  {
    id: 'action',
    header: 'Action',
    enableSorting: false,
    cell: ({
      row: {
        original: { action }
      }
    }) => (
      <>
        <FontAwesomeIcon icon={faPhone} className="text-primary me-2" />
        {action}
      </>
    ),
    meta: {
      headerProps: { style: { minWidth: 100, width: '15%' } }
    }
  },

  {
    id: 'label',
    header: 'Status',
    accessorFn: ({ status }) => status.label,
    cell: ({
      row: {
        original: { status }
      }
    }) => (
      <Badge variant="phoenix" bg={getBadgeBg(status.label)}>
        {status.label}
      </Badge>
    ),
    meta: {
      headerProps: {
        style: { minWidth: 100, width: '15%' },
        className: 'text-end'
      },
      cellProps: { className: 'text-end fw-semibold' }
    }
  },
  {
    accessorKey: 'type'
  }
];

const LeadEmailsTable = () => {
  return (
    <div className="border-y border-translucent">
      <AdvanceTable tableProps={{ className: 'phoenix-table fs-9' }} />
      <AdvanceTableFooter pagination showViewAllBtn={false} />
    </div>
  );
};

export default LeadEmailsTable;
