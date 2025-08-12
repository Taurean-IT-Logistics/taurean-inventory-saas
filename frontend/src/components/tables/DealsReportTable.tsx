import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from 'components/base/AdvanceTable';
import {
  currencyFormat,
  getColor,
  getProgressColorVariant
} from 'helpers/utils';
import { Link } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import AdvanceTableFooter from 'components/base/AdvanceTableFooter';
import RevealDropdown, {
  RevealDropdownTrigger
} from 'components/base/RevealDropdown';
import ActionDropdownItems from 'components/common/ActionDropdownItems';
import { DealsReport } from 'data/crm/reportsData';
import Avatar from 'components/base/Avatar';
import { CSSProperties } from 'react';
import CircleProgress from 'components/icons/CircleProgress';
import classNames from 'classnames';

export const dealsReportColumns: ColumnDef<DealsReport>[] = [
  {
    accessorKey: 'dealName',
    header: 'Deal Name',
    cell: ({ row: { original } }) => (
      <Link to="#!" className="fw-bold text-primary">
        {original.dealName}
      </Link>
    ),
    meta: {
      headerProps: {
        style: { minWidth: 120 },
        className: 'pe-5 text-nowrap'
      },
      cellProps: {
        className: 'white-space-nowrap pe-5'
      }
    }
  },
  {
    id: 'deal_owner',
    accessorFn: ({ dealOwner }) => dealOwner.name,
    header: 'Deal Owner',
    cell: ({ row: { original } }) => {
      const { name, avatar, profileLink } = original.dealOwner;
      return (
        <Link to={profileLink} className="d-flex align-items-center text-body">
          <Avatar src={avatar} size="m" />
          <p className="mb-0 ms-3 text-body-emphasis fw-bold">{name}</p>
        </Link>
      );
    },
    meta: {
      headerProps: {
        style: { minWidth: 50 },
        className: 'pe-5 text-nowrap'
      },
      cellProps: { className: 'white-space-nowrap pe-5 py-0' }
    }
  },
  {
    accessorKey: 'accountName',
    header: 'Account Name',
    meta: {
      headerProps: {
        style: { minWidth: 250 },
        className: 'text-nowrap'
      },
      cellProps: {
        className: 'white-space-nowrap fw-semibold text-body'
      }
    }
  },
  {
    id: 'stage',
    accessorFn: ({ stage }) => stage.label,
    header: 'Stage',
    cell: ({ row: { original } }) => {
      const { label, value } = original.stage;
      return (
        <div className="d-flex align-items-center gap-3">
          <div
            style={{ '--phoenix-circle-progress-bar': value } as CSSProperties}
          >
            <CircleProgress color={getColor(getProgressColorVariant(value))} />
          </div>
          <h6 className="mb-0 text-body">{label}</h6>
        </div>
      );
    },
    meta: {
      headerProps: {
        style: { minWidth: 160 },
        className: 'pe-5 ps-4'
      },
      cellProps: {
        style: { paddingTop: 1, paddingBottom: 1 },
        className: 'white-space-nowrap fw-bold text-body pe-5 overflow-hidden'
      }
    }
  },
  {
    id: 'amount',
    accessorFn: ({ amount }) => amount.value,
    header: 'Amount',
    cell: ({ row: { original } }) => {
      const { value, trending } = original.amount;
      return (
        <>
          {currencyFormat(value)}
          <FeatherIcon
            icon={`trending-${trending}`}
            size={14}
            className={classNames('ms-2', {
              'text-success': trending === 'up',
              'text-danger': trending === 'down'
            })}
          />
        </>
      );
    },
    meta: {
      headerProps: {
        style: { minWidth: 50 },
        className: 'ps-4 pe-5'
      },
      cellProps: { className: 'white-space-nowrap fw-bold ps-4 text-body' }
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
      headerProps: {
        className: 'text-end ps-4'
      },
      cellProps: { className: 'text-end ps-4 py-0' }
    }
  }
];

const DealsReportTable = () => {
  return (
    <div>
      <div className="border-top border-translucent">
        <AdvanceTable
          tableProps={{ size: 'sm', className: 'phoenix-table fs-9' }}
        />
        <AdvanceTableFooter pagination className="pt-3" />
      </div>
    </div>
  );
};

export default DealsReportTable;
