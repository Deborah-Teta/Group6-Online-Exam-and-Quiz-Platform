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
            <div className="w-full flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-sm font-medium text-slate-700"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
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
        className={`
          w-full rounded-lg border bg-white px-4 py-3
          text-sm text-slate-900 placeholder:text-slate-400
          outline-none transition-all duration-200
          focus:ring-4 focus:ring-blue-100
          disabled:cursor-not-allowed disabled:bg-slate-100
          disabled:text-slate-400
          ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : "border-slate-200 focus:border-blue-600"
          }
        `}
      />
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}

    </div>
    )
}
export default Input;