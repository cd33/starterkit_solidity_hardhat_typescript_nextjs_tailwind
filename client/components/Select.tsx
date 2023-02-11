import { FC } from "react";
import { Controller } from "react-hook-form";

interface SelectProps {
  label?: string;
  options?: Array<object>;
  type?: string;
  errors?: any;
  control?: any;
}

const Select: FC<SelectProps> = ({ label, options, type, errors, control }) => {
  const optionsCategories = [
    { label: "Political", value: 0 },
    { label: "Financial", value: 1 },
    { label: "Social", value: 2 },
  ];
  const optionsSelect = options ? options : optionsCategories;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-center">
        {label && (
          <label htmlFor="select" className="text-base mr-3">
            {label} :
          </label>
        )}
        <Controller
          name={type!}
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className="block px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm w-52 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              onChange={(e) => field.onChange(parseInt(e.target.value))}
            >
              <option value={undefined}>Select a category</option>
              {optionsSelect.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        />
      </div>
      {type && errors && errors[type] && (
        <span className="text-red-600 text-xs">{errors[type].message}</span>
      )}
    </div>
  );
};

export default Select;
