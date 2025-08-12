/* eslint-disable @typescript-eslint/no-explicit-any */
import IndeterminateCheckbox from 'components/base/IndeterminateCheckbox';
import { PropsWithChildren } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  InitialTableState
} from '@tanstack/react-table';
interface UseAdvanceTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  selection?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  selectionColumnWidth?: number | string;
  initialState?: InitialTableState;
  state?: object;
  onPaginationChange?: any;
  manualPagination?: boolean;
  rowCount?: number;
  pageCount?: number;
}

const selectionColumn = {
  id: 'select',
  accessorKey: '',
  header: ({ table }: any) => (
    <IndeterminateCheckbox
      className="form-check fs-8 mb-0"
      {...{
        checked: table.getIsAllRowsSelected(),
        indeterminate: table.getIsSomeRowsSelected(),
        onChange: table.getToggleAllRowsSelectedHandler()
      }}
    />
  ),
  cell: ({ row }: any) => (
    <IndeterminateCheckbox
      className="form-check fs-8 mb-0"
      {...{
        checked: row.getIsSelected(),
        disabled: !row.getCanSelect(),
        indeterminate: row.getIsSomeSelected(),
        onChange: row.getToggleSelectedHandler()
      }}
    />
  ),
  meta: {
    headerProps: { style: { width: '30px' } }
  }
};

const useAdvanceTable = <T,>({
  columns,
  data,
  selection,
  sortable,
  pagination,
  pageSize,
  initialState,
  ...rest
}: PropsWithChildren<UseAdvanceTableProps<T>>) => {
  const state = {
    pagination: pagination
      ? { pageSize: pagination ? pageSize : data.length }
      : undefined,
    ...initialState
  };
  const table = useReactTable<T>({
    data,
    columns: selection ? [selectionColumn, ...columns] : columns,
    enableSorting: sortable,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: state,
    ...rest
  });

  return table;
};

export default useAdvanceTable;
