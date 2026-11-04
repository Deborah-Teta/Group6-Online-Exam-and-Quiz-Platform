function Button({
  label,
  type = 'button',
  onClick,
  disabled = false,
  icon,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex h-[42px] items-center justify-center gap-[8px] rounded-[7px]
        bg-[#5149b8] px-[16px] text-[13px] font-semibold whitespace-nowrap text-white
        transition-colors duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#443da0]'}
      `}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  )
}

export default Button
