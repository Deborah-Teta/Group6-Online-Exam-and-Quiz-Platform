function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
}) {
  return (
    <div className="flex w-full flex-col gap-[7px] text-left">
      <label
        htmlFor={name}
        className="text-[12px] font-semibold leading-normal text-[#202536]"
      >
        {label}
        {required && " *"}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        className={`
          h-[44px] w-full rounded-[7px] border bg-white px-[12px]
          text-[14px] leading-[1.55] text-[#202536] placeholder:text-[#6d7180]
          outline-none transition-colors duration-200
          disabled:cursor-not-allowed disabled:bg-[#f0f0ea] disabled:text-[#6d7180]
          ${error ? "border-red-600" : "border-[#e3e4e8] focus:border-[#5149b8]"}
        `}
      />

      {error ? (
        <p className="text-[12px] leading-[1.55] text-red-600">{error}</p>
      ) : helperText ? (
        <p className="text-[12px] leading-[1.55] text-[#6d7180]">{helperText}</p>
      ) : null}
    </div>
  );
}

export default Input;
