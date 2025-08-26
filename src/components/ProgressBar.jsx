import React from "react";
export default function ProgressBar({ value }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div className="h-2 rounded-full bg-blue-600" style={{ width: `${value}%` }} />
    </div>
  );
}
