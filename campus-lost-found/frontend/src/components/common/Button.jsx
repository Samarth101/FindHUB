import { RADIUS } from '../../utils/constants';

const variants = {
  primary: 'bg-[#2d5da1] text-white border-[#2d2d2d] hover:bg-[#1e4a85]',
  secondary: 'bg-white text-[#2d2d2d] border-[#2d2d2d] hover:bg-gray-50',
  accent: 'bg-[#ff4d4d] text-white border-[#2d2d2d] hover:bg-[#e03e3e]',
  ghost: 'bg-transparent text-[#2d2d2d] border-transparent hover:bg-gray-100',
  danger: 'bg-red-600 text-white border-[#2d2d2d] hover:bg-red-700',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-base gap-2',
  lg: 'px-6 py-3 text-lg gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center font-bold border-2 transition-all duration-100 btn-press shadow-[2px_2px_0px_#2d2d2d] hover:shadow-[3px_3px_0px_#2d2d2d] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      style={{ borderRadius: RADIUS.wobblySm }}
      {...rest}
    >
      {children}
    </button>
  )
}