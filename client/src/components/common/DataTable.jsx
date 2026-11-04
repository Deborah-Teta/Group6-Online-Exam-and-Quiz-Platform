const cellSpacing = "px-[8px] first:pl-[14px] last:pr-[14px]";

// columns: [{ key, header, width, render(row) }]. Without render, shows row[key].
function DataTable({ columns, rows, emptyMessage = "Nothing to show." }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="h-[42px] border-b border-[#e3e4e8] bg-[#f7f7f2]">
            {columns.map(({ key, header, width }) => (
              <th
                key={key}
                scope="col"
                style={{ width }}
                className={`${cellSpacing} text-[11px] font-semibold leading-normal text-[#6d7180]`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="h-[62px] border-b border-[#e3e4e8]">
              {columns.map(({ key, render }) => (
                <td
                  key={key}
                  className={`${cellSpacing} py-[13px] text-[13px] leading-[1.55] text-[#202536]`}
                >
                  {render ? render(row) : row[key]}
                </td>
              ))}
            </tr>
          ))}

          {rows.length === 0 && (
            <tr className="border-b border-[#e3e4e8]">
              <td
                colSpan={columns.length}
                className="px-[14px] py-[24px] text-center text-[13px] leading-[1.55] text-[#6d7180]"
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
