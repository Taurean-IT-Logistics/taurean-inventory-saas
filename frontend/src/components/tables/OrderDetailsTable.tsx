import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from 'components/base/AdvanceTable';
import { currencyFormat } from 'helpers/utils';
import useAdvanceTable from 'hooks/useAdvanceTable';
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import { Link } from 'react-router-dom';
import {
  WishlistProductType,
  wishlistProducts
} from 'data/e-commerce/products';
import { useMemo } from 'react';

const columns: ColumnDef<WishlistProductType>[] = [
  {
    id: 'productImage',
    accessorKey: '',
    cell: ({ row: { original } }) => {
      const { productImage } = original;
      return (
        <div className="rounded-2 border border-translucent d-inline-block">
          <img src={productImage} alt="" width={53} />
        </div>
      );
    },
    meta: { cellProps: { className: 'py-2' } }
  },
  {
    accessorKey: 'product',
    header: 'Products',
    cell: ({ row: { original } }) => {
      const { product } = original;
      return (
        <Link to="#!" className="fw-semibold line-clamp-2">
          {product}
        </Link>
      );
    },
    meta: {
      headerProps: { style: { minWidth: 380 } },
      cellProps: { className: '' }
    }
  },
  {
    accessorKey: 'color',
    header: 'Color',
    meta: {
      headerProps: { style: { width: 150 }, className: 'ps-4' },
      cellProps: { className: 'white-space-nowrap text-body ps-4' }
    }
  },
  {
    accessorKey: 'size',
    header: 'Size',
    meta: {
      headerProps: { style: { width: 300 }, className: 'ps-4' },
      cellProps: {
        className: 'white-space-nowrap text-body-tertiary fw-semibold ps-4'
      }
    }
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row: { original } }) => currencyFormat(original.price),
    meta: {
      headerProps: { style: { width: 150 }, className: 'ps-4 text-end' },
      cellProps: { className: 'text-body fw-semibold text-end ps-4' }
    }
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    meta: {
      headerProps: { style: { width: 200 }, className: 'ps-4 text-end' },
      cellProps: { className: 'text-end ps-4 text-body-tertiary' }
    }
  },
  {
    id: 'total',
    accessorFn: ({ price, quantity }) => price * quantity,
    header: 'Total',
    cell: ({ row: { original } }) =>
      currencyFormat(original.price * original.quantity),
    meta: {
      headerProps: { style: { width: 250 }, className: 'ps-4 text-end' },
      cellProps: { className: 'fw-bold text-body-highlight text-end ps-4' }
    }
  }
];

const OrderDetailsTable = () => {
  const table = useAdvanceTable({
    data: wishlistProducts,
    columns,
    pageSize: 6,
    pagination: true,
    sortable: true
  });

  const subtotal = useMemo(() => {
    return wishlistProducts.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [wishlistProducts]);

  return (
    <div>
      <AdvanceTableProvider {...table}>
        <div className="border-y border-translucent">
          <AdvanceTable tableProps={{ className: 'phoenix-table fs-9' }} />
          <div className="d-flex flex-between-center py-3">
            <p className="text-body-emphasis fw-semibold lh-sm mb-0">
              Items subtotal :
            </p>
            <p className="text-body-emphasis fw-bold lh-sm mb-0">
              {currencyFormat(subtotal)}
            </p>
          </div>
        </div>
      </AdvanceTableProvider>
    </div>
  );
};

export default OrderDetailsTable;
