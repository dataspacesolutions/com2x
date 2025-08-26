import React from "react";
import Badge from "./Badge";
import { Status } from "../constants";

export default function StatusPill({ status, overdue }) {
  const map = {
    [Status.LOCKED]: { label: "Locked", color: "gray" },
    [Status.TODO]: { label: "Not started", color: overdue ? "red" : "amber" },
    [Status.DOING]: { label: "In progress", color: "blue" },
    [Status.REVIEW]: { label: "Accepted / Submitted", color: "indigo" },
    [Status.DONE]: { label: "Done", color: "green" },
  };
  const { label, color } = map[status] || map[Status.TODO];
  return <Badge color={color}>{label}</Badge>;
}
