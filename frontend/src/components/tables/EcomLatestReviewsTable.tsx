import { useMemo } from 'react';
import {  } from '';
import {
  Check,
  faEllipsisH,
  faTrash
} from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { Col, Dropdown, Row } from 'components/ui';
import FeatherIcon from 'feather-icons-react';
import { formatDistanceToNow } from 'date-fns';

import AdvanceTable from 'components/base/AdvanceTable';
import AdvanceTableFooter from 'components/base/AdvanceTableFooter';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import useAdvanceTable from 'hooks/useAdvanceTable';
import Avatar from 'components/base/Avatar';
import Badge, { BadgeBg } from 'components/base/Badge';
import Button from 'components/base/Button';
import Rating from 'components/base/Rating';
import SearchBox from 'components/common/SearchBox';
import RevealDropdown from 'components/base/RevealDropdown';
import ActionDropdownItems from 'components/common/ActionDropdownItems';

import { Facility } from 'types'; // Ensure this points to your Facility type
import { ChangeEvent } from 'react';

interface ReviewRow {
  product: string;
  productImage: string;
  customer: {
    name: string;
    avatar?: string;
    variant: 'name' | 'image';
  };
  rating: number;
  review: string;
  status: {
    title: string;
    badgeBg: string;
    icon: string;
  };
  time: string;
}

interface Props {
  facilities: Facility[];
}

const EcomLatestReviewsTable = ({ facilities }: Props) => {
  const data: ReviewRow[] = useMemo(() => {
    return facilities.flatMap(facility =>
      facility.reviews.map(review => ({
        product: facility.name,
        productImage: facility.images?.[0]?.path ?? '/placeholder.jpg',
        customer: {
          name: review.user.name,
          avatar: '',
          variant: 'name'
        },
        rating: review.rating,
        review: review.comment,
        status: {
          title: review.isVerified ? 'Published' : 'Pending',
          badgeBg: review.isVerified ? 'success' : 'warning',
          icon: review.isVerified ? 'check-circle' : 'clock'
        },
        time: formatDistanceToNow(new Date(review.createdAt), {
          addSuffix: true
        })
      }))
    );
  }, [facilities]);

  const columns: ColumnDef<ReviewRow>[] = useMemo(
    () => [
      {
        id: 'productImage',
        accessorKey: '',
        cell: ({ row: { original } }) => (
          <Link to="#!" className="d-block rounded-2 border border-translucent">
            <img src={original.productImage} alt="" width={53} />
          </Link>
        ),
        meta: { cellProps: { className: 'py-0' } },
        enableSorting: false
      },
      {
        accessorKey: 'product',
        header: () => 'Product',
        cell: ({ row: { original } }) => (
          <Link to="#!" className="font-semibold">
            {original.product.length > 46
              ? original.product.slice(0, 46) + '...'
              : original.product}
          </Link>
        ),
        meta: { headerProps: { style: { minWidth: 360 }, className: 'py-2' } }
      },
      {
        accessorFn: ({ customer }) => customer.name,
        header: 'CUSTOMER',
        cell: ({ row: { original } }) => (
          <Link to="#!" className="flex align-items-center text-body">
            {original.customer.variant === 'name' ? (
              <Avatar size="l" variant="name">
                {original.customer.name[0]?.toUpperCase()}
              </Avatar>
            ) : (
              <Avatar
                src={original.customer.avatar}
                size="l"
                variant={original.customer.variant}
              />
            )}
            <h6 className="mb-0 ms-3 text-body">{original.customer.name}</h6>
          </Link>
        ),
        meta: { headerProps: { style: { minWidth: 200 } } }
      },
      {
        accessorKey: 'rating',
        header: 'RATING',
        cell: ({ row: { original } }) => (
          <Rating iconClass="fs-10" readonly initialValue={original.rating} />
        ),
        meta: { headerProps: { style: { minWidth: 110 } } }
      },
      {
        accessorKey: 'review',
        header: 'REVIEW',
        cell: ({ row: { original } }) => (
          <p className="fs--1 fw-semibold text-body-highlight mb-0 line-clamp-3">
            {original.review.slice(0, 134)}
            {original.review.length > 134 && (
              <>
                {'...'} <Link to="#!">See more</Link>
              </>
            )}
          </p>
        ),
        meta: { headerProps: { style: { minWidth: 350 } } }
      },
      {
        accessorFn: ({ status }) => status.title,
        header: 'STATUS',
        cell: ({ row: { original } }) => (
          <Badge
            bg={original.status.badgeBg as BadgeBg}
            variant="phoenix"
            iconPosition="end"
            className="fs-10"
            icon={
              <FeatherIcon
                icon={original.status.icon}
                size={12}
                className="ms-1"
              />
            }
          >
            {original.status.title}
          </Badge>
        ),
        meta: {
          headerProps: { className: 'ps-5' },
          cellProps: { className: 'ps-5' }
        }
      },
      {
        accessorKey: 'time',
        header: 'TIME',
        cell: ({ row: { original } }) => (
          <div className="hover-hide">
            <h6 className="text-body-highlight mb-0">{original.time}</h6>
          </div>
        ),
        meta: {
          headerProps: { className: 'text-end' },
          cellProps: { className: 'text-end white-space-nowrap' }
        }
      },
      {
        accessorKey: 'action',
        enableSorting: false,
        header: '',
        cell: () => (
          <>
            <div className="relative">
              <div className="hover-actions">
                <Button
                  variant="phoenix-secondary"
                  className="me-1 fs-10"
                  size="sm"
                >
                  < icon={Check} />
                </Button>
                <Button variant="phoenix-secondary" className="fs-10" size="sm">
                  < icon={faTrash} />
                </Button>
              </div>
            </div>
            <RevealDropdown btnClassName="fs-10">
              <ActionDropdownItems />
            </RevealDropdown>
          </>
        ),
        meta: { cellProps: { className: 'text-end' } }
      }
    ],
    []
  );

  const table = useAdvanceTable({
    data,
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
      <Row className="align-items-end justify-content-between pb-5 g-3">
        <Col xs="auto">
          <h3>Latest Reviews</h3>
          <p className="text-body-tertiary lh-sm mb-0">
            All recent feedback from multiple facilities.
          </p>
        </Col>
        <Col xs={12} md="auto">
          <Row className="g-2 gy-3">
            <Col xs="auto" className="flex-1">
              <SearchBox
                placeholder="Search..."
                size="sm"
                onChange={handleSearchInputChange}
              />
            </Col>
            <Col xs="auto" className="flex gap-2">
              <Button
                variant="phoenix-secondary"
                size="sm"
                className="bg-body-emphasis bg-body-hover"
              >
                All Reviews
              </Button>
              <Dropdown>
                <Dropdown.Toggle
                  variant="phoenix-secondary"
                  size="sm"
                  className="bg-body-emphasis bg-body-hover dropdown-caret-none"
                >
                  < icon={faEllipsisH} />
                </Dropdown.Toggle>
                <Dropdown.Menu align="end">
                  <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                  <Dropdown.Item href="#/action-2">
                    Another action
                  </Dropdown.Item>
                  <Dropdown.Item href="#/action-3">
                    Something else
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>
        </Col>
      </Row>

      <AdvanceTable
        tableProps={{
          className: 'phoenix-table fs-9 mb-0 border-top border-translucent'
        }}
        rowClassName="hover-actions-trigger btn-reveal-trigger position-static"
      />
      <AdvanceTableFooter navBtn />
    </AdvanceTableProvider>
  );
};

export default EcomLatestReviewsTable;
