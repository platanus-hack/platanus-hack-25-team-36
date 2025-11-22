"use client";

import { Search } from "lucide-react";
import { ChangeEvent, useCallback, useMemo } from "react";

type Props = {
  onChange: (value: string) => void;
  debounceMs?: number;
};

export default function SearchBox({ onChange, debounceMs = 500 }: Props) {
  // Debounce function
  const debounce = useMemo(() => {
    return (func: (value: string) => void, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      return (value: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(value), delay);
      };
    };
  }, []);

  // Memoized debounced onChange function
  const debouncedOnChange = useMemo(
    () => debounce(onChange, debounceMs),
    [debounce, onChange, debounceMs]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      debouncedOnChange(e.target.value);
    },
    [debouncedOnChange]
  );

  return (
    <div
      className="w-full flex items-center gap-3 rounded-full px-4 py-3"
      style={{
        backgroundColor: "white",
        border: "1.5px solid rgb(0, 0, 0)",
        boxShadow: "3px 3px 0px rgba(0, 0, 0, 0.7)",
      }}
    >
      <Search className="w-5 h-5" style={{ color: "var(--foreground)" }} />
      <input
        type="text"
        placeholder="Buscar..."
        className="flex-1 bg-transparent outline-none placeholder:text-gray-500"
        style={{
          color: "var(--foreground)",
          fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
        }}
        onChange={handleInputChange}
      />
    </div>
  );
}
