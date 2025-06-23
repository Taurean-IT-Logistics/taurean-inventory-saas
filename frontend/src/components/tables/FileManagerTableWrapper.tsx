/* eslint-disable @typescript-eslint/no-explicit-any */
import AdvanceTableProvider from 'providers/AdvanceTableProvider';
import React, { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import {
  faFolder,
  faFileWord,
  faFileExcel,
  faFileInvoice,
  faFileZipper,
  faFilePdf,
  faFileCsv
} from '@fortawesome/free-solid-svg-icons';
import Avatar from 'components/base/Avatar';
import AvatarDropdown from 'components/common/AvatarDropdown';
import RevealDropdown, {
  RevealDropdownTrigger
} from 'components/base/RevealDropdown';
import { Dropdown } from 'react-bootstrap';
import useLightbox from 'hooks/useLightbox';
import Lightbox from 'components/base/LightBox';
import useAdvanceTable from 'hooks/useAdvanceTable';
import { File } from 'data/file-manager';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useRef } from 'react';
import { useFileManagerContext } from 'providers/FileManagerProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';

const RenderFileIcon = ({ file }: { file: File }) => {
  switch (file.type) {
    case 'folder':
      return (
        <FontAwesomeIcon
          icon={faFolder}
          className={classNames(
            'fs-9',
            file.id === 3 ? 'text-info-light' : 'text-body-tertiary'
          )}
        />
      );
    case 'doc':
      return (
        <FontAwesomeIcon
          icon={faFileWord}
          className="fs-9 text-body-tertiary"
        />
      );
    case 'xls':
    case 'xlx':
      return (
        <FontAwesomeIcon
          icon={faFileExcel}
          className="fs-9 text-body-tertiary"
        />
      );
    case 'source-code':
    case 'html':
      return (
        <FontAwesomeIcon
          icon={faFileInvoice}
          className="fs-9 text-body-tertiary"
        />
      );
    case 'zip':
      return (
        <FontAwesomeIcon
          icon={faFileZipper}
          className="fs-9 text-body-tertiary"
        />
      );
    case 'pdf':
      return (
        <FontAwesomeIcon icon={faFilePdf} className="fs-9 text-body-tertiary" />
      );
    case 'csv':
      return (
        <FontAwesomeIcon icon={faFileCsv} className="fs-9 text-body-tertiary" />
      );
    case 'image':
      return (
        <img
          className="w-100 h-100 pointer-events-none"
          src={file.img}
          alt=""
          style={{ aspectRatio: '16/9' }}
        />
      );
    case 'video':
      return (
        <img
          className="w-100 h-100 pointer-events-none"
          src={file.thumb}
          alt=""
          style={{ aspectRatio: '16/9' }}
        />
      );
    default:
      return null;
  }
};
const columns: ColumnDef<File>[] = [
  {
    id: 'Name',
    header: 'Name',
    accessorFn: ({ name }) => name,
    cell: ({ row }: any) => {
      const { original } = row;
      const file = original;
      const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

      const attachment = () => {
        if (file.type === 'pdf' && file.pdf) {
          return (
            <iframe
              key={file.name}
              src={file.pdf}
              title="PDF Viewer"
              width="1900px"
              height="1920px"
            />
          );
        }
        if (file.type === 'video' && file.video) {
          return file.video;
        }
        if (file.type === 'image' && file.img) {
          return file.img;
        }
        return '';
      };
      const { lightboxProps, openLightbox } = useLightbox([attachment()]);

      return (
        <>
          <Lightbox {...lightboxProps} />
          <Link
            to="#!"
            className={`d-flex align-items-center gap-3 fw-semibold text-body-highlight ${
              row.getIsSelected() ? 'file-checked' : ''
            }`}
            onClick={e => {
              if (clickTimeoutRef.current)
                clearTimeout(clickTimeoutRef.current);
              clickTimeoutRef.current = setTimeout(() => {
                row.getToggleSelectedHandler()(e);
              }, 250);
            }}
            onDoubleClick={e => {
              if (clickTimeoutRef.current)
                clearTimeout(clickTimeoutRef.current);
              if (['image', 'video', 'pdf'].includes(file.type)) {
                openLightbox(1);
                !row.getIsSelected() && row.getToggleSelectedHandler()(e);
              }
            }}
          >
            <div className="square-icon-box border border-translucent overflow-hidden position-relative">
              <RenderFileIcon file={original} />
            </div>
            <p className="mb-0">{original.name}</p>
          </Link>
        </>
      );
    },
    meta: {
      cellProps: { className: 'py-0 ps-0' },
      headerProps: {
        style: { minWidth: 210 },
        className: 'white-space-nowrap text-body-tertiary ps-0'
      }
    },
    enableSorting: true
  },
  {
    accessorKey: 'shared',
    header: 'Shared',
    cell: ({ row: { original } }) => {
      const data = original;
      return (
        <Avatar.Group size="s">
          {data.assignees.map((member, index) => (
            <AvatarDropdown
              key={index}
              user={{
                ...member,
                id: index,
                username: '',
                connections: 23,
                mutual: 4
              }}
              size="s"
            />
          ))}
        </Avatar.Group>
      );
    },
    enableSorting: false,
    meta: {
      headerProps: {
        style: { minWidth: 150 },
        className: 'py-2 text-body-tertiary'
      }
    }
  },
  {
    accessorKey: 'modified',
    header: 'Last Modified',
    cell: ({ row: { original } }) => {
      const { modified } = original;
      return <div className="">{modified}</div>;
    },
    meta: {
      headerProps: { style: { minWidth: 150 }, className: 'text-body-tertiary' }
    }
  },
  {
    accessorKey: 'size',
    header: 'File Size',
    cell: ({ row: { original } }) => {
      const { size, itemCount } = original;
      return <div>{size || itemCount}</div>;
    },
    meta: {
      headerProps: {
        style: { minWidth: 130 },
        className: 'text-body-tertiary'
      }
    }
  },
  {
    id: 'action',
    cell: () => (
      <RevealDropdownTrigger>
        <RevealDropdown>
          <Dropdown.Item href="#">Share</Dropdown.Item>
          <Dropdown.Item href="#">Download</Dropdown.Item>
          <Dropdown.Item href="#">Duplicate</Dropdown.Item>
          <Dropdown.Item href="#">Move</Dropdown.Item>
          <Dropdown.Item href="#">Rename</Dropdown.Item>
          <Dropdown.Item href="#">Move to Bin</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item href="#" className="text-danger">
            Delete
          </Dropdown.Item>
        </RevealDropdown>
      </RevealDropdownTrigger>
    ),
    meta: {
      headerProps: { style: { width: '10%' }, className: 'text-end' },
      cellProps: { className: 'text-end' }
    }
  }
];

const FileManagerTableWrapper = ({ children }: PropsWithChildren) => {
  const { fileCollection, setCheckedFileIds, isGridView } =
    useFileManagerContext();

  const table = useAdvanceTable<File>({
    data: fileCollection,
    columns,
    selection: true,
    selectionColumnWidth: '30px',
    sortable: true,
    state: {
      pagination: {
        pageIndex: 0,
        pageSize: fileCollection.length
      }
    }
  });

  useEffect(() => {
    if (!isGridView) {
      const allRows = table.getRowModel().rows.map(row => row.original);
      const selectedRows = table.getSelectedRowModel().flatRows;

      allRows.map(rows => {
        const isSelected = selectedRows
          .map(file => file.original.id)
          .includes(rows.id);
        setCheckedFileIds(prevFilesId =>
          isSelected
            ? !prevFilesId.includes(rows.id)
              ? [...prevFilesId, rows.id]
              : [...prevFilesId]
            : prevFilesId.filter(id => id !== rows.id)
        );
      });
    }
  }, [table.getState().rowSelection]);

  return <AdvanceTableProvider {...table}>{children}</AdvanceTableProvider>;
};

export default FileManagerTableWrapper;
