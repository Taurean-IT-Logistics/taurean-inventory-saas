import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from 'components/base/AdvanceTable';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import { Link } from 'react-router-dom';
import AdvanceTableFooter from 'components/base/AdvanceTableFooter';
import Button from 'components/base/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Project, Status, projects } from 'data/project-management/projects';
import Avatar from 'components/base/Avatar';
import { OverlayTrigger, ProgressBar, Tooltip } from 'react-bootstrap';
import classNames from 'classnames';
import RevealDropdown, {
  RevealDropdownTrigger
} from 'components/base/RevealDropdown';
import ActionDropdownItems from 'components/common/ActionDropdownItems';
import AvatarDropdown from 'components/common/AvatarDropdown';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const columns: ColumnDef<Project>[] = [
  {
    accessorKey: 'name',
    header: 'Project Name',
    cell: ({ row: { original } }) => {
      const { name } = original;
      return (
        <Link
          to="/apps/project-management/project-details"
          className="text-decoration-none fw-bold fs-8"
        >
          {name}
        </Link>
      );
    },
    meta: {
      cellProps: { className: 'white-space-nowrap' },
      headerProps: { style: { width: '30%' } }
    }
  },
  {
    id: 'assigness',
    header: 'assigness',
    cell: ({ row: { original } }) => {
      const { assigness } = original;
      return (
        <Avatar.Group
          total={assigness.length}
          size="s"
          className="overflow-hidden"
        >
          {assigness.slice(0, 4).map(assigne => (
            <AvatarDropdown user={assigne} size="s" key={assigne.id} />
          ))}
        </Avatar.Group>
      );
    },
    meta: {
      cellProps: { className: 'ps-3' },
      headerProps: { style: { width: '10%' }, className: 'ps-3' }
    }
  },
  {
    header: 'Start date',
    accessorKey: 'start',
    meta: {
      cellProps: { className: 'ps-3 fs-9 text-body white-space-nowrap' },
      headerProps: { style: { width: '10%' }, className: 'ps-3' }
    }
  },
  {
    header: 'Deadline',
    accessorKey: 'deadline',
    meta: {
      cellProps: { className: 'ps-3 fs-9 text-body white-space-nowrap' },
      headerProps: { style: { width: '15%' }, className: 'ps-3' }
    }
  },
  {
    id: 'calculation',
    header: 'Calculation',
    cell: ({ row: { original } }) => {
      const { calculation } = original;
      if (calculation) {
        return (
          <>
            <p className="fw-bold text-body-emphasis fs-9 mb-0">
              {calculation?.amount}
            </p>
            <p className="fw-semibold fs-10 text-body-tertiary mb-0">
              {calculation?.label}
            </p>
          </>
        );
      }
      return (
        <Button variant="phoenix-secondary" className="btn-icon">
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      );
    },
    meta: {
      cellProps: { className: 'ps-3' },
      headerProps: { style: { width: '12%' }, className: 'ps-3' }
    }
  },
  {
    id: 'progress',
    header: 'Progress',
    cell: ({ row: { original } }) => {
      const { progress } = original;

      return (
        <>
          <p className="text-body-secondary fs-10 mb-0">
            {progress.min} / {progress.max}
          </p>
          <ProgressBar
            now={(progress.min / progress.max) * 100}
            style={{ height: 3 }}
            variant="success"
          />
        </>
      );
    },
    meta: {
      cellProps: { className: 'ps-3' },
      headerProps: { style: { width: '5%' }, className: 'ps-3' }
    }
  },
  {
    header: 'Status',
    id: 'status',
    cell: ({ row: { original } }) => {
      const { statusProgress } = original;

      return (
        <ProgressBar style={{ height: 3 }} className="progress-stack">
          {Object.keys(statusProgress).map(item => (
            <OverlayTrigger
              key={item}
              overlay={
                <Tooltip id={`tooltip-${item}`}>
                  {item === 'ongoing' && 'Active'}
                  {item === 'inactive' && 'Damage'}
                  {item === 'critical' && 'Pending'}
                  {item === 'completed' && 'Done'}
                </Tooltip>
              }
            >
              <ProgressBar
                variant={classNames({
                  success: item === 'completed',
                  info: item === 'ongoing',
                  danger: item === 'inactive',
                  warning: item === 'critical'
                })}
                now={statusProgress[item as keyof Status]}
                isChild
              />
            </OverlayTrigger>
          ))}
        </ProgressBar>
      );
    },
    meta: {
      cellProps: { className: 'ps-8' },
      headerProps: { style: { width: '10%' }, className: 'ps-8' }
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
      headerProps: { style: { width: '10%' }, className: 'text-end' },
      cellProps: { className: 'text-end' }
    }
  }
];

const ProjectDashboardTable = () => {
  const table = useAdvanceTable({
    data: projects,
    columns,
    pageSize: 6,
    pagination: true,
    sortable: true
  });

  return (
    <div>
      <AdvanceTableProvider {...table}>
        <AdvanceTable
          tableProps={{
            className: 'phoenix-table border-top border-translucent fs-9'
          }}
        />
        <AdvanceTableFooter pagination />
      </AdvanceTableProvider>
    </div>
  );
};

export default ProjectDashboardTable;
