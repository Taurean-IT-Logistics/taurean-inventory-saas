import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from 'components/base/AdvanceTable';
import { Link } from 'react-router-dom';
import AdvanceTableFooter from 'components/base/AdvanceTableFooter';
import Avatar from 'components/base/Avatar';
import { Member } from 'data/members';

export const membersTablecolumns: ColumnDef<Member>[] = [
  {
    accessorKey: 'name',
    header: 'Member',
    cell: ({ row: { original } }) => {
      const { name, avatar } = original;
      return (
        <Link to="#!" className=" d-flex align-items-center text-body">
          <Avatar src={avatar} size="m" />
          <p className="mb-0 ms-3 text-body-emphasis fw-semibold">{name}</p>
        </Link>
      );
    },
    meta: {
      headerProps: {
        style: { width: '15%', minWidth: '200px' },
        className: 'px-1'
      },
      cellProps: { className: 'align-middle white-space-nowrap py-2' }
    }
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row: { original } }) => {
      const { email } = original;
      return (
        <Link to={`mailto:${email}`} className="fw-semibold">
          {email}
        </Link>
      );
    },
    meta: {
      headerProps: {
        style: { width: '15%', minWidth: '200px' }
      },
      cellProps: { className: 'white-space-nowrap' }
    }
  },
  {
    accessorKey: 'mobile',
    header: 'Mobile Number',
    cell: ({ row: { original } }) => {
      const { mobile } = original;
      return (
        <Link to={`tel:${mobile}`} className="fw-bold text-body-emphasis">
          {mobile}
        </Link>
      );
    },
    meta: {
      headerProps: {
        style: { width: '20%', minWidth: '200px' },
        className: 'pe-3'
      }
    }
  },
  {
    accessorKey: 'city',
    header: 'City',
    meta: {
      headerProps: { style: { width: '10%' } },
      cellProps: { className: 'text-body' }
    }
  },
  {
    accessorKey: 'lastActive',
    header: 'Last Active',
    meta: {
      headerProps: {
        style: { width: '21%', minWidth: '200px' },
        className: 'text-end'
      },
      cellProps: {
        className: 'text-end text-body-tertiary'
      }
    }
  },
  {
    accessorKey: 'joined',
    header: 'Joined',
    meta: {
      headerProps: {
        style: { width: '19%', minWidth: '200px' },
        className: 'text-end pe-0'
      },
      cellProps: {
        className: 'text-body-tertiary text-end'
      }
    }
  }
];

const MembersTable = () => {
  return (
    <div>
      <AdvanceTable tableProps={{ className: 'phoenix-table fs-9' }} />
      <AdvanceTableFooter pagination />
    </div>
  );
};

export default MembersTable;
