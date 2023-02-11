// import { useState } from "react";
// import { Controller } from "react-hook-form";

// interface Props {
//   label: string;
//   type?: string;
//   errors?: any;
//   control?: any;
//   maxInput: number;
// }

// const InputWithAddButton: React.FC<Props> = ({
//   label,
//   type,
//   errors,
//   control,
//   maxInput,
// }) => {
//   const [serviceList, setServiceList] = useState(["", ""]);

//   const handleServiceChange = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     index: number
//   ) => {
//     const list = [...serviceList];
//     list[index] = e.target.value;
//     setServiceList(list);
//     return list;
//   };

//   const handleServiceRemove = (index: number, field: any) => {
//     const list = [...serviceList];
//     list.splice(index, 1);
//     setServiceList(list);
//     field.onChange(list);
//   };

//   const handleServiceAdd = () => {
//     setServiceList([...serviceList, ""]);
//   };

//   return (
//     <div className="flex flex-col items-center justify-center mb-4">
//       <p className="text-base mr-3 mb-2">{label} :</p>
//       <Controller
//         name={type!}
//         control={control}
//         render={({ field }) => (
//           <div>
//             {serviceList.map((singleService, index) => (
//               <div key={index} className="services">
//                 <div className="relative mb-4">
//                   <input
//                     {...field}
//                     type="text"
//                     className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 appearance-none leading-normal"
//                     value={singleService}
//                     placeholder={`Response ${index + 1}`}
//                     onChange={(e) =>
//                       field.onChange(handleServiceChange(e, index))
//                     }
//                     required
//                   />
//                   {serviceList.length > 2 && (
//                     <button
//                       className={
//                         serviceList.length - 1 === index &&
//                         serviceList.length < maxInput
//                           ? "absolute text-2xl text-red-500 top-0 right-0 mr-20 mt-0.5"
//                           : "absolute text-2xl text-red-500 top-0 right-0 mr-2 mt-0.5"
//                       }
//                       type="button"
//                       onClick={() => handleServiceRemove(index, field)}
//                     >
//                       x
//                     </button>
//                   )}
//                   {serviceList.length - 1 === index &&
//                     serviceList.length < maxInput && (
//                       <button
//                         className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg ml-2"
//                         type="button"
//                         onClick={handleServiceAdd}
//                       >
//                         Add
//                       </button>
//                     )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       />
//       {type && errors && errors[type] && (
//         <span className="text-red-600 text-xs">{errors[type].message}</span>
//       )}
//     </div>
//   );
// };

// export default InputWithAddButton;
