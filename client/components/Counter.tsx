const Counter = (props: {
  counter: number;
  setCounter: Function;
  start: number;
  limit: number;
}) => {
  const increase = () => {
    if (props.counter < props.limit) {
      props.setCounter((count: number) => count + 1);
    }
  };
  const decrease = () => {
    if (props.counter > props.start) {
      props.setCounter((count: number) => count - 1);
    }
  };

  return (
    <div className="flex items-center justify-center rounded border border-white bg-white px-3 py-3 mx-8">
      <button onClick={decrease}>-</button>
      <p className="mx-3">{props.counter}</p>
      <button onClick={increase}>+</button>
    </div>
  );
};

export default Counter;