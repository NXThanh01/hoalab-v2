"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpenText, Bot, FileQuestion, FlaskConical, Gamepad2, GraduationCap, Users, Video, type LucideIcon } from "lucide-react";
import type { LearningView } from "@/shared/auth-input";

type GuideStep = {
  title: string;
  description: string;
  items: { label: string; detail: string; icon: LucideIcon }[];
  destination?: { view: LearningView; label: string };
};

const studentSteps: GuideStep[] = [
  {
    title: "Mở bài học đầu tiên",
    description: "Chào bạn đến với HóaLab. Bắt đầu bằng cách chọn khối lớp và bài muốn học.",
    items: [
      { label: "Kho tài liệu", detail: "Bản demo tập trung vào Hóa 12 và sắp bài theo sách giáo khoa.", icon: BookOpenText },
      { label: "Video tương tác", detail: "Video dừng ở các mốc câu hỏi. Trả lời đúng để xem tiếp, rồi mở Sổ tay khi cần tra công thức.", icon: Video },
    ],
    destination: { view: "courses", label: "Mở Kho tài liệu" },
  },
  {
    title: "Ôn lại điều vừa học",
    description: "Chơi một lượt ngắn hoặc luyện theo đề khi bạn đã sẵn sàng.",
    items: [
      { label: "Game ôn tập", detail: "Chơi 4 trò về Ester – Lipid, xem lời giải từng câu và làm lại các câu sai.", icon: Gamepad2 },
      { label: "Luyện đề", detail: "Chọn Hóa 12 và mở thư mục chủ đề để làm quiz hoặc đề thi đã xuất bản.", icon: GraduationCap },
    ],
    destination: { view: "games", label: "Mở Game ôn tập" },
  },
  {
    title: "Thử nghiệm và hỏi khi bí",
    description: "Bạn có thể chuyển giữa các khu vực bằng menu, rồi quay lại bài đang học.",
    items: [
      { label: "Phòng thí nghiệm", detail: "Đổi điều kiện và quan sát phản ứng, chẳng hạn quá trình tạo nylon-6,6.", icon: FlaskConical },
      { label: "Trợ lý Hóa", detail: "Gửi câu hỏi hoặc bài giải của bạn để được giải thích từng bước.", icon: Bot },
    ],
    destination: { view: "lab", label: "Mở Phòng thí nghiệm" },
  },
];

const adminSteps: GuideStep[] = [
  {
    title: "Đăng bài giảng video",
    description: "Trong Admin Studio, mở Bài giảng video và chọn bài muốn cập nhật.",
    items: [
      { label: "Gắn video vào bài", detail: "Tải video hoặc nhập đường dẫn video, rồi kiểm tra bài đã chọn.", icon: Video },
      { label: "Thêm câu hỏi theo mốc", detail: "Đặt thời điểm câu hỏi xuất hiện, rồi chọn Xuất bản để học sinh xem.", icon: FileQuestion },
    ],
  },
  {
    title: "Đưa đề đến học sinh",
    description: "Tạo thư mục theo khối lớp và chủ đề trong Kho đề.",
    items: [
      { label: "Nhập câu hỏi", detail: "Dùng mẫu của Kho đề để nhập câu hỏi, rồi kiểm tra nội dung và đáp án.", icon: BookOpenText },
      { label: "Xuất bản quiz hoặc kỳ thi", detail: "Chọn câu hỏi, đặt thời lượng rồi xuất bản. Theo dõi kết quả trong Lượt thi.", icon: GraduationCap },
    ],
  },
  {
    title: "Quản lý tài khoản",
    description: "Mở Quản lý người dùng để tìm tài khoản theo ID đăng nhập.",
    items: [
      { label: "Đặt lại mật khẩu", detail: "Sao chép mật khẩu tạm để gửi cho người dùng. Hệ thống yêu cầu họ đổi mật khẩu ở lần đăng nhập tiếp theo.", icon: Users },
    ],
  },
];

export function FirstVisitGuide({ role, onDismiss, onExplore }: {
  role: "student" | "admin";
  onDismiss: () => void;
  onExplore?: (view: LearningView) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [position, setPosition] = useState(0);
  const steps = role === "student" ? studentSteps : adminSteps;
  const step = steps[position];
  const isLast = position === steps.length - 1;

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
  }, []);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    dialog.current?.scrollTo({ top: 0 });
  }, [position]);

  function dismiss(destination?: LearningView) {
    dialog.current?.close();
    onDismiss();
    if (destination) onExplore?.(destination);
  }

  return (
    <dialog ref={dialog} aria-labelledby={titleId} aria-describedby={descriptionId}
      onCancel={(event) => { event.preventDefault(); dismiss(); }}
      className="m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-lg overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-0 text-slate-950 shadow-xl backdrop:bg-slate-950/55 sm:max-h-[calc(100dvh-3rem)]">
      <div className="p-5 sm:p-7">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-blue-800">{role === "student" ? "Hướng dẫn HóaLab" : "Hướng dẫn quản trị"}</p>
          <button type="button" onClick={() => dismiss()}
            className="min-h-11 shrink-0 rounded-lg px-2 text-sm font-medium text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-700">
            Bỏ qua
          </button>
        </div>
        <p className="mt-1 text-xs font-medium tabular-nums text-slate-600">Bước {position + 1} / {steps.length}</p>
        <div className="mt-2 flex gap-1" aria-hidden="true">
          {steps.map(({ title }, index) => <span key={title} className={`h-1 flex-1 rounded-full ${index <= position ? "bg-blue-700" : "bg-slate-200"}`} />)}
        </div>
        <h2 id={titleId} ref={heading} tabIndex={-1} className="mt-5 text-2xl font-bold leading-tight tracking-tight focus:outline-none">{step.title}</h2>
        <p id={descriptionId} className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
        <ul className="mt-5 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-slate-50">
          {step.items.map(({ icon: Icon, label, detail }) => (
            <li key={label} className="flex gap-3 px-3 py-3 sm:px-4">
              <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-blue-700" />
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="mt-0.5 text-sm leading-5 text-slate-600">{detail}</p>
              </div>
            </li>
          ))}
        </ul>
        {step.destination && onExplore && <button type="button" onClick={() => dismiss(step.destination?.view)}
          className="mt-1 min-h-11 text-left text-sm font-semibold text-blue-800 hover:underline focus-visible:outline-2 focus-visible:outline-blue-700">
          {step.destination.label}
        </button>}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4">
          {position > 0 && <button type="button" onClick={() => setPosition(position - 1)}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-700">
            <ArrowLeft aria-hidden className="size-4" /> Quay lại
          </button>}
          <button type="button" onClick={() => isLast ? dismiss() : setPosition(position + 1)}
            className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
            {isLast ? "Xong" : "Tiếp tục"} {!isLast && <ArrowRight aria-hidden className="size-4" />}
          </button>
        </div>
      </div>
    </dialog>
  );
}
