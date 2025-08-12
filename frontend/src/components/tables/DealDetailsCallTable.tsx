import { faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColumnDef } from '@tanstack/react-table';
import classNames from 'classnames';
import AdvanceTable from 'components/base/AdvanceTable';
import AdvanceTableFooter from 'components/base/AdvanceTableFooter';
import Avatar from 'components/base/Avatar';
import RevealDropdown, {
  RevealDropdownTrigger
} from 'components/base/RevealDropdown';
import ActionDropdownItems from 'components/common/ActionDropdownItems';
import { CallTableDataType, callTableData } from 'data/crm/dealDetailsData';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import React from 'react';
import { Link } from 'react-router-dom';

const columns: ColumnDef<CallTableDataType>[] = [
  {
    accessorKey: 'user.name',
    header: 'Name',
    cell: ({ row: { original } }) => {
      const {
        user: { name, avatar, status }
      } = original;
      return (
        <Link
          to="/pages/members"
          className="d-flex align-items-center text-body-highlight"
        >
          <Avatar src={avatar} size="m" className="me-3" status={status} />
          <h6 className="mb-0 text-body-highlight fw-bold">{name}</h6>
        </Link>
      );
    },
    meta: {
      headerProps: {
        style: { width: '20%', minWidth: '100px' },
        className: 'pe-3 ps-0'
      },
      cellProps: { className: 'white-space-nowrap py-2 ps-0' }
    }
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row: { original } }) => original.description,
    meta: {
      headerProps: {
        style: { width: '20%', minWidth: '60px' },
        className: 'pe-6'
      },
      cellProps: {
        className:
          'white-space-nowrap text-start fw-bold text-body-tertiary py-2 pe-6'
      }
    }
  },
  {
    accessorKey: 'date',
    header: 'create date',
    cell: ({ row: { original } }) => original.date,
    meta: {
      headerProps: {
        style: { width: '20%', minWidth: '115px' },
        className: 'text-start'
      },
      cellProps: {
        className: 'white-space-nowrap text-body text-end'
      }
    }
  },
  {
    accessorKey: 'creatBy',
    header: 'create by',
    cell: ({ row: { original } }) => original.creatBy,
    meta: {
      headerProps: {
        style: { width: '20%', minWidth: '150px' },
        className: 'text-start'
      },
      cellProps: {
        className: 'white-space-nowrap fw-semibold text-body-highlight'
      }
    }
  },
  {
    accessorKey: 'activity',
    header: 'last activity',
    cell: ({ row: { original } }) => {
      return (
        <div className="d-flex align-items-center flex-1">
          <FontAwesomeIcon
            icon={faClock}
            className={classNames('me-1 ', {
              'text-success': original.activity === 'Active',
              'text-body-quaternary': original.activity !== 'Active'
            })}
            transform="shrink-2 up-1"
          />
          <span className="fw-bold fs-9 text-body">{original.activity}</span>
        </div>
      );
    },
    meta: {
      headerProps: {
        style: { width: '20%', minWidth: '115px' },
        className: 'ps-0 text-end'
      },
      cellProps: {
        className: 'white-space-nowrap fw-semibold text-body-highlight'
      }
    }
  },
  {
    id: 'dealDropdown',
    accessorKey: '',
    cell: () => {
      return (
        <RevealDropdownTrigger>
          <RevealDropdown>
            <ActionDropdownItems />
          </RevealDropdown>
        </RevealDropdownTrigger>
      );
    },
    meta: {
      headerProps: { style: { width: '15%' }, className: 'text-end' },
      cellProps: { className: 'pe-0 py-2' }
    }
  }
];

const DealDetailsCallTable = () => {
  const table = useAdvanceTable({
    data: callTableData,
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

export default DealDetailsCallTable;
