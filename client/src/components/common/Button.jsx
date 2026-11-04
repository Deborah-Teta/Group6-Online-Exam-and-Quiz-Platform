const variants = {
  primary: {
    base: 'border-transparent bg-primary text-white',
    hover: 'hover:bg-primary-hover',
  },
  secondary: {
    base: 'border-line bg-card text-main',
    hover: 'hover:bg-surface-hover',
  },
};

function Button({
  label,
  type = 'button',
  onClick,
  disabled = false,
  icon,
  variant = 'primary',
}) {
  const { base, hover } = variants[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-[6px] rounded-sm border
        px-[16px] py-[7px] text-[12.5px] font-semibold leading-normal whitespace-nowrap
        transition-colors duration-150
        ${base}
        ${disabled ? 'opacity-50 cursor-not-allowed' : `cursor-pointer ${hover}`}
      `}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  )
}

export default Button
