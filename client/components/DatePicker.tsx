import { useEffect, useState, FC } from "react";

interface DatePickerProps {
  label?: string;
  type?: string;
  register?: any;
  errors?: any;
}

const DatePicker: FC<DatePickerProps> = ({ label, type, register, errors }) => {
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);

  useEffect(() => {
    let start: any = new Date();
    let end: any = new Date();
    start.setDate(start.getDate() + 7);
    setStart(start);
    end.setDate(end.getDate() + 730);
    setEnd(end);
  }, []);

  return (
    <div className="flex flex-col mb-4">
      <div className="flex items-center justify-center">
        {label && (
          <label htmlFor={type} className="text-base mr-3">
            {label} :
          </label>
        )}
        <div className="datepicker relative form-floating">
          <input
            className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
            type={type}
            min={start?.toISOString().slice(0, 10)}
            max={end?.toISOString().slice(0, 10)}
            {...register(type, {
              required: true,
              setValueAs: (e: string) => new Date(e),
            })}
          />
        </div>
      </div>
      {type && errors[type] && (
        <span className="text-red-600 text-xs">{errors[type].message}</span>
      )}
    </div>
  );
};

export default DatePicker;
