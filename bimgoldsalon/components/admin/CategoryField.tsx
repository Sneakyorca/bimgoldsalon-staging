"use client";
import { useState } from "react";
import { inputCls, labelCls } from "./shared";
export default function CategoryField({
  value,
  onChange,
  categories,
}: {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
}) {
  const [adding, setAdding] = useState(false);
  return (
    <label className="block">
      <span className={labelCls}>Category</span>
      {adding ? (
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
          placeholder="New category"
        />
      ) : (
        <select
          value={value}
          onChange={(e) =>
            e.target.value === "__new__"
              ? (setAdding(true), onChange(""))
              : onChange(e.target.value)
          }
          className={inputCls}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
          <option value="__new__">+ Add new category</option>
        </select>
      )}
    </label>
  );
}
