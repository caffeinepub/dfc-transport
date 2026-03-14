import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";

interface DistrictSearchInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  districts: string[];
  "data-ocid"?: string;
}

export default function DistrictSearchInput({
  id,
  value,
  onChange,
  placeholder = "Search district...",
  districts,
  "data-ocid": ocid,
}: DistrictSearchInputProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // sync external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleKeyUp = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    onChange(q);
    if (q.trim() === "") {
      setFiltered([]);
      setOpen(false);
      return;
    }
    const lower = q.toLowerCase();
    const results = districts
      .filter((d) => d.toLowerCase().includes(lower))
      .slice(0, 50);
    setFiltered(results);
    setOpen(results.length > 0);
  };

  const handleSelect = (district: string) => {
    setQuery(district);
    onChange(district);
    setOpen(false);
    setFiltered([]);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        value={query}
        onChange={handleKeyUp}
        placeholder={placeholder}
        autoComplete="off"
        data-ocid={ocid}
        className="h-9"
      />
      {open && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg max-h-48 overflow-y-auto list-none p-0 m-0">
          {filtered.map((d) => (
            <li
              key={d}
              onMouseDown={() => handleSelect(d)}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-muted transition-colors"
            >
              {d}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
