export type VirtualExperiment = {
  id: string;
  title: string;
  topic: string;
  duration: string;
  level: "Cơ bản" | "Nâng cao";
  equation: string;
  objective: string;
  reagentA: { name: string; unit: string; min: number; max: number; initial: number };
  reagentB: { name: string; unit: string; min: number; max: number; initial: number };
  optimalRatio: number;
  condition: string;
  temperature: { min: number; max: number; initial: number; optimal: number };
  observation: string;
  conclusion: string;
  liquid: string;
  glow: string;
  gradient: string;
  visualization?: "solution" | "polymer";
  resultLabel?: string;
};

export const virtualExperiments: VirtualExperiment[] = [
  {
    id: "nylon-polycondensation",
    title: "Trùng ngưng nylon-6,6",
    topic: "Polymer",
    duration: "12 phút",
    level: "Nâng cao",
    equation: "nHOOC-(CH_2)_4-COOH + nH_2N-(CH_2)_6-NH_2 → [-OC-(CH_2)_4-CO-NH-(CH_2)_6-NH-]_n + 2nH_2O",
    objective: "Khảo sát ảnh hưởng của tỉ lệ hai monomer và nhiệt độ đến quá trình tạo mạch polyamide nylon-6,6.",
    reagentA: { name: "Adipic acid", unit: "mmol", min: 2, max: 12, initial: 8 },
    reagentB: { name: "Hexamethylenediamine", unit: "mmol", min: 2, max: 12, initial: 8 },
    optimalRatio: 1,
    condition: "Gia nhiệt và liên tục tách H₂O",
    temperature: { min: 180, max: 300, initial: 260, optimal: 280 },
    observation: "Các mắt xích –CO–NH– hình thành liên tiếp, nước được tách ra và mạch nylon-6,6 dài dần.",
    conclusion: "Nylon-6,6 được tạo bởi phản ứng trùng ngưng giữa monomer hai chức; tỉ lệ nhóm –COOH và –NH₂ gần 1:1 giúp thu được mạch polymer dài.",
    liquid: "from-amber-200/90 to-orange-500/90",
    glow: "bg-amber-300",
    gradient: "from-orange-600 via-rose-800 to-slate-950",
    visualization: "polymer",
    resultLabel: "Mức độ tạo mạch",
  },
  {
    id: "esterification",
    title: "Điều chế ethyl acetate",
    topic: "Ester · Lipid",
    duration: "08 phút",
    level: "Cơ bản",
    equation: "CH_3COOH + C_2H_5OH ⇌ CH_3COOC_2H_5 + H_2O",
    objective: "Khảo sát vai trò của tỉ lệ chất, xúc tác và nhiệt độ trong phản ứng ester hóa.",
    reagentA: { name: "CH₃COOH", unit: "mL", min: 1, max: 10, initial: 5 },
    reagentB: { name: "C₂H₅OH", unit: "mL", min: 1, max: 10, initial: 5 },
    optimalRatio: 1,
    condition: "Thêm H₂SO₄ đặc làm xúc tác",
    temperature: { min: 20, max: 90, initial: 60, optimal: 65 },
    observation: "Xuất hiện lớp chất lỏng có mùi thơm nhẹ, ít tan trong nước.",
    conclusion: "Phản ứng ester hóa là phản ứng thuận nghịch; xúc tác acid và đun cách thủy giúp phản ứng diễn ra nhanh hơn.",
    liquid: "from-fuchsia-300/90 to-violet-500/90",
    glow: "bg-fuchsia-300",
    gradient: "from-fuchsia-600 via-violet-700 to-indigo-950",
    visualization: "solution",
  },
  {
    id: "silver-mirror",
    title: "Phản ứng tráng bạc của glucose",
    topic: "Carbohydrate",
    duration: "10 phút",
    level: "Nâng cao",
    equation: "C_6H_12O_6 + 2[Ag(NH_3)_2]OH → C_6H_12O_7 + 2Ag↓ + 4NH_3 + H_2O",
    objective: "Nhận biết nhóm chức aldehyde trong dạng mạch hở của glucose bằng thuốc thử Tollens.",
    reagentA: { name: "Glucose 1%", unit: "mL", min: 1, max: 8, initial: 3 },
    reagentB: { name: "Tollens", unit: "mL", min: 1, max: 8, initial: 6 },
    optimalRatio: 0.5,
    condition: "Dùng thuốc thử Tollens mới pha",
    temperature: { min: 20, max: 80, initial: 55, optimal: 55 },
    observation: "Một lớp bạc sáng bám đều lên thành ống nghiệm.",
    conclusion: "Glucose có tính khử do trong dung dịch tồn tại dạng mạch hở chứa nhóm –CHO.",
    liquid: "from-slate-100/95 to-slate-400/90",
    glow: "bg-slate-100",
    gradient: "from-sky-600 via-blue-800 to-slate-950",
    visualization: "solution",
  },
  {
    id: "biuret",
    title: "Phản ứng màu biuret của protein",
    topic: "Protein",
    duration: "06 phút",
    level: "Cơ bản",
    equation: "Protein + Cu(OH)_2 → phức chất màu tím",
    objective: "Nhận biết liên kết peptide trong protein bằng phản ứng màu biuret.",
    reagentA: { name: "Lòng trắng trứng", unit: "mL", min: 1, max: 10, initial: 5 },
    reagentB: { name: "Cu(OH)₂", unit: "mL", min: 1, max: 6, initial: 2 },
    optimalRatio: 2.5,
    condition: "Tạo môi trường kiềm bằng NaOH",
    temperature: { min: 20, max: 60, initial: 25, optimal: 25 },
    observation: "Dung dịch chuyển sang màu tím đặc trưng.",
    conclusion: "Cu(OH)₂ trong môi trường kiềm tạo phức màu tím với các liên kết peptide của protein.",
    liquid: "from-violet-300/95 to-purple-700/95",
    glow: "bg-violet-300",
    gradient: "from-violet-600 via-purple-800 to-slate-950",
    visualization: "solution",
  },
  {
    id: "galvanic-cell",
    title: "Pin điện hóa Zn–Cu",
    topic: "Điện hóa · Kim loại",
    duration: "12 phút",
    level: "Nâng cao",
    equation: "Zn + Cu^2+ → Zn^2+ + Cu",
    objective: "Quan sát dòng electron và xác định anode, cathode của pin Galvani Zn–Cu.",
    reagentA: { name: "ZnSO₄ 1 M", unit: "mL", min: 10, max: 50, initial: 30 },
    reagentB: { name: "CuSO₄ 1 M", unit: "mL", min: 10, max: 50, initial: 30 },
    optimalRatio: 1,
    condition: "Nối cầu muối KNO₃",
    temperature: { min: 20, max: 50, initial: 25, optimal: 25 },
    observation: "Điện cực Zn tan dần, Cu bám ở cathode và vôn kế chỉ xấp xỉ 1,10 V.",
    conclusion: "Zn là anode, bị oxi hóa; Cu²⁺ nhận electron ở cathode. Electron đi từ Zn sang Cu qua mạch ngoài.",
    liquid: "from-cyan-300/90 to-blue-600/90",
    glow: "bg-cyan-300",
    gradient: "from-emerald-600 via-teal-800 to-slate-950",
    visualization: "solution",
  },
];
