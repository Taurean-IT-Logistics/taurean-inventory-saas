import { faSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from 'components/base/AdvanceTable';
import {
  ForecastTableData,
  dealForecastTableData
} from 'data/crm/dashboardData';
import { currencyFormat, numberFormat } from 'helpers/utils';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import { Link } from 'react-router-dom';

const columns: ColumnDef<ForecastTableData>[] = [
  {
    header: 'Contacts',
    accessorFn: rowData => rowData.contact.name,
    cell: ({ row: { original } }) => {
      const { contact } = original;
      return (
        <Link to={contact.profileLink} className="fw-semibold">
          {contact.name}
        </Link>
      );
    },
    meta: {
      headerProps: {
        style: { width: '15%', minWidth: '100px' },
        className: 'text-start text-body-tertiary'
      },
      cellProps: { className: 'pe-3 white-space-nowrap py-2' },
      footerProps: {
        className: 'text-end px-3 border-bottom-0'
      }
    }
  },
  {
    id: 'appointment',
    header: () => (
      <div className="d-inline-flex flex-center gap-2">
        <FontAwesomeIcon icon={faSquare} className="fs-11 text-primary" />
        Appoinment
      </div>
    ),
    accessorKey: 'appointment',
    cell: ({ row: { original } }) => numberFormat(original.appointment),
    meta: {
      headerProps: {
        style: { width: '15%', minWidth: '95px' },
        className: 'text-end px-3 text-body-tertiary'
      },
      cellProps: {
        className: 'text-end fw-semibold text-body py-2 px-3'
      },
      footerProps: {
        className: 'text-end px-3 border-bottom-0'
      }
    },
    footer: ({ table }) =>
      numberFormat(
        table
          .getFilteredRowModel()
          .rows.reduce(
            (total, row) => total + (row.getValue('appointment') as number),
            0
          )
      )
  },
  {
    id: 'qualified',
    header: () => (
      <div className="d-inline-flex flex-center gap-2">
        <FontAwesomeIcon icon={faSquare} className="fs-11 text-primary-light" />
        Qualified
      </div>
    ),
    accessorKey: 'qualified',
    cell: ({ row: { original } }) => currencyFormat(original.qualified),
    meta: {
      headerProps: {
        style: { width: '20%', minWidth: '100px' },
        className: 'text-end px-3 text-body-tertiary'
      },
      cellProps: {
        className: 'text-end fw-semibold text-body py-2 px-3'
      },
      footerProps: {
        className: 'text-end px-3 py-2'
      }
    },
    footer: ({ table }) =>
      currencyFormat(
        table
          .getFilteredRowModel()
          .rows.reduce(
            (total, row) => total + (row.getValue('qualified') as number),
            0
          )
      )
  },
  {
    id: 'closed_won',
    header: () => (
      <div className="d-inline-flex flex-center gap-2">
        <FontAwesomeIcon icon={faSquare} className="fs-11 text-success" />
        Closed Won
      </div>
    ),
    accessorKey: 'closed_won',
    cell: ({ row: { original } }) => currencyFormat(original.closed_won),
    meta: {
      headerProps: {
        style: { width: '20%', minWidth: '100px' },
        className: 'text-end px-3 text-body-tertiary'
      },
      cellProps: {
        className: 'text-end fw-semibold text-body py-2 px-3'
      },
      footerProps: {
        className: 'text-end px-3'
      }
    },
    footer: ({ table }) =>
      currencyFormat(
        table
          .getFilteredRowModel()
          .rows.reduce(
            (total, row) => total + (row.getValue('closed_won') as number),
            0
          )
      )
  },
  {
    id: 'contact_sent',
    header: () => (
      <div className="d-inline-flex flex-center gap-2">
        <FontAwesomeIcon icon={faSquare} className="fs-11 text-info" />
        Contact Sent
      </div>
    ),
    accessorKey: 'contact_sent',
    cell: ({ row: { original } }) => currencyFormat(original.contact_sent),
    meta: {
      headerProps: {
        style: { width: '20%', minWidth: '100px' },
        className: 'text-end text-body-tertiary'
      },
      cellProps: {
        className: 'text-end fw-semibold text-body py-2 ps-3'
      },
      footerProps: {
        className: 'text-end ps-3 pe-0 border-bottom-0'
      }
    },
    footer: ({ table }) =>
      currencyFormat(
        table
          .getFilteredRowModel()
          .rows.reduce(
            (total, row) => total + (row.getValue('contact_sent') as number),
            0
          )
      )
  }
];

const DealForecastTable = () => {
  const table = useAdvanceTable({
    data: dealForecastTableData,
    columns,
    pageSize: 5,
    pagination: true,
    selectionColumnWidth: '30px',
    sortable: true
  });

  return (
    <AdvanceTableProvider {...table}>
      <AdvanceTable
        hasFooter
        tableProps={{
          size: 'sm',
          className: 'phoenix-table phoenix-table-bordered fs-9 mb-0 border-top'
        }}
      />
    </AdvanceTableProvider>
  );
};

export default DealForecastTable;
