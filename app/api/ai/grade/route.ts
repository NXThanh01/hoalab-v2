import { NextRequest, NextResponse } from "next/server";

type GradePayload = {
  question?: string;
  answer?: string;
  maxScore?: number;
  rubric?: string[];
};

function mockGrade(answer: string, maxScore: number) {
  const normalized = answer.toLowerCase().replace(/\s/g, "");
  const checks = [
    normalized.includes("ch3cooh") && normalized.includes("c2h5oh"),
    normalized.includes("ch3cooc2h5") && normalized.includes("h2o"),
    normalized.includes("h2so4") || normalized.includes("xúctác") || normalized.includes("xuctac"),
    normalized.includes("thuậnnghịch") || normalized.includes("thuận-nghịch") || normalized.includes("⇌") || normalized.includes("cânbằng"),
  ];
  const score = Number(((checks.filter(Boolean).length / checks.length) * maxScore).toFixed(1));

  return {
    score,
    feedback:
      score >= 3
        ? "Phương trình ester hóa được viết đúng và đã nêu được điều kiện hoặc tính thuận nghịch của phản ứng."
        : "Em đã nêu được một phần ý chính, nhưng cần đủ chất tham gia, sản phẩm và điều kiện phản ứng ester hóa.",
    strengths: checks[0] ? ["Xác định đúng acid acetic và ethanol là hai chất tham gia."] : ["Đã nhận ra đây là phản ứng tạo ester."],
    improvements: [
      !checks[1] ? "Viết đầy đủ: CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O." : "Phương trình sản phẩm đã đúng.",
      !checks[2] ? "Bổ sung xúc tác H₂SO₄ đặc và đun nóng." : "Có thể giải thích vai trò xúc tác và cách tăng hiệu suất.",
    ],
    model: "mock" as const,
  };
}

export async function POST(request: NextRequest) {
  if (!await getSessionUser()) return Response.json({ error: "Hãy đăng nhập để nộp bài." }, { status: 401 });
  const body = (await request.json()) as GradePayload;
  const answer = body.answer?.trim() ?? "";
  const maxScore = body.maxScore ?? 4;

  if (!answer) {
    return NextResponse.json({ error: "Câu trả lời không được để trống." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    await new Promise((resolve) => setTimeout(resolve, 850));
    return NextResponse.json(mockGrade(answer, maxScore));
  }

  try {
    const aiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "Bạn là giáo viên Hóa học THPT. Chấm bài nghiêm túc theo rubric. Chỉ trả JSON hợp lệ với score, feedback, strengths, improvements.",
          },
          {
            role: "user",
            content: JSON.stringify({
              question: body.question,
              answer,
              rubric: body.rubric,
              maxScore,
            }),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "chemistry_grade",
            strict: true,
            schema: {
              type: "object",
              properties: {
                score: { type: "number", minimum: 0, maximum: maxScore },
                feedback: { type: "string" },
                strengths: { type: "array", items: { type: "string" } },
                improvements: { type: "array", items: { type: "string" } },
              },
              required: ["score", "feedback", "strengths", "improvements"],
              additionalProperties: false,
            },
          },
        },
      }),
    });

    if (!aiResponse.ok) {
      return NextResponse.json(mockGrade(answer, maxScore));
    }

    const data = (await aiResponse.json()) as {
      output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    };
    const outputText = data.output
      ?.flatMap((item) => item.content ?? [])
      .find((item) => item.type === "output_text")?.text;
    const parsed = JSON.parse(outputText ?? "{}") as Record<string, unknown>;
    return NextResponse.json({ ...parsed, model: "openai" });
  } catch {
    return NextResponse.json(mockGrade(answer, maxScore));
  }
}
import { getSessionUser } from "@/backend/modules/auth/session";
