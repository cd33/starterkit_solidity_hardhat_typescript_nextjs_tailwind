import { FC } from "react";

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  register?: any;
  errors?: any;
}

const Input: FC<InputProps> = ({
  label,
  placeholder,
  type,
  register,
  errors,
}) => (
  <div className="mb-4">
    <div className="flex items-center justify-center">
      {label && (
        <label htmlFor={type} className="text-base mr-3">
          {label} :
        </label>
      )}
      <input
        type={type}
        className="relative block overflow-hidden rounded-lg border border-gray-200 px-3 pt-3 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600"
        placeholder={placeholder}
        {...register(type, { required: true })}
      />
    </div>
    {type && errors[type] && (
      <span className="text-red-600 text-xs">{errors[type].message}</span>
    )}
  </div>
);

export default Input;
