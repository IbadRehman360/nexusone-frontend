"use client";

import { useState } from "react";
import { RotateCcw, Save, Trash2, Check } from "lucide-react";
import { cn } from "@/src/lib/utils/cn";
import { useAppDispatch, useAppSelector } from "@/src/store";
import {
  setColor,
  resetSection,
  resetMode,
  savePalette,
  applyPalette,
  deletePalette,
  applyPreset,
  type Section,
  type ColorKey,
  type ComponentColors,
  type SectionTheme,
} from "@/src/store/slices/themeCustomizationSlice";

// ─── Color Presets ────────────────────────────────────────────────────────────

interface Preset { label: string; value: string; }

const BG_PRESETS: Preset[] = [
  { label: "Default",     value: "" },
  { label: "Black",       value: "#000000" },
  { label: "Void",        value: "#010105" },
  { label: "Abyss",       value: "#030712" },
  { label: "Ink",         value: "#050810" },
  { label: "Obsidian",    value: "#06070f" },
  { label: "Eclipse",     value: "#070914" },
  { label: "Navy",        value: "#07091a" },
  { label: "Deep Sea",    value: "#080c1a" },
  { label: "Midnight",    value: "#0d1117" },
  { label: "Onyx",        value: "#0a0a0f" },
  { label: "Slate 950",   value: "#0f172a" },
  { label: "Slate 920",   value: "#0f1f3d" },
  { label: "Charcoal",    value: "#111318" },
  { label: "Gray 900",    value: "#111827" },
  { label: "Zinc 900",    value: "#18181b" },
  { label: "Stone 900",   value: "#1c1917" },
  { label: "Neutral 900", value: "#171717" },
  { label: "Smoke",       value: "#141414" },
  { label: "Purple Dk",   value: "#120720" },
  { label: "Indigo Dk",   value: "#0e0f2e" },
  { label: "Violet Dk",   value: "#150b2e" },
  { label: "Blue Dk",     value: "#07091f" },
  { label: "Teal Dk",     value: "#071718" },
  { label: "Forest",      value: "#071a0f" },
  { label: "Emerald Dk",  value: "#052010" },
  { label: "Crimson",     value: "#1a0707" },
  { label: "Rose Dk",     value: "#1a0710" },
  { label: "Amber Dk",    value: "#1a1007" },
  { label: "Slate 800",   value: "#1e293b" },
  { label: "Gray 800",    value: "#1f2937" },
  { label: "Zinc 800",    value: "#27272a" },
  { label: "Stone 800",   value: "#292524" },
  { label: "Purple Mid",  value: "#1e1b4b" },
  { label: "Indigo Mid",  value: "#1e1f5e" },
  { label: "Blue Mid",    value: "#1e3a5f" },
  { label: "Teal Mid",    value: "#134e4a" },
  { label: "Green Mid",   value: "#14532d" },
  { label: "Red Mid",     value: "#450a0a" },
  { label: "Slate 700",   value: "#334155" },
  { label: "Gray 700",    value: "#374151" },
  { label: "Zinc 700",    value: "#3f3f46" },
  { label: "Purple 700",  value: "#6d28d9" },
  { label: "Blue 700",    value: "#1d4ed8" },
  { label: "Teal 700",    value: "#0f766e" },
  { label: "Slate 200",   value: "#e2e8f0" },
  { label: "Gray 100",    value: "#f3f4f6" },
  { label: "Gray 50",     value: "#f9fafb" },
  { label: "Slate 100",   value: "#f1f5f9" },
  { label: "Slate 50",    value: "#f8fafc" },
  { label: "Zinc 50",     value: "#fafafa" },
  { label: "White",       value: "#ffffff" },
  { label: "Warm",        value: "#fafaf9" },
  { label: "Cloud",       value: "#f4f4f5" },
  { label: "Sky",         value: "#eff6ff" },
  { label: "Blue 50",     value: "#dbeafe" },
  { label: "Indigo 50",   value: "#eef2ff" },
  { label: "Lavender",    value: "#f5f3ff" },
  { label: "Purple 50",   value: "#faf5ff" },
  { label: "Pink 50",     value: "#fdf2f8" },
  { label: "Mint",        value: "#f0fdf4" },
  { label: "Teal 50",     value: "#f0fdfa" },
  { label: "Rose 50",     value: "#fff1f2" },
  { label: "Amber 50",    value: "#fffbeb" },
];

const FG_PRESETS: Preset[] = [
  { label: "Default",    value: "" },
  { label: "White",      value: "#ffffff" },
  { label: "Snow",       value: "#f8fafc" },
  { label: "Light",      value: "#f1f5f9" },
  { label: "Silver",     value: "#e2e8f0" },
  { label: "Gray 200",   value: "#e5e7eb" },
  { label: "Gray 300",   value: "#d1d5db" },
  { label: "Gray 400",   value: "#9ca3af" },
  { label: "Gray 500",   value: "#6b7280" },
  { label: "Gray 600",   value: "#4b5563" },
  { label: "Slate 300",  value: "#cbd5e1" },
  { label: "Slate 400",  value: "#94a3b8" },
  { label: "Slate 500",  value: "#64748b" },
  { label: "Dark",       value: "#1f2937" },
  { label: "Darker",     value: "#111827" },
  { label: "Black",      value: "#000000" },
  { label: "Blue 200",   value: "#bfdbfe" },
  { label: "Blue 300",   value: "#93c5fd" },
  { label: "Blue 400",   value: "#60a5fa" },
  { label: "Blue 500",   value: "#3b82f6" },
  { label: "Indigo",     value: "#818cf8" },
  { label: "Purple 300", value: "#d8b4fe" },
  { label: "Purple 400", value: "#c084fc" },
  { label: "Purple 500", value: "#a855f7" },
  { label: "Pink",       value: "#f472b6" },
  { label: "Rose",       value: "#fb7185" },
  { label: "Teal 300",   value: "#5eead4" },
  { label: "Teal 400",   value: "#2dd4bf" },
  { label: "Cyan",       value: "#22d3ee" },
  { label: "Green 300",  value: "#86efac" },
  { label: "Green 400",  value: "#4ade80" },
  { label: "Amber",      value: "#fbbf24" },
  { label: "Orange",     value: "#fb923c" },
  { label: "Red",        value: "#f87171" },
];

const BORDER_PRESETS: Preset[] = [
  { label: "Default",   value: "" },
  { label: "None",      value: "transparent" },
  { label: "White/2",   value: "rgba(255,255,255,0.02)" },
  { label: "White/4",   value: "rgba(255,255,255,0.04)" },
  { label: "White/6",   value: "rgba(255,255,255,0.06)" },
  { label: "White/8",   value: "rgba(255,255,255,0.08)" },
  { label: "White/12",  value: "rgba(255,255,255,0.12)" },
  { label: "White/18",  value: "rgba(255,255,255,0.18)" },
  { label: "White/25",  value: "rgba(255,255,255,0.25)" },
  { label: "White/40",  value: "rgba(255,255,255,0.40)" },
  { label: "White/60",  value: "rgba(255,255,255,0.60)" },
  { label: "Blue/20",   value: "rgba(59,130,246,0.20)" },
  { label: "Blue/35",   value: "rgba(59,130,246,0.35)" },
  { label: "Blue/50",   value: "rgba(59,130,246,0.50)" },
  { label: "Blue/70",   value: "rgba(59,130,246,0.70)" },
  { label: "Indigo/30", value: "rgba(99,102,241,0.30)" },
  { label: "Indigo/50", value: "rgba(99,102,241,0.50)" },
  { label: "Purple/20", value: "rgba(168,85,247,0.20)" },
  { label: "Purple/35", value: "rgba(168,85,247,0.35)" },
  { label: "Purple/50", value: "rgba(168,85,247,0.50)" },
  { label: "Pink/30",   value: "rgba(236,72,153,0.30)" },
  { label: "Pink/50",   value: "rgba(236,72,153,0.50)" },
  { label: "Teal/25",   value: "rgba(20,184,166,0.25)" },
  { label: "Teal/45",   value: "rgba(20,184,166,0.45)" },
  { label: "Cyan/30",   value: "rgba(6,182,212,0.30)" },
  { label: "Cyan/50",   value: "rgba(6,182,212,0.50)" },
  { label: "Green/25",  value: "rgba(34,197,94,0.25)" },
  { label: "Green/45",  value: "rgba(34,197,94,0.45)" },
  { label: "Amber/30",  value: "rgba(245,158,11,0.30)" },
  { label: "Orange/30", value: "rgba(249,115,22,0.30)" },
  { label: "Red/25",    value: "rgba(239,68,68,0.25)" },
  { label: "Rose/30",   value: "rgba(244,63,94,0.30)" },
  { label: "Black/10",  value: "rgba(0,0,0,0.10)" },
  { label: "Black/20",  value: "rgba(0,0,0,0.20)" },
  { label: "Black/40",  value: "rgba(0,0,0,0.40)" },
  { label: "Slate 200", value: "#e2e8f0" },
  { label: "Gray 200",  value: "#e5e7eb" },
  { label: "Zinc 200",  value: "#e4e4e7" },
];

const ACTIVE_BG_PRESETS: Preset[] = [
  { label: "Default",   value: "" },
  { label: "Blue/5",    value: "rgba(59,130,246,0.05)" },
  { label: "Blue/10",   value: "rgba(59,130,246,0.10)" },
  { label: "Blue/15",   value: "rgba(59,130,246,0.15)" },
  { label: "Blue/20",   value: "rgba(59,130,246,0.20)" },
  { label: "Indigo/10", value: "rgba(99,102,241,0.10)" },
  { label: "Indigo/20", value: "rgba(99,102,241,0.20)" },
  { label: "Purple/5",  value: "rgba(168,85,247,0.05)" },
  { label: "Purple/10", value: "rgba(168,85,247,0.10)" },
  { label: "Purple/20", value: "rgba(168,85,247,0.20)" },
  { label: "Pink/10",   value: "rgba(236,72,153,0.10)" },
  { label: "Teal/10",   value: "rgba(20,184,166,0.10)" },
  { label: "Teal/20",   value: "rgba(20,184,166,0.20)" },
  { label: "Cyan/10",   value: "rgba(6,182,212,0.10)" },
  { label: "Green/10",  value: "rgba(34,197,94,0.10)" },
  { label: "Amber/10",  value: "rgba(245,158,11,0.10)" },
  { label: "Red/10",    value: "rgba(239,68,68,0.10)" },
  { label: "White/4",   value: "rgba(255,255,255,0.04)" },
  { label: "White/8",   value: "rgba(255,255,255,0.08)" },
  { label: "White/12",  value: "rgba(255,255,255,0.12)" },
  { label: "Black/5",   value: "rgba(0,0,0,0.05)" },
  { label: "Black/10",  value: "rgba(0,0,0,0.10)" },
];

// ─── Built-in Presets ─────────────────────────────────────────────────────────

const E: ComponentColors = { bg: '', fg: '', iconColor: '', iconHoverColor: '', activeBg: '', borderColor: '', altBg: '' };
const DEFAULT_ST: SectionTheme = { rail: {...E}, sidebar: {...E}, header: {...E}, panel: {...E}, banner: {...E}, contentBg: {...E}, widget: {...E}, card: {...E}, table: {...E}, button: {...E} };

interface BuiltInPreset {
  id:          string;
  name:        string;
  description: string;
  colors:      string[]; // preview swatches [bg, icon, accent]
  palette:     { label: string; color: string }[];
  dark:        SectionTheme;
  light:       SectionTheme;
}

const BUILT_IN_PRESETS: BuiltInPreset[] = [
  {
    id: "midnight", name: "Midnight",
    description: "Deep navy with crisp white icons — clean, focused dark workspace.",
    colors: ["#07091a", "#ffffff", "#e2e8f0"],
    palette: [
      { label: "Rail",    color: "#07091a" },
      { label: "Sidebar", color: "#080c1a" },
      { label: "Header",  color: "#07091a" },
      { label: "Icons",   color: "#ffffff" },
      { label: "Hover",   color: "#e2e8f0" },
      { label: "Content", color: "#050810" },
    ],
    dark: {
      ...DEFAULT_ST,
      rail:      { ...E, bg: "#07091a", iconColor: "#ffffff", iconHoverColor: "#e2e8f0", activeBg: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.06)" },
      sidebar:   { ...E, bg: "#080c1a", fg: "#cbd5e1",        iconColor: "#ffffff",       activeBg: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.06)" },
      header:    { ...E, bg: "#07091a", fg: "#f1f5f9",                                    borderColor: "rgba(255,255,255,0.06)" },
      panel:     { ...E, borderColor: "rgba(255,255,255,0.10)" },
      banner:    { ...E, bg: "#0f1f3d", fg: "#e2e8f0" },
      contentBg: { ...E, bg: "#050810" },
      widget:    { ...E, bg: "#080c1a" },
      card:      { ...E, bg: "#080c1a", borderColor: "rgba(255,255,255,0.08)" },
      table:     { ...E, bg: "#080c1a", borderColor: "rgba(255,255,255,0.06)" },
    },
    light: {
      ...DEFAULT_ST,
      rail:    { ...E, bg: "#eef2fb", iconColor: "#374151", iconHoverColor: "#111827", activeBg: "rgba(0,0,0,0.06)", borderColor: "rgba(0,0,0,0.08)" },
      sidebar: { ...E, bg: "#f8fafc", fg: "#1f2937",        iconColor: "#374151",      activeBg: "rgba(0,0,0,0.05)", borderColor: "rgba(0,0,0,0.08)" },
      header:  { ...E, bg: "#eef2fb", fg: "#111827",                                   borderColor: "rgba(0,0,0,0.08)" },
      panel:   { ...E, borderColor: "rgba(0,0,0,0.10)" },
    },
  },
  {
    id: "carbon", name: "Carbon",
    description: "True black with white icons — ultimate dark mode contrast.",
    colors: ["#000000", "#ffffff", "#52525b"],
    palette: [
      { label: "Rail",    color: "#000000" },
      { label: "Sidebar", color: "#0a0a0a" },
      { label: "Header",  color: "#000000" },
      { label: "Icons",   color: "#ffffff" },
      { label: "Hover",   color: "#e2e8f0" },
      { label: "Content", color: "#030303" },
    ],
    dark: {
      ...DEFAULT_ST,
      rail:      { ...E, bg: "#000000", iconColor: "#ffffff", iconHoverColor: "#e2e8f0", activeBg: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.05)" },
      sidebar:   { ...E, bg: "#0a0a0a", fg: "#d4d4d8",        iconColor: "#ffffff",       activeBg: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.05)" },
      header:    { ...E, bg: "#000000", fg: "#f4f4f5",                                    borderColor: "rgba(255,255,255,0.05)" },
      panel:     { ...E, borderColor: "rgba(255,255,255,0.07)" },
      banner:    { ...E, bg: "#18181b", fg: "#e4e4e7" },
      contentBg: { ...E, bg: "#030303" },
      widget:    { ...E, bg: "#0a0a0a" },
      card:      { ...E, bg: "#0a0a0a", borderColor: "rgba(255,255,255,0.07)" },
      table:     { ...E, bg: "#000000", borderColor: "rgba(255,255,255,0.05)" },
    },
    light: {
      ...DEFAULT_ST,
      rail:    { ...E, bg: "#f4f4f5", iconColor: "#3f3f46", iconHoverColor: "#18181b", activeBg: "rgba(0,0,0,0.06)", borderColor: "rgba(0,0,0,0.08)" },
      sidebar: { ...E, bg: "#fafafa", fg: "#18181b",        iconColor: "#52525b",      activeBg: "rgba(0,0,0,0.05)", borderColor: "rgba(0,0,0,0.08)" },
      header:  { ...E, bg: "#f4f4f5", fg: "#18181b",                                   borderColor: "rgba(0,0,0,0.08)" },
      panel:   { ...E, borderColor: "rgba(0,0,0,0.10)" },
    },
  },
  {
    id: "slate-pro", name: "Slate Pro",
    description: "Dark slate blue-gray — the go-to professional dark theme.",
    colors: ["#1e293b", "#ffffff", "#475569"],
    palette: [
      { label: "Rail",    color: "#1e293b" },
      { label: "Sidebar", color: "#0f172a" },
      { label: "Header",  color: "#1e293b" },
      { label: "Icons",   color: "#ffffff" },
      { label: "Hover",   color: "#e2e8f0" },
      { label: "Content", color: "#0f172a" },
    ],
    dark: {
      ...DEFAULT_ST,
      rail:      { ...E, bg: "#1e293b", iconColor: "#ffffff", iconHoverColor: "#e2e8f0", activeBg: "rgba(255,255,255,0.08)", borderColor: "rgba(148,163,184,0.10)" },
      sidebar:   { ...E, bg: "#0f172a", fg: "#cbd5e1",        iconColor: "#ffffff",       activeBg: "rgba(255,255,255,0.06)", borderColor: "rgba(148,163,184,0.10)" },
      header:    { ...E, bg: "#1e293b", fg: "#f1f5f9",                                    borderColor: "rgba(148,163,184,0.12)" },
      panel:     { ...E, borderColor: "rgba(148,163,184,0.15)" },
      banner:    { ...E, bg: "#1e293b", fg: "#cbd5e1" },
      contentBg: { ...E, bg: "#0f172a" },
      widget:    { ...E, bg: "#1e293b" },
      card:      { ...E, bg: "#1e293b", borderColor: "rgba(148,163,184,0.12)" },
      table:     { ...E, bg: "#1e293b", borderColor: "rgba(148,163,184,0.10)" },
    },
    light: {
      ...DEFAULT_ST,
      rail:    { ...E, bg: "#f1f5f9", iconColor: "#475569", iconHoverColor: "#1e293b", activeBg: "rgba(71,85,105,0.08)", borderColor: "rgba(0,0,0,0.08)" },
      sidebar: { ...E, bg: "#f8fafc", fg: "#1e293b",        iconColor: "#475569",      activeBg: "rgba(71,85,105,0.06)", borderColor: "rgba(0,0,0,0.08)" },
      header:  { ...E, bg: "#f1f5f9", fg: "#0f172a",                                   borderColor: "rgba(0,0,0,0.08)" },
      panel:   { ...E, borderColor: "rgba(71,85,105,0.15)" },
    },
  },
  {
    id: "navy-pro", name: "Navy Pro",
    description: "Rich dark navy — authoritative, enterprise-grade dark UI.",
    colors: ["#0a0f1e", "#ffffff", "#2d4a6b"],
    palette: [
      { label: "Rail",    color: "#0a0f1e" },
      { label: "Sidebar", color: "#0d1526" },
      { label: "Header",  color: "#0a0f1e" },
      { label: "Icons",   color: "#ffffff" },
      { label: "Hover",   color: "#e2e8f0" },
      { label: "Content", color: "#060b14" },
    ],
    dark: {
      ...DEFAULT_ST,
      rail:      { ...E, bg: "#0a0f1e", iconColor: "#ffffff", iconHoverColor: "#e2e8f0", activeBg: "rgba(255,255,255,0.08)", borderColor: "rgba(123,146,178,0.08)" },
      sidebar:   { ...E, bg: "#0d1526", fg: "#c8d8e8",        iconColor: "#ffffff",       activeBg: "rgba(255,255,255,0.06)", borderColor: "rgba(123,146,178,0.08)" },
      header:    { ...E, bg: "#0a0f1e", fg: "#e2ecf4",                                    borderColor: "rgba(123,146,178,0.10)" },
      panel:     { ...E, borderColor: "rgba(123,146,178,0.14)" },
      banner:    { ...E, bg: "#132040", fg: "#b8cce0" },
      contentBg: { ...E, bg: "#060b14" },
      widget:    { ...E, bg: "#0d1526" },
      card:      { ...E, bg: "#0d1526", borderColor: "rgba(123,146,178,0.10)" },
      table:     { ...E, bg: "#0a0f1e", borderColor: "rgba(123,146,178,0.08)" },
    },
    light: {
      ...DEFAULT_ST,
      rail:    { ...E, bg: "#e8f0f8", iconColor: "#2d4a6b", iconHoverColor: "#0a0f1e", activeBg: "rgba(45,74,107,0.10)", borderColor: "rgba(0,0,0,0.08)" },
      sidebar: { ...E, bg: "#f0f6fc", fg: "#0a0f1e",        iconColor: "#2d4a6b",      activeBg: "rgba(45,74,107,0.08)", borderColor: "rgba(0,0,0,0.08)" },
      header:  { ...E, bg: "#e8f0f8", fg: "#0a0f1e",                                   borderColor: "rgba(0,0,0,0.08)" },
      panel:   { ...E, borderColor: "rgba(45,74,107,0.15)" },
    },
  },
  {
    id: "graphite", name: "Graphite",
    description: "Charcoal gray — neutral, distraction-free professional dark.",
    colors: ["#1a1a1a", "#ffffff", "#6b7280"],
    palette: [
      { label: "Rail",    color: "#1a1a1a" },
      { label: "Sidebar", color: "#222222" },
      { label: "Header",  color: "#1a1a1a" },
      { label: "Icons",   color: "#ffffff" },
      { label: "Hover",   color: "#e2e8f0" },
      { label: "Content", color: "#111111" },
    ],
    dark: {
      ...DEFAULT_ST,
      rail:      { ...E, bg: "#1a1a1a", iconColor: "#ffffff", iconHoverColor: "#e2e8f0", activeBg: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.06)" },
      sidebar:   { ...E, bg: "#222222", fg: "#d1d5db",        iconColor: "#ffffff",       activeBg: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.06)" },
      header:    { ...E, bg: "#1a1a1a", fg: "#f3f4f6",                                    borderColor: "rgba(255,255,255,0.06)" },
      panel:     { ...E, borderColor: "rgba(255,255,255,0.08)" },
      banner:    { ...E, bg: "#2d2d2d", fg: "#d1d5db" },
      contentBg: { ...E, bg: "#111111" },
      widget:    { ...E, bg: "#222222" },
      card:      { ...E, bg: "#222222", borderColor: "rgba(255,255,255,0.08)" },
      table:     { ...E, bg: "#1a1a1a", borderColor: "rgba(255,255,255,0.06)" },
    },
    light: {
      ...DEFAULT_ST,
      rail:    { ...E, bg: "#f3f4f6", iconColor: "#4b5563", iconHoverColor: "#1f2937", activeBg: "rgba(0,0,0,0.06)", borderColor: "rgba(0,0,0,0.08)" },
      sidebar: { ...E, bg: "#f9fafb", fg: "#111827",        iconColor: "#4b5563",      activeBg: "rgba(0,0,0,0.05)", borderColor: "rgba(0,0,0,0.08)" },
      header:  { ...E, bg: "#f3f4f6", fg: "#111827",                                   borderColor: "rgba(0,0,0,0.08)" },
      panel:   { ...E, borderColor: "rgba(0,0,0,0.10)" },
    },
  },
  {
    id: "steel", name: "Steel",
    description: "Dark steel blue — cool-toned, technical, precision-built.",
    colors: ["#0d1e2d", "#ffffff", "#3d6b8c"],
    palette: [
      { label: "Rail",    color: "#0d1e2d" },
      { label: "Sidebar", color: "#112335" },
      { label: "Header",  color: "#0d1e2d" },
      { label: "Icons",   color: "#ffffff" },
      { label: "Hover",   color: "#e2e8f0" },
      { label: "Content", color: "#081420" },
    ],
    dark: {
      ...DEFAULT_ST,
      rail:      { ...E, bg: "#0d1e2d", iconColor: "#ffffff", iconHoverColor: "#e2e8f0", activeBg: "rgba(255,255,255,0.08)", borderColor: "rgba(139,174,200,0.08)" },
      sidebar:   { ...E, bg: "#112335", fg: "#c0d4e4",        iconColor: "#ffffff",       activeBg: "rgba(255,255,255,0.06)", borderColor: "rgba(139,174,200,0.08)" },
      header:    { ...E, bg: "#0d1e2d", fg: "#daeaf5",                                    borderColor: "rgba(139,174,200,0.10)" },
      panel:     { ...E, borderColor: "rgba(139,174,200,0.14)" },
      banner:    { ...E, bg: "#163248", fg: "#c0d4e4" },
      contentBg: { ...E, bg: "#081420" },
      widget:    { ...E, bg: "#112335" },
      card:      { ...E, bg: "#112335", borderColor: "rgba(139,174,200,0.10)" },
      table:     { ...E, bg: "#0d1e2d", borderColor: "rgba(139,174,200,0.08)" },
    },
    light: {
      ...DEFAULT_ST,
      rail:    { ...E, bg: "#e8f2f8", iconColor: "#3d6b8c", iconHoverColor: "#0d1e2d", activeBg: "rgba(61,107,140,0.10)", borderColor: "rgba(0,0,0,0.08)" },
      sidebar: { ...E, bg: "#f0f7fc", fg: "#0d1e2d",        iconColor: "#3d6b8c",      activeBg: "rgba(61,107,140,0.08)", borderColor: "rgba(0,0,0,0.08)" },
      header:  { ...E, bg: "#e8f2f8", fg: "#0d1e2d",                                   borderColor: "rgba(0,0,0,0.08)" },
      panel:   { ...E, borderColor: "rgba(61,107,140,0.15)" },
    },
  },
  {
    id: "ash", name: "Ash",
    description: "Warm dark ash — subtle warmth in a refined neutral shell.",
    colors: ["#1c1917", "#ffffff", "#78716c"],
    palette: [
      { label: "Rail",    color: "#1c1917" },
      { label: "Sidebar", color: "#231f1d" },
      { label: "Header",  color: "#1c1917" },
      { label: "Icons",   color: "#ffffff" },
      { label: "Hover",   color: "#e2e8f0" },
      { label: "Content", color: "#110f0e" },
    ],
    dark: {
      ...DEFAULT_ST,
      rail:      { ...E, bg: "#1c1917", iconColor: "#ffffff", iconHoverColor: "#e2e8f0", activeBg: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.06)" },
      sidebar:   { ...E, bg: "#231f1d", fg: "#d6d3d1",        iconColor: "#ffffff",       activeBg: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.06)" },
      header:    { ...E, bg: "#1c1917", fg: "#f5f5f4",                                    borderColor: "rgba(255,255,255,0.06)" },
      panel:     { ...E, borderColor: "rgba(255,255,255,0.08)" },
      banner:    { ...E, bg: "#292524", fg: "#d6d3d1" },
      contentBg: { ...E, bg: "#110f0e" },
      widget:    { ...E, bg: "#231f1d" },
      card:      { ...E, bg: "#231f1d", borderColor: "rgba(255,255,255,0.08)" },
      table:     { ...E, bg: "#1c1917", borderColor: "rgba(255,255,255,0.06)" },
    },
    light: {
      ...DEFAULT_ST,
      rail:    { ...E, bg: "#f5f5f4", iconColor: "#57534e", iconHoverColor: "#1c1917", activeBg: "rgba(0,0,0,0.06)", borderColor: "rgba(0,0,0,0.08)" },
      sidebar: { ...E, bg: "#fafaf9", fg: "#1c1917",        iconColor: "#57534e",      activeBg: "rgba(0,0,0,0.05)", borderColor: "rgba(0,0,0,0.08)" },
      header:  { ...E, bg: "#f5f5f4", fg: "#1c1917",                                   borderColor: "rgba(0,0,0,0.08)" },
      panel:   { ...E, borderColor: "rgba(0,0,0,0.10)" },
    },
  },
  {
    id: "eclipse", name: "Eclipse",
    description: "Deep purple-black — immersive, creative dark environment.",
    colors: ["#120720", "#ffffff", "#a855f7"],
    palette: [
      { label: "Rail",    color: "#120720" },
      { label: "Sidebar", color: "#150b2e" },
      { label: "Header",  color: "#120720" },
      { label: "Icons",   color: "#ffffff" },
      { label: "Hover",   color: "#e2e8f0" },
      { label: "Content", color: "#0a0510" },
    ],
    dark: {
      ...DEFAULT_ST,
      rail:      { ...E, bg: "#120720", iconColor: "#ffffff", iconHoverColor: "#e2e8f0", activeBg: "rgba(168,85,247,0.15)", borderColor: "rgba(168,85,247,0.10)" },
      sidebar:   { ...E, bg: "#150b2e", fg: "#e2e8f0",        iconColor: "#ffffff",       activeBg: "rgba(168,85,247,0.12)", borderColor: "rgba(168,85,247,0.10)" },
      header:    { ...E, bg: "#120720", fg: "#f1f5f9",                                    borderColor: "rgba(168,85,247,0.12)" },
      panel:     { ...E, borderColor: "rgba(168,85,247,0.22)" },
      banner:    { ...E, bg: "#1e1b4b", fg: "#d8b4fe" },
      contentBg: { ...E, bg: "#0a0510" },
      widget:    { ...E, bg: "#150b2e" },
      card:      { ...E, bg: "#120720", borderColor: "rgba(168,85,247,0.15)" },
      table:     { ...E, bg: "#120720", borderColor: "rgba(168,85,247,0.10)" },
    },
    light: {
      ...DEFAULT_ST,
      rail:    { ...E, bg: "#faf5ff", iconColor: "#a855f7", iconHoverColor: "#9333ea", activeBg: "rgba(168,85,247,0.10)", borderColor: "rgba(168,85,247,0.12)" },
      sidebar: { ...E, bg: "#f5f3ff", fg: "#1f2937",        iconColor: "#a855f7",      activeBg: "rgba(168,85,247,0.08)", borderColor: "rgba(168,85,247,0.10)" },
      header:  { ...E, bg: "#faf5ff", fg: "#111827",                                   borderColor: "rgba(168,85,247,0.15)" },
      panel:   { ...E, borderColor: "rgba(168,85,247,0.25)" },
    },
  },
  {
    id: "onyx", name: "Onyx",
    description: "Near-black with white icons — refined, minimal dark theme.",
    colors: ["#0a0a0f", "#ffffff", "#64748b"],
    palette: [
      { label: "Rail",    color: "#0a0a0f" },
      { label: "Sidebar", color: "#111318" },
      { label: "Header",  color: "#0a0a0f" },
      { label: "Icons",   color: "#ffffff" },
      { label: "Hover",   color: "#e2e8f0" },
      { label: "Content", color: "#070707" },
    ],
    dark: {
      ...DEFAULT_ST,
      rail:      { ...E, bg: "#0a0a0f", iconColor: "#ffffff", iconHoverColor: "#e2e8f0", activeBg: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.06)" },
      sidebar:   { ...E, bg: "#111318", fg: "#cbd5e1",        iconColor: "#ffffff",       activeBg: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.06)" },
      header:    { ...E, bg: "#0a0a0f", fg: "#e2e8f0", iconColor: "rgba(255,255,255,0.05)", activeBg: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.06)", altBg: "rgba(255,255,255,0.08)" },
      panel:     { ...E, borderColor: "rgba(255,255,255,0.08)" },
      banner:    { ...E, bg: "#18181b", fg: "#e2e8f0" },
      contentBg: { ...E, bg: "#070707" },
      widget:    { ...E, bg: "#111318" },
      card:      { ...E, bg: "#0a0a0f", borderColor: "rgba(255,255,255,0.08)" },
      table:     { ...E, bg: "#0a0a0f", altBg: "rgba(255,255,255,0.02)", activeBg: "#111318",               fg: "#111318", iconColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.08)" },
    },
    light: {
      ...DEFAULT_ST,
      rail:    { ...E, bg: "#f1f5f9", iconColor: "#64748b", iconHoverColor: "#374151", activeBg: "rgba(0,0,0,0.06)", borderColor: "rgba(0,0,0,0.10)" },
      sidebar: { ...E, bg: "#f8fafc", fg: "#1f2937",        iconColor: "#64748b",      activeBg: "rgba(0,0,0,0.05)", borderColor: "rgba(0,0,0,0.10)" },
      header:  { ...E, bg: "#f1f5f9", fg: "#111827", iconColor: "rgba(0,0,0,0.05)", activeBg: "rgba(0,0,0,0.08)", borderColor: "rgba(0,0,0,0.10)", altBg: "rgba(0,0,0,0.10)" },
      panel:   { ...E, borderColor: "rgba(0,0,0,0.12)" },
      table:   { ...E, altBg: "rgba(0,0,0,0.02)", activeBg: "rgba(0,0,0,0.04)", fg: "#f1f5f9", iconColor: "rgba(0,0,0,0.08)" },
    },
  },
  {
    id: "forest", name: "Forest",
    description: "Dark teal-green — focused, calm, nature-inspired professional.",
    colors: ["#071718", "#ffffff", "#0f766e"],
    palette: [
      { label: "Rail",    color: "#071718" },
      { label: "Sidebar", color: "#071a0f" },
      { label: "Header",  color: "#071718" },
      { label: "Icons",   color: "#ffffff" },
      { label: "Hover",   color: "#e2e8f0" },
      { label: "Content", color: "#050a08" },
    ],
    dark: {
      ...DEFAULT_ST,
      rail:      { ...E, bg: "#071718", iconColor: "#ffffff", iconHoverColor: "#e2e8f0", activeBg: "rgba(20,184,166,0.15)", borderColor: "rgba(20,184,166,0.10)" },
      sidebar:   { ...E, bg: "#071a0f", fg: "#e2e8f0",        iconColor: "#ffffff",       activeBg: "rgba(20,184,166,0.12)", borderColor: "rgba(20,184,166,0.10)" },
      header:    { ...E, bg: "#071718", fg: "#f1f5f9",                                    borderColor: "rgba(20,184,166,0.12)" },
      panel:     { ...E, borderColor: "rgba(20,184,166,0.22)" },
      banner:    { ...E, bg: "#134e4a", fg: "#5eead4" },
      contentBg: { ...E, bg: "#050a08" },
      widget:    { ...E, bg: "#071a0f" },
      card:      { ...E, bg: "#071718", borderColor: "rgba(20,184,166,0.15)" },
      table:     { ...E, bg: "#071718", borderColor: "rgba(20,184,166,0.10)" },
    },
    light: {
      ...DEFAULT_ST,
      rail:    { ...E, bg: "#f0fdfa", iconColor: "#0f766e", iconHoverColor: "#134e4a", activeBg: "rgba(20,184,166,0.10)", borderColor: "rgba(20,184,166,0.15)" },
      sidebar: { ...E, bg: "#f0fdf4", fg: "#1f2937",        iconColor: "#0f766e",      activeBg: "rgba(20,184,166,0.08)", borderColor: "rgba(20,184,166,0.12)" },
      header:  { ...E, bg: "#f0fdfa", fg: "#111827",                                   borderColor: "rgba(20,184,166,0.15)" },
      panel:   { ...E, borderColor: "rgba(20,184,166,0.25)" },
    },
  },
  {
    id: "dusk", name: "Dusk",
    description: "Deep crimson-dark — bold, high-contrast accent for night use.",
    colors: ["#1a0707", "#ffffff", "#e11d48"],
    palette: [
      { label: "Rail",    color: "#1a0707" },
      { label: "Sidebar", color: "#1a0710" },
      { label: "Header",  color: "#1a0707" },
      { label: "Icons",   color: "#ffffff" },
      { label: "Hover",   color: "#e2e8f0" },
      { label: "Content", color: "#0f0404" },
    ],
    dark: {
      ...DEFAULT_ST,
      rail:      { ...E, bg: "#1a0707", iconColor: "#ffffff", iconHoverColor: "#e2e8f0", activeBg: "rgba(244,63,94,0.12)", borderColor: "rgba(244,63,94,0.10)" },
      sidebar:   { ...E, bg: "#1a0710", fg: "#e2e8f0",        iconColor: "#ffffff",       activeBg: "rgba(244,63,94,0.10)", borderColor: "rgba(244,63,94,0.10)" },
      header:    { ...E, bg: "#1a0707", fg: "#f1f5f9",                                    borderColor: "rgba(244,63,94,0.12)" },
      panel:     { ...E, borderColor: "rgba(244,63,94,0.22)" },
      banner:    { ...E, bg: "#450a0a", fg: "#fda4af" },
      contentBg: { ...E, bg: "#0f0404" },
      widget:    { ...E, bg: "#1a0710" },
      card:      { ...E, bg: "#1a0707", borderColor: "rgba(244,63,94,0.15)" },
      table:     { ...E, bg: "#1a0707", borderColor: "rgba(244,63,94,0.10)" },
    },
    light: {
      ...DEFAULT_ST,
      rail:    { ...E, bg: "#fff1f2", iconColor: "#e11d48", iconHoverColor: "#be123c", activeBg: "rgba(244,63,94,0.10)", borderColor: "rgba(244,63,94,0.15)" },
      sidebar: { ...E, bg: "#fdf2f8", fg: "#1f2937",        iconColor: "#e11d48",      activeBg: "rgba(244,63,94,0.08)", borderColor: "rgba(244,63,94,0.12)" },
      header:  { ...E, bg: "#fff1f2", fg: "#111827",                                   borderColor: "rgba(244,63,94,0.15)" },
      panel:   { ...E, borderColor: "rgba(244,63,94,0.25)" },
    },
  },
  {
    id: "portal", name: "Portal",
    description: "Azure-portal vibe with amber accent — near-black shell, warm golden highlights.",
    colors: ["#0b0b0c", "#ffffff", "#f59e0b"],
    palette: [
      { label: "Rail",    color: "#0b0b0c" },
      { label: "Sidebar", color: "#131315" },
      { label: "Header",  color: "#0b0b0c" },
      { label: "Icons",   color: "#ffffff" },
      { label: "Accent",  color: "#f59e0b" },
      { label: "Content", color: "#0b0b0c" },
    ],
    dark: {
      ...DEFAULT_ST,
      rail:      { ...E, bg: "#0b0b0c", iconColor: "#ffffff", iconHoverColor: "#e2e8f0", activeBg: "rgba(245,158,11,0.10)", borderColor: "rgba(39,39,42,0.80)" },
      sidebar:   { ...E, bg: "#131315", fg: "#d4d4d8",        iconColor: "#ffffff",       activeBg: "rgba(245,158,11,0.08)", borderColor: "rgba(39,39,42,0.80)" },
      header:    { ...E, bg: "#0b0b0c", fg: "#fafafa",                                    borderColor: "rgba(39,39,42,0.80)" },
      panel:     { ...E, borderColor: "rgba(63,63,70,0.80)" },
      banner:    { ...E, bg: "#161618", fg: "#fbbf24" },
      contentBg: { ...E, bg: "#0b0b0c" },
      widget:    { ...E, bg: "#131315" },
      card:      { ...E, bg: "#131315", borderColor: "rgba(39,39,42,0.80)" },
      table:     { ...E, bg: "#0b0b0c", borderColor: "rgba(39,39,42,0.80)" },
    },
    light: {
      ...DEFAULT_ST,
      rail:    { ...E, bg: "#f4f3ee", iconColor: "#d97706", iconHoverColor: "#b45309", activeBg: "rgba(217,119,6,0.08)", borderColor: "rgba(217,119,6,0.15)" },
      sidebar: { ...E, bg: "#fafaf7", fg: "#18181b",        iconColor: "#d97706",      activeBg: "rgba(217,119,6,0.06)", borderColor: "rgba(217,119,6,0.12)" },
      header:  { ...E, bg: "#f4f3ee", fg: "#18181b",                                   borderColor: "rgba(217,119,6,0.15)" },
      panel:   { ...E, borderColor: "rgba(217,119,6,0.20)" },
    },
  },
];

// ─── Section config ───────────────────────────────────────────────────────────

const SHELL_SECTIONS:   { id: Section; label: string }[] = [
  { id: "rail",    label: "Icon Rail"    },
  { id: "sidebar", label: "Sidebar"      },
  { id: "header",  label: "Header"       },
  { id: "panel",   label: "Panel Border" },
];

const CONTENT_SECTIONS: { id: Section; label: string }[] = [
  { id: "banner",    label: "Banner"     },
  { id: "contentBg", label: "Content BG" },
  { id: "widget",    label: "Widgets"    },
  { id: "card",      label: "Cards"      },
  { id: "table",     label: "Tables"     },
  { id: "button",    label: "Buttons"    },
];

const ALL_SECTIONS = [...SHELL_SECTIONS, ...CONTENT_SECTIONS];

interface ColorRowDef { key: ColorKey; label: string; presets: Preset[]; }

const ROWS_BY_SECTION: Record<Section, ColorRowDef[]> = {
  rail:      [
    { key: "bg",             label: "Background", presets: BG_PRESETS        },
    { key: "iconColor",      label: "Icons",      presets: FG_PRESETS        },
    { key: "iconHoverColor", label: "Icon Hover", presets: FG_PRESETS        },
    { key: "activeBg",       label: "Active BG",  presets: ACTIVE_BG_PRESETS },
    { key: "borderColor",    label: "Border",     presets: BORDER_PRESETS    },
  ],
  sidebar:   [
    { key: "bg",          label: "Background", presets: BG_PRESETS        },
    { key: "fg",          label: "Text",       presets: FG_PRESETS        },
    { key: "iconColor",   label: "Icons",      presets: FG_PRESETS        },
    { key: "activeBg",    label: "Active BG",  presets: ACTIVE_BG_PRESETS },
    { key: "borderColor", label: "Border",     presets: BORDER_PRESETS    },
  ],
  header:    [
    { key: "bg",          label: "Background",    presets: BG_PRESETS        },
    { key: "fg",          label: "Text",          presets: FG_PRESETS        },
    { key: "borderColor", label: "Border",        presets: BORDER_PRESETS    },
    { key: "altBg",       label: "Input Border",  presets: BORDER_PRESETS    },
    { key: "iconColor",   label: "Search BG",     presets: ACTIVE_BG_PRESETS },
    { key: "activeBg",    label: "Search Border", presets: BORDER_PRESETS    },
  ],
  panel:     [{ key: "borderColor", label: "Border", presets: BORDER_PRESETS }],
  banner:    [
    { key: "bg", label: "Background", presets: BG_PRESETS },
    { key: "fg", label: "Text",       presets: FG_PRESETS },
  ],
  contentBg: [{ key: "bg", label: "Background", presets: BG_PRESETS }],
  widget:    [
    { key: "bg",          label: "Background", presets: BG_PRESETS     },
    { key: "borderColor", label: "Border",     presets: BORDER_PRESETS },
  ],
  card:      [
    { key: "bg",          label: "Background", presets: BG_PRESETS     },
    { key: "borderColor", label: "Border",     presets: BORDER_PRESETS },
  ],
  table:     [
    { key: "bg",          label: "Row BG",       presets: BG_PRESETS        },
    { key: "altBg",       label: "Alt Row BG",   presets: BG_PRESETS        },
    { key: "activeBg",    label: "Header BG",    presets: ACTIVE_BG_PRESETS },
    { key: "fg",          label: "Pagination BG",presets: BG_PRESETS        },
    { key: "iconColor",   label: "Input Border", presets: BORDER_PRESETS    },
    { key: "borderColor", label: "Border",       presets: BORDER_PRESETS    },
  ],
  button:    [
    { key: "bg",          label: "Background", presets: ACTIVE_BG_PRESETS },
    { key: "activeBg",    label: "Hover BG",   presets: ACTIVE_BG_PRESETS },
    { key: "fg",          label: "Text",       presets: FG_PRESETS        },
    { key: "borderColor", label: "Border",     presets: BORDER_PRESETS    },
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Swatch({ preset, selected, onClick }: { preset: Preset; selected: boolean; onClick: () => void }) {
  const isEmpty = preset.value === "";
  const isNone  = preset.value === "transparent";

  return (
    <button
      type="button"
      title={preset.label}
      onClick={onClick}
      className={cn(
        "w-4 h-4 rounded-full shrink-0 border transition-all duration-100 hover:scale-110",
        selected ? "ring-2 ring-offset-1 ring-offset-background ring-info scale-110" : "ring-0",
        isEmpty  && "bg-muted/60 border-border/60",
        isNone   && "bg-transparent border-border/50",
        !isEmpty && !isNone && "border-transparent",
      )}
      style={!isEmpty && !isNone ? { backgroundColor: preset.value } : undefined}
    >
      {isEmpty && (
        <span className="flex items-center justify-center w-full h-full text-[6px] font-bold text-muted-foreground leading-none">D</span>
      )}
      {isNone && (
        <span className="flex items-center justify-center w-full h-full">
          <div className="w-2 h-px bg-border/60 rotate-45" />
        </span>
      )}
    </button>
  );
}

function ColorRow({ row, value, onChange }: { row: ColorRowDef; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/25 last:border-0">
      <span className="w-20 shrink-0 text-[11px] text-muted-foreground font-medium">{row.label}</span>
      <div className="flex-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-center gap-1 w-max">
          {row.presets.map((p) => (
            <Swatch key={p.label} preset={p} selected={value === p.value} onClick={() => onChange(p.value)} />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {value && (
          <div
            className="w-3.5 h-3.5 rounded border border-border/40 shrink-0"
            style={{ backgroundColor: value === "transparent" ? "transparent" : value }}
          />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#hex / rgba"
          className="w-24 text-[10px] bg-muted/20 border border-border/40 rounded px-2 py-1 text-foreground font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-info/50 transition-colors"
        />
      </div>
    </div>
  );
}

function SectionTab({ id, label, active, onClick }: { id: Section; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150 whitespace-nowrap",
        active
          ? "bg-info/10 text-info border border-info/20"
          : "text-muted-foreground border border-transparent hover:text-foreground hover:bg-muted/10",
      )}
    >
      {label}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const EMPTY_COLORS: ComponentColors = { bg: "", fg: "", iconColor: "", iconHoverColor: "", activeBg: "", borderColor: "", altBg: "" };

export function ThemeCustomizer() {
  const dispatch = useAppDispatch();

  const [editMode,         setEditMode]         = useState<"light" | "dark">("dark");
  const [section,          setSection]          = useState<Section>("rail");
  const [paletteName,      setPaletteName]      = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const customization  = useAppSelector((s) => s.themeCustomization);
  const currentSection = customization[editMode][section] ?? EMPTY_COLORS;
  const savedPalettes  = customization.savedPalettes;
  const rows           = ROWS_BY_SECTION[section];
  const sectionLabel   = ALL_SECTIONS.find((s) => s.id === section)?.label ?? "";
  const selectedPreset = BUILT_IN_PRESETS.find((p) => p.id === selectedPresetId) ?? null;

  function handleColor(key: ColorKey, value: string) {
    dispatch(setColor({ mode: editMode, section, key, value }));
  }

  function handleSavePalette() {
    if (!paletteName.trim()) return;
    dispatch(savePalette({ name: paletteName.trim() }));
    setPaletteName("");
  }

  function handleSelectPreset(preset: BuiltInPreset) {
    dispatch(applyPreset({ light: preset.light, dark: preset.dark }));
    setSelectedPresetId(preset.id === selectedPresetId ? null : preset.id);
  }

  return (
    <div className="space-y-4">

      {/* Built-in presets */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">Presets</p>
        <div className="grid grid-cols-5 gap-2">
          {BUILT_IN_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={cn(
                  "flex flex-col items-center gap-2 py-3 px-2 rounded-lg border transition-all duration-150 group",
                  isSelected
                    ? "border-info/50 bg-info/8 ring-1 ring-info/20"
                    : "border-border/20 bg-muted/5 hover:border-border/40 hover:bg-muted/10",
                )}
              >
                <div className="flex gap-1">
                  {preset.colors.map((c, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-white/10 shrink-0"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  isSelected ? "text-info" : "text-muted-foreground group-hover:text-foreground",
                )}>
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Preset detail panel */}
        {selectedPreset && (
          <div className="rounded-lg border border-border/30 bg-muted/5 p-3 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[12px] font-semibold text-foreground">{selectedPreset.name}</p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">{selectedPreset.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPresetId(null)}
                className="text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0 mt-0.5"
              >
                ×
              </button>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/40 mb-1.5">Dark Mode Palette</p>
              <div className="flex flex-wrap gap-2">
                {selectedPreset.palette.map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-5 rounded border border-white/10 shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div>
                      <p className="text-[9px] text-muted-foreground/50 leading-none">{label}</p>
                      <p className="text-[9px] font-mono text-muted-foreground/70 leading-tight">{color}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/40 mb-1.5">Light Mode</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Rail",    color: selectedPreset.light.rail.bg        || "#f1f5f9" },
                  { label: "Sidebar", color: selectedPreset.light.sidebar.bg     || "#f8fafc" },
                  { label: "Header",  color: selectedPreset.light.header.bg      || "#ffffff" },
                  { label: "Icons",   color: selectedPreset.light.rail.iconColor || selectedPreset.dark.rail.iconColor },
                ].map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-5 rounded border border-black/10 shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div>
                      <p className="text-[9px] text-muted-foreground/50 leading-none">{label}</p>
                      <p className="text-[9px] font-mono text-muted-foreground/70 leading-tight">{color}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border/15" />

      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-muted-foreground/50 font-medium">Editing:</span>
        <div className="flex gap-px p-0.5 rounded-lg bg-muted/20 border border-border/30">
          {(["light", "dark"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setEditMode(m)}
              className={cn(
                "px-3.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150 capitalize",
                editMode === m
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Section selector */}
      <div className="space-y-2.5 rounded-lg border border-border/30 bg-muted/10 px-3 py-3">
        <div className="space-y-1.5">
          <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">Shell</span>
          <div className="flex flex-wrap gap-1">
            {SHELL_SECTIONS.map((s) => (
              <SectionTab key={s.id} id={s.id} label={s.label} active={section === s.id} onClick={() => setSection(s.id)} />
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">Content</span>
          <div className="flex flex-wrap gap-1">
            {CONTENT_SECTIONS.map((s) => (
              <SectionTab key={s.id} id={s.id} label={s.label} active={section === s.id} onClick={() => setSection(s.id)} />
            ))}
          </div>
        </div>
      </div>

      {/* Color rows */}
      <div className="rounded-lg border border-border/30 bg-muted/10 px-3 py-1">
        {rows.map((row) => (
          <ColorRow
            key={row.key}
            row={row}
            value={currentSection[row.key]}
            onChange={(v) => handleColor(row.key, v)}
          />
        ))}
      </div>

      {/* Reset + save palette */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => dispatch(resetSection({ mode: editMode, section }))}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium border border-border/30 text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-all duration-150"
        >
          <RotateCcw size={10} />
          Reset {sectionLabel}
        </button>
        <button
          type="button"
          onClick={() => dispatch(resetMode({ mode: editMode }))}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium border border-border/30 text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-all duration-150"
        >
          <RotateCcw size={10} />
          Reset All
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={paletteName}
            onChange={(e) => setPaletteName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSavePalette()}
            placeholder="Palette name…"
            className="w-32 text-[11px] bg-muted/20 border border-border/40 rounded-md px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-info/50 transition-colors"
          />
          <button
            type="button"
            onClick={handleSavePalette}
            disabled={!paletteName.trim()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-info/8 border border-info/20 text-info hover:bg-info/12 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
          >
            <Save size={10} />
            Save
          </button>
        </div>
      </div>

      {/* Saved palettes */}
      {savedPalettes.length > 0 && (
        <div className="space-y-1 pt-2 border-t border-border/30">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 mb-2">Saved Palettes</p>
          {savedPalettes.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/15 bg-muted/5"
            >
              <span className="flex-1 text-[12px] text-foreground truncate">{p.name}</span>
              <button
                type="button"
                onClick={() => dispatch(applyPalette({ id: p.id }))}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-info/8 border border-info/15 text-info hover:bg-info/15 transition-all duration-150"
              >
                <Check size={9} />
                Apply
              </button>
              <button
                type="button"
                onClick={() => dispatch(deletePalette({ id: p.id }))}
                className="p-1 rounded text-muted-foreground/40 hover:text-error hover:bg-error/8 transition-all duration-150"
                aria-label="Delete palette"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
