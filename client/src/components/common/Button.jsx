const variants = {
  primary: {
    base: 'border-transparent bg-[#5149b8] text-white',
    hover: 'hover:bg-[#443da0]',
  },
  secondary: {
    base: 'border-[#e3e4e8] bg-white text-[#202536]',
    hover: 'hover:bg-[#f7f7f2]',
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
        flex h-[42px] items-center justify-center gap-[8px] rounded-[7px] border
        px-[16px] text-[13px] font-semibold whitespace-nowrap
        transition-colors duration-200
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
