import { ReactNode } from "react";

export interface Column<T> {
  key:       string;
  header:    string;
  cell:      (row: T, index: number) => ReactNode;
  width?:    string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns:    Column<T>[];
  data:       T[];
  keyExtract: (row: T, index: number) => string;
  empty?:     ReactNode;
}

export function DataTable<T>({ columns, data, keyExtract, empty }: DataTableProps<T>) {
  if (data.length === 0 && empty) {
    return <>{empty}</>;
  }
  return (
    <div className="overflow-x-auto -mx-px">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={keyExtract(row, i)}>
              {columns.map((col) => (
                <td key={col.key}>{col.cell(row, i)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
