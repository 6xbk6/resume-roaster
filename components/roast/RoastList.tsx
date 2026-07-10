"use client";

import type { RoastItem } from "@/types";
import { RoastCard } from "./RoastCard";

interface RoastListProps {
  roasts: RoastItem[];
}

export function RoastList({ roasts }: RoastListProps) {
  return (
    <div className="space-y-4">
      {roasts.map((roast, index) => (
        <RoastCard key={index} roast={roast} index={index} />
      ))}
    </div>
  );
}