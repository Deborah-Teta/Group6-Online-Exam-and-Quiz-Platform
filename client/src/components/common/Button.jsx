 
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
        px-6 py-3 bg-gradient-to-r from-[#0B609D] to-gray-500 
        rounded-full text-white flex items-center justify-center 
        gap-2.5 font-medium
        w-44 sm:w-52 md:w-64 lg:w-72 
        h-11 sm:h-12 md:h-14 
        text-sm sm:text-base md:text-lg 
        transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 hover:scale-105 active:scale-100'}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  )
}

export default Button
