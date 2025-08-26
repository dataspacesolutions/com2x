import React from "react";
import { classNames } from "../utils";

const colors = {
  gray: "bg-gray-100 text-gray-700",
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-rose-100 text-rose-800",
  violet: "bg-violet-100 text-violet-800",
  indigo: "bg-indigo-100 text-indigo-800",
};

export default function Badge({ children, color = "gray" }) {
  return (
    <span className={classNames("px-2 py-0.5 rounded text-xs font-medium", colors[color])}>
      {children}
    </span>
  );
}
