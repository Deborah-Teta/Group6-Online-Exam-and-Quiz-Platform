// columns: [{ key, header, width, align, render(row) }]. Without render, shows row[key].
function DataTable({ columns, rows, emptyMessage = "Nothing to show." }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
            {columns.map(({ key, header, width, align }) => (
              <th
                key={key}
                scope="col"
                style={{ width }}
                className={`py-3 px-4 whitespace-nowrap ${align === "right" ? "text-right" : ""}`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50/60 transition">
              {columns.map(({ key, align, render }) => (
                <td
                  key={key}
                  className={`py-4 px-4 text-slate-700 ${align === "right" ? "text-right" : ""}`}
                >
                  {render ? render(row) : row[key]}
                </td>
              ))}
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-xs text-slate-400">
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
