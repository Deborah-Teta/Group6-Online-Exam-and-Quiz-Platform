export const ALL_CLASSES = "all";

function ClassFilter({ classNames, value, onChange }) {
  return (
    <label className="flex shrink-0 items-center gap-[8px] text-[12px] leading-[1.55] text-[#6d7180]">
      Class
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[34px] cursor-pointer rounded-[7px] border border-[#e3e4e8] bg-white px-[8px] text-[12px] text-[#202536] outline-none focus:border-[#5149b8]"
      >
        <option value={ALL_CLASSES}>All classes</option>
        {classNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}

export default ClassFilter;
