import React, { useState, useEffect, useMemo, ReactNode } from 'react';

interface SimplePaginatedListProps<T> {
  data: T[];
  itemsPerPage?: number;
  renderRow: (item: T, index: number) => ReactNode;
  tableHeaders: ReactNode;
  className?: string;
  emptyMessage?: string;
}

const SimplePaginatedList = <T,>({
  data = [],
  itemsPerPage = 10,
  renderRow,
  tableHeaders,
  className = '',
  emptyMessage = 'No data found.'
}: SimplePaginatedListProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () => Math.ceil(data.length / itemsPerPage),
    [data.length, itemsPerPage]
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [data.length, totalPages]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const buttons = [];

    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <li
          key={i}
          className={`page-item ${currentPage === i ? 'active' : ''}`}
        >
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </button>
        </li>
      );
    }

    return (
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-muted small">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, data.length)} of {data.length}{' '}
          entries
        </div>
        <nav>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>
            {buttons}
            <li
              className={`page-item ${
                currentPage === totalPages ? 'disabled' : ''
              }`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
  };

  return (
    <div className={className}>
      {data.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-muted">{emptyMessage}</p>
        </div>
      ) : (
        <>
          <div className="table-responsive border border-secondary rounded p-2">
            <table className="table table-hover mb-0">
              <thead>{tableHeaders}</thead>
              <tbody>
                {paginatedData.map((item, index) =>
                  renderRow(item, (currentPage - 1) * itemsPerPage + index)
                )}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default SimplePaginatedList;
