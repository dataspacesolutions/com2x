import React from "react";

export const fmtDate = (d) => {
  const dt = typeof d === "string" ? new Date(d) : d;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return fmtDate(d);
};

export const classNames = (...xs) => xs.filter(Boolean).join(" ");

export const toCsv = (rows) => {
  const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
  const header = ["id", "text", "status", "created_at"].map(esc).join(",");
  const body = rows
    .map((r) => [r.id, r.text, r.status, r.t].map(esc).join(","))
    .join("\n");
  return header + "\n" + body;
};

export function useLocalStorage(key, initial) {
  const [state, setState] = React.useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  React.useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}


export const saveFile = (blob, filename) => {
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
};
