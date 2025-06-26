import { faClock } from '@fortawesome/free-regular-svg-icons';
import {
  faArrowRight,
  faFilter,
  faPlane,
  faTemperature0
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from 'components/base/AdvanceTable';
import Badge from 'components/base/Badge';
import Button from 'components/base/Button';
import SearchBox from 'components/common/SearchBox';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import React, { ChangeEvent } from 'react';
import { Col, ProgressBar, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import RevealDropdown from 'components/base/RevealDropdown';
import ActionDropdownItems from 'components/common/ActionDropdownItems';
import FlightsTableHeader from 'components/modules/travel-agency/dashboard/FlightsHeader';
import { FlightInterface, flightsData } from 'data/travel-agency/travelAgency';
import classNames from 'classnames';

const columns: ColumnDef<FlightInterface>[] = [
  {
    accessorKey: 'flightNo',
    header: 'Flights no.',
    cell: ({ row: { original } }) => {
      const { flightNo } = original;
      return (
        <Link to="#!" className="fw-bold">
          {flightNo}
        </Link>
      );
    },
    meta: {
      headerProps: {
        className: 'white-space-nowrap align-middle text-body-tertiary ps-0'
      },
      cellProps: { className: 'ps-0 align-middle' }
    }
  },
  {
    accessorFn: ({ vendor }) => vendor.name,
    header: 'Vendor',
    cell: ({ row: { original } }) => {
      const { vendor } = original;
      return (
        <Link to="#!" className="d-flex align-items-center gap-2">
          <img src={vendor.image} alt="" width={32} />
          <h6 className="mb-0 text-primary fw-semibold text-nowrap">
            {vendor.name}
          </h6>
        </Link>
      );
    },
    meta: {
      headerProps: {
        className: 'white-space-nowrap align-middle text-body-tertiary',
        style: { width: '170px' }
      },
      cellProps: { className: 'align-middle pe-5' }
    }
  },
  {
    accessorFn: ({ weather }) => weather.temperature,
    header: 'Weather',
    cell: ({ row: { original } }) => {
      const { weather } = original;
      return (
        <div className="d-flex align-items-center">
          <FontAwesomeIcon
            icon={faTemperature0}
            className={`me-2 text-${
              weather.temperature > 25 ? 'danger' : 'info'
            }`}
          />
          <p className="mb-0 text-body-tertiary me-3">
            {weather.temperature}°C
          </p>
          <FontAwesomeIcon
            icon={weather.icon}
            className={`me-2 ${weather.color}`}
          />
          <p className="mb-0 text-body-tertiary">{weather.weather}</p>
        </div>
      );
    },
    meta: {
      headerProps: {
        className: 'text-start align-middle text-body-tertiary',
        style: { width: '250px' }
      },
      cellProps: { className: 'align-middle pe-5' }
    }
  },
  {
    accessorFn: ({ route }) => route.from,
    header: 'Route',
    cell: ({ row: { original } }) => {
      const { route } = original;
      return (
        <div className="d-flex align-items-center gap-2">
          <img src={route.from.flag} alt="" width={16} />
          <p className="mb-0 fw-semibold text-bold">{route.from.airport}</p>
          <FontAwesomeIcon
            icon={faArrowRight}
            className="text-body-tertiary mx-1"
          />
          <p className="mb-0 fw-semibold text-bold">{route.to.airport}</p>
          <img src={route.to.flag} alt="" width={16} />
        </div>
      );
    },
    meta: {
      headerProps: {
        className: 'align-middle text-body-tertiary px-0 py-1',
        style: { width: '180px' }
      },
      cellProps: { className: 'align-middle pe-5' }
    }
  },
  {
    accessorFn: ({ destination }) => destination.percent,
    header: 'Destination',
    cell: ({ row: { original } }) => {
      const { destination, status } = original;
      return (
        <>
          <div className="position-relative">
            <ProgressBar
              style={{ height: 2 }}
              className="overflow-visible align-middle"
            >
              <ProgressBar
                now={destination.percent}
                min={0}
                max={100}
                variant="info-light"
              />
            </ProgressBar>
            <FontAwesomeIcon
              className={classNames(
                'text-info plane-icon position-absolute top-50 translate-middle-y',
                {
                  'd-none': status.label.toLowerCase() === 'cancelled'
                }
              )}
              icon={faPlane}
              style={{ left: `${destination.percent}%` }} // move along the progress bar
            />
          </div>

          <div className="d-flex justify-content-between mt-2">
            <p
              className={` mb-0 fs-10 ${
                status.label === 'Cancelled'
                  ? 'text-body-quaternary'
                  : 'text-body-tertiary'
              }`}
            >
              {destination.currentPosition}
            </p>
            <p
              className={` mb-0 fs-10 ${
                status.label === 'Cancelled'
                  ? 'text-body-quaternary'
                  : 'text-body-tertiary'
              }`}
            >
              {destination.target}
            </p>
          </div>
        </>
      );
    },
    meta: {
      headerProps: {
        className: 'align-middle text-body-tertiary',
        style: { minWidth: '280px' }
      },
      cellProps: { className: 'align-middle pe-5 pe-xxl-7' }
    }
  },
  {
    accessorFn: ({ status }) => status.label,
    header: 'Status',
    cell: ({ row: { original } }) => {
      const { status } = original;
      return (
        <Badge
          variant="phoenix"
          bg="primary"
          className={`badge-phoenix-${status.type}`}
        >
          {status.label}
        </Badge>
      );
    },
    meta: {
      headerProps: {
        className: 'text-end align-middle text-body-tertiary',
        style: { minWidth: '120px' }
      },
      cellProps: { className: 'text-end align-middle' }
    }
  },
  {
    accessorFn: ({ time }) => time.date,
    header: 'Time',
    cell: ({ row: { original } }) => {
      const { time } = original;
      return (
        <>
          <div className="d-flex justify-content-end align-items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faClock} className="text-body" />
            <span className="text-body fw-semibold">{time.time}</span>
          </div>
          <div className="d-flex justify-content-end gap-2">
            <FeatherIcon icon="calendar" style={{ width: 16, height: 16 }} />
            <span className="text-body fw-semibold">{time.date}</span>
          </div>
        </>
      );
    },
    meta: {
      headerProps: {
        className: 'text-end align-middle text-body-tertiary',
        style: { minWidth: '200px' }
      },
      cellProps: { className: 'text-end align-middle' }
    }
  },
  {
    accessorKey: 'action',
    enableSorting: false,
    header: '',
    cell: () => {
      return (
        <div className="btn-reveal-trigger">
          <RevealDropdown btnClassName="fs-10">
            <ActionDropdownItems />
          </RevealDropdown>
        </div>
      );
    },
    meta: {
      headerProps: {
        className: 'text-end pe-0'
      },
      cellProps: { className: 'text-end align-middle' }
    }
  }
];

const TravelFlightTable = () => {
  const table = useAdvanceTable({
    data: flightsData,
    columns,
    pageSize: 4,
    pagination: true,
    selection: true,
    sortable: true
  });

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    table.setGlobalFilter(e.target.value || undefined);
  };
  return (
    <AdvanceTableProvider {...table}>
      <Row className="gx-0 gy-3 align-items-center py-4">
        <Col xl="auto" className="d-sm-flex flex-between-center">
          <div className="mb-3 mb-sm-0">
            <h3 className="mb-0">Flights</h3>
            <p className="mb-0">Recent flights booked by us</p>
          </div>
          <div className="d-flex align-items-center">
            <SearchBox
              placeholder="Search by Flight no."
              className="ms-xl-6 w-100"
              onChange={handleSearchInputChange}
            />
            <Button variant="phoenix-secondary" className="px-3 ms-2 me-3">
              <FontAwesomeIcon
                icon={faFilter}
                transform="down-2"
                className="text-body-secondary"
              />
            </Button>
          </div>
        </Col>
        <Col xs="auto" className="flex-1">
          <div className="d-flex flex-between-center justify-content-xl-end">
            <div className="d-flex align-items-center">
              <FlightsTableHeader viewAllBtnClass="ms-auto" navBtn />
            </div>
          </div>
        </Col>
      </Row>
      <AdvanceTable
        tableProps={{
          className: 'phoenix-table fs-9 border-top border-translucent'
        }}
        rowClassName="hover-actions-trigger btn-reveal-trigger position-static"
      />
    </AdvanceTableProvider>
  );
};

export default TravelFlightTable;
