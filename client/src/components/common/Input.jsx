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
    <div className="flex w-full flex-col gap-[6px] text-left">
      <label
        htmlFor={name}
        className="text-[12.5px] font-semibold leading-normal text-main"
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
          w-full rounded-sm border bg-card px-[12px] py-[8px]
          text-[13px] leading-normal text-main placeholder:text-subtle
          outline-none transition-colors duration-150
          disabled:cursor-not-allowed disabled:bg-surface-hover disabled:text-muted
          ${error ? "border-[var(--color-danger)]" : "border-line focus:border-primary"}
        `}
      />

      {error ? (
        <p className="text-[12px] leading-[1.5] text-[var(--color-danger-text)]">{error}</p>
      ) : helperText ? (
        <p className="text-[12px] leading-[1.5] text-muted">{helperText}</p>
      ) : null}
    </div>
  );
}

export default Input;
