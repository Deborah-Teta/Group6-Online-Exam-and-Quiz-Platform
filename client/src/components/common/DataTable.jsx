// columns: [{ key, header, width, render(row) }]. Without render, shows row[key].
function DataTable({ columns, rows, emptyMessage = "Nothing to show." }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left text-[13px]">
        <thead>
          <tr>
            {columns.map(({ key, header, width }) => (
              <th
                key={key}
                scope="col"
                style={{ width }}
                className="border-b border-line bg-page px-[18px] py-[11px] text-[11px] font-semibold uppercase tracking-[0.5px] whitespace-nowrap text-muted"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-surface-subtle">
              {columns.map(({ key, render }) => (
                <td
                  key={key}
                  className="border-b border-line-subtle px-[18px] py-[13px] align-middle leading-normal text-main"
                >
                  {render ? render(row) : row[key]}
                </td>
              ))}
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-[20px] py-[40px] text-center text-[13px] leading-normal text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
