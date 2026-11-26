import {
  Atom,
  BookOpenText,
  Bot,
  Calculator,
  Microscope,
  TestTube2,
} from "lucide-react";

export const navigationItems = [
  { label: "Tổng quan", icon: Atom, view: "dashboard" },
  { label: "Kho tài liệu", icon: BookOpenText, view: "courses" },
  { label: "Luyện đề", icon: TestTube2, view: "practice" },
  { label: "Phòng thí nghiệm", icon: Microscope, view: "lab" },
  { label: "Trợ lý Hóa", icon: Bot, view: "ai" },
  { label: "Công cụ", icon: Calculator, view: "tools" },
] as const;

export const featuredLessons = [
  { grade: "Hóa 12", title: "Ester · Lipid", lessons: 7, progress: 42, color: "bg-fuchsia-50 text-fuchsia-700", art: "⌬" },
  { grade: "Hóa 12", title: "Carbohydrate", lessons: 6, progress: 15, color: "bg-cyan-50 text-cyan-700", art: "C₆" },
  { grade: "Hóa 12", title: "Amin · Amino acid", lessons: 8, progress: 0, color: "bg-indigo-50 text-indigo-600", art: "NH₂" },
  { grade: "Hóa 12", title: "Điện hóa · Kim loại", lessons: 9, progress: 0, color: "bg-amber-50 text-amber-700", art: "Zn" },
] as const;
