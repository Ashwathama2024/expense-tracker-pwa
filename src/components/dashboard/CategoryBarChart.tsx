"use client";

import { motion } from "framer-motion";
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { CATEGORY_META, categoryColor } from "@/lib/categories";
import type { CategoryTotal } from "@/lib/dashboard";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { formatCurrency } from "@/lib/utils";

interface BarShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  index?: number;
}

function AnimatedBar({ x = 0, y = 0, width = 0, height = 0, fill, index = 0 }: BarShapeProps) {
  const reducedMotion = usePrefersReducedMotion();
  return (
    <motion.rect
      x={x}
      y={y}
      height={height}
      rx={4}
      ry={4}
      fill={fill}
      initial={reducedMotion ? { width } : { width: 0 }}
      animate={{ width }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { duration: 0.35, delay: index * 0.05, ease: "easeOut" }
      }
    />
  );
}

const MotionText = motion.create("text");

interface ValueLabelProps {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  height?: string | number;
  index?: number;
  data: CategoryTotal[];
}

function ValueLabel({ x = 0, y = 0, width = 0, height = 0, index = 0, data }: ValueLabelProps) {
  const reducedMotion = usePrefersReducedMotion();
  const row = data[index];
  if (!row) return null;
  const nx = Number(x);
  const ny = Number(y);
  const nw = Number(width);
  const nh = Number(height);
  return (
    <MotionText
      x={nx + nw + 8}
      y={ny + nh / 2}
      dy={4}
      className="fill-foreground text-xs font-medium tabular-nums"
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={
        reducedMotion ? { duration: 0 } : { duration: 0.3, delay: index * 0.05 + 0.2 }
      }
    >
      {formatCurrency(row.total)}
      <tspan className="fill-muted-foreground"> ({row.pct.toFixed(0)}%)</tspan>
    </MotionText>
  );
}

function CategoryTick(props: {
  x?: string | number;
  y?: string | number;
  payload?: { value?: string | number };
}) {
  const value = props.payload?.value;
  const meta = CATEGORY_META[value as keyof typeof CATEGORY_META];
  if (!meta) return null;
  return (
    <text x={props.x} y={props.y} dy={4} textAnchor="end" className="fill-muted-foreground text-xs">
      {meta.label}
    </text>
  );
}

export function CategoryBarChart({ data }: { data: CategoryTotal[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No spending in this period yet.
      </div>
    );
  }

  const maxTotal = Math.max(...data.map((d) => d.total));

  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 44, 120)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 88, bottom: 4, left: 4 }}
        barCategoryGap={12}
      >
        <XAxis type="number" hide domain={[0, maxTotal * 1.35]} />
        <YAxis
          type="category"
          dataKey="category"
          width={92}
          axisLine={false}
          tickLine={false}
          tick={CategoryTick}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const row = payload[0].payload as CategoryTotal;
            return (
              <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
                <p className="font-medium text-foreground">{CATEGORY_META[row.category].label}</p>
                <p className="tabular-nums text-muted-foreground">
                  {formatCurrency(row.total)} · {row.pct.toFixed(1)}%
                </p>
              </div>
            );
          }}
        />
        <Bar dataKey="total" shape={AnimatedBar} maxBarSize={22} isAnimationActive={false}>
          {data.map((entry) => (
            <Cell key={entry.category} fill={categoryColor(entry.category)} />
          ))}
          <LabelList dataKey="total" content={(props) => <ValueLabel {...props} data={data} />} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
