import React from 'react';
import Loader from './Loader';

/**
 * Table component — composable with Table.Head, Table.Body, Table.Row, Table.Cell
 *
 * Or use the data-driven shorthand:
 *   <Table columns={[...]} data={[...]} />
 *
 * @param {Array}    columns  - [{ key, label, render?, className? }]
 * @param {Array}    data     - array of row objects
 * @param {boolean}  loading  - shows skeleton loader
 * @param {string}   emptyMsg - message when data is empty
 * @param {Function} onRowClick - called with row data on click
 */
const Table = ({
  columns,
  data,
  loading = false,
  emptyMsg = 'No records found.',
  onRowClick,
  className = '',
  children,
}) => {
  // Data-driven mode
  if (columns && data !== undefined) {
    return (
      <div className={`overflow-x-auto rounded-xl border border-slate-200 ${className}`}>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3 font-semibold text-slate-600 whitespace-nowrap ${col.className || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <Loader size="md" label="Loading data..." />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                  {emptyMsg}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  onClick={() => onRowClick?.(row)}
                  className={`bg-white transition-colors ${onRowClick ? 'cursor-pointer hover:bg-blue-50' : 'hover:bg-slate-50'}`}
                >
                  {columns.map(col => (
                    <td key={col.key} className={`px-4 py-3 text-slate-700 ${col.className || ''}`}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // Composable mode
  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-200 ${className}`}>
      <table className="w-full text-sm text-left">{children}</table>
    </div>
  );
};

Table.Head = ({ children }) => (
  <thead className="bg-slate-50 border-b border-slate-200">{children}</thead>
);

Table.Body = ({ children }) => (
  <tbody className="divide-y divide-slate-100">{children}</tbody>
);

Table.Row = ({ children, onClick, className = '' }) => (
  <tr
    onClick={onClick}
    className={`bg-white hover:bg-slate-50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </tr>
);

Table.HeadCell = ({ children, className = '' }) => (
  <th scope="col" className={`px-4 py-3 font-semibold text-slate-600 whitespace-nowrap ${className}`}>
    {children}
  </th>
);

Table.Cell = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-slate-700 ${className}`}>{children}</td>
);

export default Table;
