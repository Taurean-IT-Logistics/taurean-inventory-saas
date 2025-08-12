import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from 'components/base/AdvanceTable';
import AdvanceTableFooter from 'components/base/AdvanceTableFooter';
import Button from 'components/base/Button';
import {
  faBaby,
  faBath,
  faBed,
  faBorderAll,
  faFileExport,
  faFilter,
  faPersonShelter,
  faPlus,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import SearchBox from 'components/common/SearchBox';

import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import Badge from 'components/base/Badge';
import RevealDropdown, {
  RevealDropdownTrigger
} from 'components/base/RevealDropdown';
import ActionDropdownItems from 'components/common/ActionDropdownItems';
import {
  RoomListingData,
  RoomListingInterface
} from 'data/travel-agency/roomListing';

const columns: ColumnDef<RoomListingInterface>[] = [
  {
    id: 'roomInformation',
    header: 'room Information',
    accessorKey: 'name',

    cell: ({ row: { original } }) => {
      const { img, name, category, price } = original;
      return (
        <>
          <div className="d-flex align-items-center gap-3">
            <Link to="#!">
              <img
                src={img}
                alt=""
                width={80}
                className="rounded-1 border border-translucent"
              />
            </Link>
            <div>
              <Link
                to="#!"
                className="fs-8 fw-bolder text-body-emphasis text-nowrap"
              >
                {name}
              </Link>
              <h6 className="fw-seibold text-body text-nowrap mt-1 mb-2">
                <FontAwesomeIcon icon={faBorderAll} className="me-2" />
                {category}
              </h6>
              <h4 className="fw-bolder mb-0">${price}</h4>
            </div>
          </div>
        </>
      );
    },
    meta: {
      headerProps: { style: { width: 300 } },
      cellProps: { className: 'align-middle py-4' }
    }
  },
  {
    header: 'NO. of Beds',
    accessorKey: 'beds',

    cell: ({ row: { original } }) => {
      const { beds, bedRooms } = original;
      return (
        <div className="d-flex align-items-center">
          <div
            className="d-flex align-items-center justify-content-center bg-primary-subtle rounded me-2"
            style={{ height: 24, width: 24 }}
          >
            <FontAwesomeIcon
              icon={faPersonShelter}
              className="text-primary-darker"
            />
          </div>
          <h5 className="text-body-emphasis fw-semibold mb-0 me-3">
            {bedRooms}
          </h5>
          <div
            className="d-flex align-items-center justify-content-center bg-success-subtle rounded me-2"
            style={{ height: 24, width: 24 }}
          >
            <FontAwesomeIcon icon={faBed} className="text-success-darker" />
          </div>
          <h5 className="text-body-emphasis fw-semibold mb-0">{beds}</h5>
        </div>
      );
    },
    meta: {
      headerProps: {
        style: { width: 200 },
        className: 'text-body-tertiary align-middle px-4'
      },
      cellProps: { className: 'align-middle px-4' }
    }
  },
  {
    accessorKey: 'guest',
    header: 'NO. of Guests',
    cell: ({ row: { original } }) => {
      const { guest, child } = original;
      return (
        <div className="d-flex align-items-center">
          <div
            className="d-flex align-items-center justify-content-center bg-warning-subtle rounded me-2"
            style={{ height: 24, width: 24 }}
          >
            <FontAwesomeIcon icon={faUser} className="text-warning-darker" />
          </div>
          <h5 className="text-body-emphasis fw-semibold mb-0 me-3">{guest}</h5>
          <div
            className="d-flex align-items-center justify-content-center bg-info-subtle rounded me-2"
            style={{ height: 24, width: 24 }}
          >
            <FontAwesomeIcon icon={faBaby} className="text-info-darker" />
          </div>
          <h5 className="text-body-emphasis fw-semibold mb-0">{child}</h5>
        </div>
      );
    },
    meta: {
      headerProps: {
        style: { width: 200 },
        className: 'text-body-tertiary align-middle px-4'
      },
      cellProps: { className: 'align-middle px-4' }
    }
  },
  {
    accessorKey: 'bathrooms',
    header: 'Bathroom',
    cell: ({ row: { original } }) => {
      const { bathRooms } = original;
      return (
        <div className="d-flex align-items-center">
          <div
            className="d-flex align-items-center justify-content-center bg-danger-subtle rounded me-2"
            style={{ height: 24, width: 24 }}
          >
            <FontAwesomeIcon icon={faBath} className="text-danger-darker" />
          </div>
          <h5 className="text-body-emphasis fw-semibold mb-0 me-3">
            {bathRooms}
          </h5>
        </div>
      );
    },
    meta: {
      headerProps: {
        style: { width: 140 },
        className: 'text-body-tertiary align-middle px-4'
      },
      cellProps: { className: 'align-middle px-4' }
    }
  },
  {
    accessorKey: 'amenities',
    header: 'AMENITIES',
    enableSorting: false,
    cell: ({ row: { original } }) => {
      const { amenities } = original;
      return (
        <div className="d-flex flex-wrap gap-2">
          {amenities.slice(0, 13).map((item, index) => (
            <Badge
              key={index}
              variant="phoenix"
              bg="primary"
              className="text-body-highlight py-1 fs-10 border-0"
            >
              {item}
            </Badge>
          ))}
          {amenities.length > 13 && (
            <Link to="#!" className="fw-bold fs-9">
              +{amenities.length - 13} More
            </Link>
          )}
        </div>
      );
    },
    meta: {
      headerProps: {
        style: { minWidth: 450 },
        className: 'text-body-tertiary align-middle ps-4'
      },
      cellProps: { className: 'align-middle ps-4' }
    }
  },
  {
    accessorKey: 'totalRooms',
    header: 'Total Room',
    cell: ({ row: { original } }) => {
      const { totalRooms } = original;
      return <h2 className="text-body-secondary">{totalRooms}</h2>;
    },
    meta: {
      headerProps: {
        style: { width: 180 },
        className: 'text-body-tertiary align-middle text-end ps-4'
      },
      cellProps: { className: 'align-middle text-end ps-4' }
    }
  },
  {
    id: 'roomListingDropdown',
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
      headerProps: {
        className: 'text-body-tertiary align-middle text-end ps-4 pe-0'
      },
      cellProps: { className: 'align-middle ps-4' }
    }
  }
];
const RoomListingTable = () => {
  const table = useAdvanceTable({
    data: RoomListingData,
    columns,
    pageSize: 6,
    pagination: true,
    selection: true,
    selectionColumnWidth: '30px',
    sortable: true
  });

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    table.setGlobalFilter(e.target.value || undefined);
  };
  return (
    <AdvanceTableProvider {...table}>
      <div className="d-md-flex mt-5 mb-4">
        <Button
          variant="primary"
          startIcon={<FontAwesomeIcon icon={faPlus} className="me-2" />}
          className="me-4"
        >
          Create Listing
        </Button>
        <Button
          variant="link"
          startIcon={
            <FontAwesomeIcon icon={faFileExport} className="me-2 fs-9" />
          }
          className="text-body me-4 px-0"
        >
          Export
        </Button>
        <div className="d-flex gap-2 ms-md-auto mt-3 mt-md-0">
          <SearchBox
            placeholder="Search products"
            onChange={handleSearchInputChange}
          />
          <Button variant="phoenix-primary" className="px-3">
            <FontAwesomeIcon transform="down-2" icon={faFilter} />
          </Button>
        </div>
      </div>

      <AdvanceTable
        tableProps={{
          className: 'phoenix-table fs-9 mb-0 border-translucent'
        }}
        rowClassName="hover-actions-trigger btn-reveal-trigger position-static"
      />
      <AdvanceTableFooter navBtn />
    </AdvanceTableProvider>
  );
};

export default RoomListingTable;
