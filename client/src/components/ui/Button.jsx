// components/Button.jsx
import './Button.css'

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}
