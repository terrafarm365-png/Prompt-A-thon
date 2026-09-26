"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StorageChartProps {
  data: { date: string; logical: number; physical: number }[];
}

export function StorageChart({ data }: StorageChartProps) {
  return (
    <div className="w-full h-64 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPhysical" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8D90A0" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8D90A0" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorLogical" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F7CFF" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#4F7CFF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#252A31" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#69717D"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#252A31" }}
          />
          <YAxis
            stroke="#69717D"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#252A31" }}
            tickFormatter={(val) => `${val} TB`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#171A1F",
              borderColor: "#252A31",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#F5F7FA",
            }}
            formatter={(value, name) => [
              `${value} TB`,
              name === "physical" ? "Physical (with RS 4+2)" : "Logical Stored",
            ]}
          />
          <Area
            type="monotone"
            dataKey="physical"
            stroke="#8D90A0"
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#colorPhysical)"
            name="physical"
          />
          <Area
            type="monotone"
            dataKey="logical"
            stroke="#4F7CFF"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorLogical)"
            name="logical"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
