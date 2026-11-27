import { NextRequest, NextResponse } from "next/server";

type ChatBody = {
  mode?: "explain" | "solve" | "balance" | "quiz";
  messages?: Array<{ role: "assistant" | "user"; content: string }>;
};

function mockAnswer(question: string, mode: ChatBody["mode"]) {
  const normalized = question.toLowerCase();
  if (normalized.includes("fe") && (normalized.includes("cân bằng") || mode === "balance")) {
    return "Ta cân bằng theo số nguyên tử. Chọn hệ số 2 trước Fe_2O_3 để có 4 Fe và 6 O ở vế phải; sau đó đặt 4 trước Fe và 3 trước O_2.\n\nKết quả: 4Fe + 3O_2 → 2Fe_2O_3\n\nKiểm tra: Fe: 4 = 4; O: 6 = 6.";
  }
  if (normalized.includes("ph") || normalized.includes("hcl")) {
    return "HCl là acid mạnh nên phân li hoàn toàn: HCl → H^+ + Cl^-\n\nVới C_HCl = 0,01 M, ta có [H^+] = 10^-2 M.\npH = −log[H^+] = 2.\n\nKết luận: dung dịch có pH = 2.";
  }
  if (normalized.includes("na") && normalized.includes("nước")) {
    return "Na có một electron hóa trị ở phân lớp 3s^1 nên dễ nhường electron để đạt cấu hình bền. Khi gặp nước, phản ứng tỏa nhiệt mạnh và tạo hydrogen.\n\n2Na + 2H_2O → 2NaOH + H_2↑\n\nHiện tượng: Na chạy trên mặt nước, nóng chảy thành giọt tròn và có khí thoát ra.";
  }
  if (normalized.includes("este") || normalized.includes("ester")) {
    return "Phản ứng ester hóa là phản ứng thuận nghịch giữa carboxylic acid và alcohol, xúc tác H_2SO_4 đặc, đun nóng.\n\nCH_3COOH + C_2H_5OH ⇌ CH_3COOC_2H_5 + H_2O\n\nMuốn tăng hiệu suất, có thể dùng dư một chất hoặc tách nước/ester khỏi hệ.";
  }
  if (mode === "quiz" || normalized.includes("trắc nghiệm")) {
    return "Câu 1: Hạt nào quyết định số hiệu nguyên tử?\nA. Neutron  B. Proton  C. Electron hóa trị  D. Nucleon\n\nCâu 2: Nguyên tử có Z = 12 có bao nhiêu electron khi trung hòa?\nA. 10  B. 11  C. 12  D. 24\n\nHãy gửi đáp án theo dạng 1B, 2C để mình chấm.";
  }
  return "Mình sẽ xử lý theo 3 bước: xác định dữ kiện, chọn định luật/công thức phù hợp, rồi kiểm tra đơn vị và tính hợp lý của kết quả. Em hãy gửi đầy đủ đề bài hoặc phương trình cần phân tích để mình hướng dẫn chính xác hơn.";
}

export async function POST(request: NextRequest) {
  if (!await getSessionUser()) return Response.json({ error: "Hãy đăng nhập để dùng trợ lý Hóa học." }, { status: 401 });
  const body = (await request.json()) as ChatBody;
  const messages = body.messages ?? [];
  const question = [...messages].reverse().find((message) => message.role === "user")?.content?.trim();
  if (!question) return NextResponse.json({ error: "Câu hỏi không được để trống." }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    await new Promise((resolve) => setTimeout(resolve, 650));
    return NextResponse.json({ answer: mockAnswer(question, body.mode), model: "mock" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        instructions: `Bạn là trợ lý Hóa học THPT Việt Nam. Chế độ hiện tại: ${body.mode ?? "explain"}. Giải thích từng bước, không bịa dữ kiện, dùng ký hiệu dạng H_2O và SO_4^2- để giao diện render chỉ số chuẩn.`,
        input: messages.map((message) => ({ role: message.role, content: message.content })),
      }),
    });
    if (!response.ok) return NextResponse.json({ answer: mockAnswer(question, body.mode), model: "mock" });
    const data = (await response.json()) as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
    const answer = data.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text;
    return NextResponse.json({ answer: answer || mockAnswer(question, body.mode), model: answer ? "openai" : "mock" });
  } catch {
    return NextResponse.json({ answer: mockAnswer(question, body.mode), model: "mock" });
  }
}
import { getSessionUser } from "@/backend/modules/auth/session";
