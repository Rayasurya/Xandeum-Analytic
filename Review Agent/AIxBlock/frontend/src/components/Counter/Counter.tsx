import React, { useState, useEffect, ChangeEvent } from "react";
import "./Counter.scss";

interface CounterProps {
  label?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
}

const Counter: React.FC<CounterProps> = ({
  label,
  defaultValue = 0,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  onChange,
}) => {
  const [count, setCount] = useState<number>(defaultValue);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();

    if (value === "") {
      setCount(min);
      onChange?.(min);
    } else {
      const parsedValue = parseInt(value, 10);

      if (!isNaN(parsedValue) && parsedValue >= min && parsedValue <= max) {
        setCount(parsedValue);
        onChange?.(parsedValue);
      }
    }
  };

  const handleIncrement = () => {
    if (count < max) {
      const newCount = count + 1;
      setCount(newCount);
      onChange?.(newCount);
    }
  };

  const handleDecrement = () => {
    if (count > min) {
      const newCount = count - 1;
      setCount(newCount);
      onChange?.(newCount);
    }
  };

  useEffect(() => {
    setCount(defaultValue);
  }, [defaultValue]);

  return (
    <div className="c-counter">
      {label && <label className="c-counter__label">{label}</label>}
      <div className="c-counter__content">
        <button
          className="c-counter--minus c-counter__btn"
          onClick={handleDecrement}
          disabled={count <= min || count === 0}
          type="button"
        >
          -
        </button>
        <input
          className="c-counter__input"
          type="number"
          value={count}
          onChange={handleInputChange}
          min={min}
          max={max}
        />
        <button
          className="c-counter--plus c-counter__btn"
          onClick={handleIncrement}
          disabled={count >= max}
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default Counter;
