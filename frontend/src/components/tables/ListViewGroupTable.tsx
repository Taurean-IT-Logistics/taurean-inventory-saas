import classNames from 'classnames';
import { useAdvanceTableContext } from 'providers/AdvanceTableProvider';
import { Table, TableProps } from 'react-bootstrap';
import { flexRender } from '@tanstack/react-table';
import { File } from 'data/file-manager';
import React from 'react';

interface AdvanceTableProps {
  headerClassName?: string;
  bodyClassName?: string;
  rowClassName?: string;
  tableProps?: TableProps;
  hasFooter?: boolean;
}

const ListViewGroupTable = ({
  headerClassName,
  bodyClassName,
  rowClassName,
  tableProps
}: AdvanceTableProps) => {
  const table = useAdvanceTableContext();
  const { getRowModel, getFlatHeaders } = table;
  const fileTypes = ['folder', 'image', 'video', 'doc', 'zip', 'csv', 'xlx'];
  const rows = getRowModel().rows;
  const folderRows = rows.filter(
    row => (row.original as File).type === 'folder'
  );
  const imageRows = rows.filter(row => (row.original as File).type === 'image');
  const videoRows = rows.filter(row => (row.original as File).type === 'video');
  const fileRows = rows.filter(row =>
    ['doc', 'zip', 'csc', 'xlx'].includes((row.original as File).type)
  );
  const otherRows = rows.filter(
    row => !fileTypes.some(type => (row.original as File).type.includes(type))
  );
  const tableGroups = [
    {
      title: 'Folder',
      rows: folderRows
    },
    {
      title: 'Images',
      rows: imageRows
    },
    {
      title: 'Video',
      rows: videoRows
    },
    {
      title: 'Files',
      rows: fileRows
    },
    {
      title: 'Others',
      rows: otherRows
    }
  ];
  return (
    <div className="scrollbar ms-n1 ps-1">
      <Table {...tableProps}>
        <thead className={headerClassName}>
          <tr>
            {getFlatHeaders().map(header => {
              return (
                <th
                  key={header.id}
                  {...header.column.columnDef.meta?.headerProps}
                  className={classNames(
                    header.column.columnDef.meta?.headerProps?.className,
                    {
                      sort: header.column.getCanSort(),
                      desc: header.column.getIsSorted() === 'desc',
                      asc: header.column.getIsSorted() === 'asc'
                    }
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className={bodyClassName}>
          {tableGroups.map(({ title, rows }) =>
            rows.length > 0 ? (
              <React.Fragment key={title}>
                <tr>
                  <td colSpan={table.getAllColumns().length}>
                    <h4 className="mt-2 mb-0">{title}</h4>
                  </td>
                </tr>
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={classNames(rowClassName, {
                      'list-group-last-item': rows.length - 1 === index
                    })}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td
                        key={cell.id}
                        {...cell.column.columnDef.meta?.cellProps}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ) : null
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ListViewGroupTable;
