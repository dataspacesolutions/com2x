import React from "react";
import Badge from "./Badge";
import { phaseMeta } from "../constants";

export default function PhaseTag({ phase }) {
  const meta = phaseMeta[phase] || { name: "Phase", color: "gray" };
  return <Badge color={meta.color}>{`Phase ${phase} · ${meta.name}`}</Badge>;
}
