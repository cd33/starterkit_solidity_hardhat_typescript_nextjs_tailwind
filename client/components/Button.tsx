interface ButtonProps {
  label: string;
  value?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, value, onClick, disabled }) => (
  <button
    className="inline-block rounded border border-blue-400 bg-blue-400 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600 focus:outline-none focus:ring active:text-indigo-500"
    value={value}
    onClick={onClick}
    disabled={disabled}
  >
    {label}
  </button>
);

export default Button;
