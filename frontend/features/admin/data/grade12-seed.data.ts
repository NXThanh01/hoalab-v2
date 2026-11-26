import type { Difficulty, QuestionType } from "@/frontend/features/admin/model/admin.types";

type SeedQuestion = {
  id: string;
  type: QuestionType;
  subject: string;
  gradeLevel: 12;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
  points: number;
};

const id = (value: number) => `12000000-0000-4000-8000-${value.toString().padStart(12, "0")}`;

export const grade12Questions: SeedQuestion[] = [
  { id: id(1), type: "multiple_choice", subject: "Ester - Lipid", gradeLevel: 12, prompt: "Ester no, đơn chức, mạch hở có công thức chung nào?", options: ["C_nH_2nO_2 (n ≥ 2)", "C_nH_2n+2O_2", "C_nH_2n-2O_2", "C_nH_2nO"], correctAnswer: "C_nH_2nO_2 (n ≥ 2)", explanation: "Ester no, đơn chức, mạch hở có một liên kết π ở nhóm carbonyl nên có công thức C_nH_2nO_2.", difficulty: "easy", points: 1 },
  { id: id(2), type: "multiple_choice", subject: "Ester - Lipid", gradeLevel: 12, prompt: "Sản phẩm của phản ứng CH_3COOC_2H_5 + NaOH là", options: ["CH_3COONa và C_2H_5OH", "CH_3COOH và C_2H_5ONa", "HCOONa và C_2H_5OH", "CH_3OH và C_2H_5COONa"], correctAnswer: "CH_3COONa và C_2H_5OH", explanation: "Phản ứng xà phòng hóa ester tạo muối carboxylate và alcohol tương ứng.", difficulty: "easy", points: 1 },
  { id: id(3), type: "multiple_choice", subject: "Ester - Lipid", gradeLevel: 12, prompt: "Chất béo là triester của glycerol với", options: ["acid béo", "acid vô cơ", "alcohol đơn chức", "phenol"], correctAnswer: "acid béo", explanation: "Chất béo là triacylglycerol, tức triester của glycerol và các acid béo.", difficulty: "easy", points: 1 },
  { id: id(4), type: "equation", subject: "Ester - Lipid", gradeLevel: 12, prompt: "Viết phương trình ester hóa giữa CH_3COOH và C_2H_5OH.", options: [], correctAnswer: "CH_3COOH + C_2H_5OH ⇌ CH_3COOC_2H_5 + H_2O", explanation: "Phản ứng thuận nghịch, xúc tác H_2SO_4 đặc và đun nóng.", difficulty: "medium", points: 1 },
  { id: id(5), type: "multiple_choice", subject: "Ester - Lipid", gradeLevel: 12, prompt: "Để chuyển chất béo lỏng thành chất béo rắn, người ta thường dùng phản ứng", options: ["hydrogen hóa", "thủy phân", "ester hóa", "oxi hóa"], correctAnswer: "hydrogen hóa", explanation: "Hydrogen cộng vào liên kết đôi C=C trong gốc acid béo không no, làm tăng độ no và nhiệt độ nóng chảy.", difficulty: "medium", points: 1 },
  { id: id(6), type: "multiple_choice", subject: "Carbohydrate", gradeLevel: 12, prompt: "Chất nào sau đây tham gia phản ứng tráng bạc?", options: ["Glucose", "Saccharose", "Tinh bột", "Cellulose"], correctAnswer: "Glucose", explanation: "Glucose có nhóm aldehyde ở dạng mạch hở nên khử được thuốc thử Tollens.", difficulty: "easy", points: 1 },
  { id: id(7), type: "multiple_choice", subject: "Carbohydrate", gradeLevel: 12, prompt: "Thủy phân hoàn toàn saccharose thu được", options: ["glucose và fructose", "hai phân tử glucose", "fructose và galactose", "glucose và cellulose"], correctAnswer: "glucose và fructose", explanation: "Saccharose được tạo từ một gốc glucose và một gốc fructose.", difficulty: "easy", points: 1 },
  { id: id(8), type: "multiple_choice", subject: "Amin - Amino acid", gradeLevel: 12, prompt: "Dung dịch methylamine CH_3NH_2 làm quỳ tím", options: ["chuyển xanh", "chuyển đỏ", "không đổi màu", "mất màu"], correctAnswer: "chuyển xanh", explanation: "Methylamine là base yếu, phản ứng với nước tạo ion OH^-.", difficulty: "easy", points: 1 },
  { id: id(9), type: "multiple_choice", subject: "Amino acid - Protein", gradeLevel: 12, prompt: "Amino acid có tính chất lưỡng tính vì chứa đồng thời", options: ["nhóm -NH_2 và -COOH", "nhóm -OH và -CHO", "liên kết peptide", "vòng benzene và -OH"], correctAnswer: "nhóm -NH_2 và -COOH", explanation: "Nhóm amino có tính base, nhóm carboxyl có tính acid.", difficulty: "easy", points: 1 },
  { id: id(10), type: "multiple_choice", subject: "Polymer", gradeLevel: 12, prompt: "Polymer được điều chế bằng phản ứng trùng hợp ethylene là", options: ["polyethylene", "poly(vinyl chloride)", "nylon-6,6", "poly(methyl methacrylate)"], correctAnswer: "polyethylene", explanation: "nCH_2=CH_2 → (-CH_2-CH_2-)_n.", difficulty: "easy", points: 1 },
  { id: id(11), type: "multiple_choice", subject: "Đại cương kim loại", gradeLevel: 12, prompt: "Kim loại dẫn điện tốt nhất là", options: ["Ag", "Cu", "Al", "Fe"], correctAnswer: "Ag", explanation: "Thứ tự độ dẫn điện thường dùng: Ag > Cu > Au > Al.", difficulty: "easy", points: 1 },
  { id: id(12), type: "multiple_choice", subject: "Điện hóa", gradeLevel: 12, prompt: "Trong pin điện hóa Zn-Cu, tại anode xảy ra quá trình", options: ["Zn → Zn^2+ + 2e", "Cu^2+ + 2e → Cu", "Zn^2+ + 2e → Zn", "Cu → Cu^2+ + 2e"], correctAnswer: "Zn → Zn^2+ + 2e", explanation: "Anode là nơi oxi hóa; Zn có tính khử mạnh hơn Cu nên bị oxi hóa.", difficulty: "medium", points: 1 },
  { id: id(13), type: "multiple_choice", subject: "Kim loại kiềm", gradeLevel: 12, prompt: "Cho Na dư vào dung dịch CuSO_4. Hiện tượng cuối cùng là", options: ["có kết tủa xanh và khí thoát ra", "chỉ có Cu màu đỏ", "chỉ có khí thoát ra", "không có hiện tượng"], correctAnswer: "có kết tủa xanh và khí thoát ra", explanation: "Na phản ứng với nước tạo NaOH và H_2; OH^- tiếp tục tạo Cu(OH)_2 màu xanh.", difficulty: "hard", points: 1 },
  { id: id(14), type: "multiple_choice", subject: "Sắt - Hợp chất sắt", gradeLevel: 12, prompt: "Chất nào oxi hóa Fe^2+ thành Fe^3+?", options: ["Cl_2", "Fe", "Cu", "NaOH"], correctAnswer: "Cl_2", explanation: "Cl_2 là chất oxi hóa mạnh: 2Fe^2+ + Cl_2 → 2Fe^3+ + 2Cl^-.", difficulty: "medium", points: 1 },
  { id: id(15), type: "multiple_choice", subject: "Tổng ôn", gradeLevel: 12, prompt: "Hòa tan hoàn toàn 5,6 g Fe bằng HCl dư. Thể tích H_2 ở đktc là", options: ["2,24 L", "4,48 L", "1,12 L", "6,72 L"], correctAnswer: "2,24 L", explanation: "n_Fe = 0,1 mol; Fe + 2HCl → FeCl_2 + H_2 nên n_H2 = 0,1 mol, V = 2,24 L.", difficulty: "medium", points: 1 },
];

export const grade12Exams = [
  { id: "12000000-0000-4000-9000-000000000001", title: "Chuyên đề Ester - Lipid · 15 phút", description: "Bộ đề khởi động gồm lý thuyết, xà phòng hóa và phản ứng ester hóa.", gradeLevel: 12, durationMinutes: 15, passScore: 8, status: "published" as const, questionIds: grade12Questions.slice(0, 5).map((item) => item.id) },
  { id: "12000000-0000-4000-9000-000000000002", title: "Hữu cơ 12 · Carbohydrate, Amin và Polymer", description: "Luyện nhanh ba chương hữu cơ trọng tâm trong chương trình Hóa học 12.", gradeLevel: 12, durationMinutes: 25, passScore: 7, status: "published" as const, questionIds: grade12Questions.slice(5, 10).map((item) => item.id) },
  { id: "12000000-0000-4000-9000-000000000003", title: "Thi thử tốt nghiệp THPT · Hóa học 12", description: "Đề tổng ôn 15 câu bao quát Hóa hữu cơ, kim loại và điện hóa.", gradeLevel: 12, durationMinutes: 45, passScore: 7, status: "published" as const, questionIds: grade12Questions.map((item) => item.id) },
];
