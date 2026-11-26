import { FlaskConical, GraduationCap, ListChecks, Scale } from "lucide-react";
import type { AIMode } from "@/frontend/features/ai/model/ai.types";

export const aiModes: Array<{ id: AIMode; label: string; description: string; icon: typeof GraduationCap }> = [
  { id: "explain", label: "Giải thích", description: "Hiểu bản chất khái niệm", icon: GraduationCap },
  { id: "solve", label: "Giải từng bước", description: "Gợi ý, không làm thay", icon: ListChecks },
  { id: "balance", label: "Cân bằng PTHH", description: "Kiểm tra nguyên tử", icon: Scale },
  { id: "quiz", label: "Tạo câu hỏi", description: "Tự kiểm tra kiến thức", icon: FlaskConical },
];

export const aiPromptSuggestions = [
  "Giải thích vì sao Na phản ứng mạnh với nước",
  "Cân bằng Fe + O_2 → Fe_2O_3",
  "Hướng dẫn bài toán tính pH của HCl 0,01 M",
  "Tạo 3 câu trắc nghiệm về cấu tạo nguyên tử",
];

export const aiWelcomeMessage = "Chào Minh Anh! Mình là Copilot Hóa học của HóaLab. Hãy chọn một chế độ học hoặc gửi câu hỏi. Mình sẽ giải thích theo từng bước, kiểm tra đơn vị và dùng ký hiệu hóa học chuẩn.";
