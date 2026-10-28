// =============================================================================
// SECTION FRONTMATTER: TRANG BÌA, PHÂN CÔNG NHIỆM VỤ, LỜI MỞ ĐẦU, MỤC LỤC
// =============================================================================

const { Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, PageBreak, ImageRun } = require('docx');
const { p, h1, h2, h3, bullet, callout, createTable } = require('./styles');

function buildCoverPage(logoBuffer) {
  return [
    p('ĐẠI HỌC THÁI NGUYÊN', { bold: true, size: 26, align: AlignmentType.CENTER, spaceBefore: 0, spaceAfter: 50 }),
    p('TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN VÀ TRUYỀN THÔNG', { bold: true, size: 26, align: AlignmentType.CENTER, spaceBefore: 0, spaceAfter: 50 }),
    p('KHOA CÔNG NGHỆ THÔNG TIN', { bold: true, size: 24, color: '1e40af', align: AlignmentType.CENTER, spaceBefore: 0, spaceAfter: 180 }),

    // Logo ICTU
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 180 },
      children: [
        new ImageRun({
          data: logoBuffer,
          transformation: { width: 140, height: 140 }
        })
      ]
    }),

    p('BÁO CÁO DỰ ÁN HỌC PHẦN', { bold: true, size: 30, color: '1e3a8a', align: AlignmentType.CENTER, spaceBefore: 80, spaceAfter: 60 }),
    p('ỨNG DỤNG TRÍ TUỆ NHÂN TẠO', { bold: true, size: 34, color: 'dc2626', align: AlignmentType.CENTER, spaceBefore: 0, spaceAfter: 180 }),

    p('ĐỀ TÀI:', { bold: true, size: 24, align: AlignmentType.CENTER, spaceBefore: 80, spaceAfter: 50 }),
    p('XÂY DỰNG HỆ THỐNG QUẢN LÝ TRUNG TÂM NGOẠI NGỮ CÓ TÍCH HỢP AI', { bold: true, size: 28, color: '1e3a8a', align: AlignmentType.CENTER, spaceBefore: 0, spaceAfter: 40 }),
    p('(LINGUAHUB — AI-POWERED LANGUAGE CENTER MANAGEMENT PLATFORM)', { italic: true, size: 22, color: '475569', align: AlignmentType.CENTER, spaceBefore: 0, spaceAfter: 260 }),

    // Bảng thông tin sinh viên & Giảng viên
    new Table({
      width: { size: 90, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.CENTER,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [p('Tên nhóm thực hiện:', { bold: true, size: 24 })]
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [p('NHÓM 13', { bold: true, size: 24, color: '1e3a8a' })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [p('Sinh viên thực hiện:', { bold: true, size: 24 })]
            }),
            new TableCell({
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                p('1. NÔNG MINH TRÍ — Mã SV: DTC2354802010048 — Trưởng nhóm', { bold: true, size: 23 }),
                p('2. TRIỆU QUỐC KHÁNH — Mã SV: DTC2354802010052', { size: 23 }),
                p('3. TRẦN XUÂN TRÍ — Mã SV: DTC2354802010049', { size: 23 })
              ]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [p('Lớp chuyên ngành:', { bold: true, size: 24 })]
            }),
            new TableCell({
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [p('K23.K1.KTPM K23A — Khoa Công nghệ Thông tin', { size: 24 })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [p('Giảng viên hướng dẫn:', { bold: true, size: 24 })]
            }),
            new TableCell({
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [p('ThS. Nguyễn Thị Tuyển', { bold: true, size: 24, color: '1e40af' })]
            })
          ]
        })
      ]
    }),

    p('THÁI NGUYÊN, THÁNG 10 NĂM 2026', { bold: true, size: 24, align: AlignmentType.CENTER, spaceBefore: 300, spaceAfter: 0 })
  ];
}

function buildTaskAssignment() {
  return [
    h1('PHÂN CÔNG NHIỆM VỤ VÀ ĐÓNG GÓP THÀNH VIÊN', false),
    p('Nhằm đảm bảo chất lượng, tiến độ và khối lượng công việc theo đúng đề cương học phần "Ứng dụng Trí tuệ Nhân tạo" của Trường Đại học Công nghệ Thông tin và Truyền thông (ICTU), Nhóm 13 đã xây dựng kế hoạch phân công nhiệm vụ cụ thể, rõ ràng và minh bạch cho từng thành viên.'),

    h2('1. Phân công nhiệm vụ chi tiết theo tiến độ thực hiện (12 Tuần)'),
    p('Toàn bộ quá trình thực hiện đồ án được chia thành 12 tuần với các mốc kiểm soát chất lượng nghiêm ngặt:'),
    createTable(
      ['STT', 'Tên nhiệm vụ / Hạng mục công việc', 'Người phụ trách chính', 'Thời gian & Sản phẩm bàn giao'],
      [
        ['1', 'Khảo sát hiện trạng nghiệp vụ trung tâm ngoại ngữ, phân tích bài toán và thu thập yêu cầu người dùng.', 'Triệu Quốc Khánh', 'Tuần 1 - 2: Hoàn thành tài liệu đặc tả yêu cầu SRS.'],
        ['2', 'Phân tích yêu cầu hệ thống, phân loại 3 Actor, thiết kế danh mục 18 Use Case tổng quan.', 'Triệu Quốc Khánh', 'Tuần 3: Danh mục F01 - F18, sơ đồ Use Case tổng quan.'],
        ['3', 'Thiết kế hướng đối tượng: Sơ đồ Lớp (Class Diagram) và Sơ đồ Tuần tự (Sequence Diagram).', 'Trần Xuân Trí', 'Tuần 4: 8 Thực thể dữ liệu, 4 luồng tuần tự chuẩn UML.'],
        ['4', 'Thiết kế Cơ sở dữ liệu quan hệ (MS SQL Server DDL chuẩn 3NF và In-Memory Data Store).', 'Trần Xuân Trí', 'Tuần 5: 8 bảng quan hệ chuẩn hóa, script DDL hoàn thiện.'],
        ['5', 'Thiết kế giao diện người dùng (UI/UX) cho 3 phân hệ: Admin, Giảng viên, Học viên.', 'Nông Minh Trí', 'Tuần 6 - 7: Giao diện Responsive HTML5/CSS3 hiện đại.'],
        ['6', 'Lập trình Backend RESTful API (Node.js, Express, Session Bearer Authentication).', 'Nông Minh Trí', 'Tuần 8 - 9: server.js với 22 endpoint nghiệp vụ.'],
        ['7', 'Tích hợp Google Gemini API, kiến trúc RAG Grounding và Prompt Engineering cho 3 vai trò.', 'Nông Minh Trí, Triệu Quốc Khánh', 'Tuần 10: gemini-service.js, bộ lọc Guardrails Shield.'],
        ['8', 'Xây dựng cơ chế Auto Model Failover và Resilient Safe Fallback Engine đảm bảo Zero-Crash.', 'Cả nhóm', 'Tuần 11: Chuyển đổi tự động mô hình & Fallback nội bộ.'],
        ['9', 'Thực hiện kiểm thử phần mềm (36 Test cases ma trận, 34/34 Automated Tests) và hoàn thiện báo cáo.', 'Cả nhóm', 'Tuần 12: Đạt 100% tiêu chí chấm điểm, đóng gói đồ án.']
      ],
      [7, 43, 25, 25],
      [AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.LEFT]
    ),

    h2('2. Phân công trách nhiệm và tỷ lệ đóng góp của từng thành viên'),
    createTable(
      ['STT', 'Họ và tên thành viên', 'Vai trò & Trách nhiệm đảm nhiệm chính trong đồ án', 'Mức độ đóng góp'],
      [
        [
          '1',
          'Nông Minh Trí\n(Trưởng nhóm)',
          '• Trưởng nhóm: Điều phối tiến độ, tích hợp mã nguồn và kiểm soát chất lượng đồ án.\n• Thiết kế kiến trúc tổng thể hệ thống (Layered Architecture).\n• Lập trình chính Backend RESTful API (Node.js, Express.js, Session RBAC).\n• Trực tiếp hiện thực hóa tích hợp Google Gemini API (gemini-3.5-flash), kiến trúc RAG Grounding và bộ lọc an ninh Guardrails.\n• Thiết kế giao diện Web hiện đại (HTML5, Modern CSS, Responsive).\n• Biên tập, hiệu đính và tổng hợp tài liệu báo cáo kỹ thuật toàn diện.',
          '100%\n(Hoàn thành xuất sắc)'
        ],
        [
          '2',
          'Triệu Quốc Khánh',
          '• Khảo sát hiện trạng, phỏng vấn nghiệp vụ đào tạo trung tâm ngoại ngữ.\n• Lập danh mục 3 Actor, phân loại chi tiết 18 Use Case hệ thống.\n• Thiết kế và tinh chỉnh cấu trúc System Prompt cho 3 vai trò (Executive AI, Academic AI, Mentor AI).\n• Xây dựng ma trận 36 Test Cases (kiểm thử đúng, sai, biên, chịu lỗi).\n• Trực tiếp thực hiện đo đạc, đánh giá đối chứng 15 benchmark queries giữa 3 phiên bản Prompt (v1, v2, v3).',
          '100%\n(Hoàn thành xuất sắc)'
        ],
        [
          '3',
          'Trần Xuân Trí',
          '• Mô tả đặc tả chi tiết các Use Case quan trọng theo chuẩn học thuật IEEE 830.\n• Thiết kế Sơ đồ Lớp (Class Diagram) và Sơ đồ Tuần tự (Sequence Diagram).\n• Thiết kế mô hình CSDL quan hệ MS SQL Server chuẩn hóa bậc 3 (3NF) gồm 8 bảng.\n• Hiện thực hóa giải pháp In-Memory Database Store kép đảm bảo tính khả chuyển, demo tức thì không cần cài SQL Server.\n• Thiết kế các kịch bản kiểm thử chịu lỗi và an ninh bảo mật hệ thống.',
          '100%\n(Hoàn thành xuất sắc)'
        ]
      ],
      [7, 23, 52, 18],
      [AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.CENTER]
    )
  ];
}

function buildPreface() {
  return [
    h1('LỜI CẢM ƠN VÀ LỜI MỞ ĐẦU', false),
    p('Trong kỷ nguyên chuyển đổi số quốc gia và sự phát triển như vũ bão của cuộc Cách mạng Công nghiệp lần thứ tư, Trí tuệ nhân tạo (AI) — đặc biệt là Trí tuệ nhân tạo tạo sinh (Generative AI) và các Mô hình ngôn ngữ lớn (Large Language Models - LLM) — đang tạo nên những bước đột phá mang tính cách mạng trong mọi ngành nghề và lĩnh vực đời sống xã hội. Trong giáo dục và đào tạo ngoại ngữ, công nghệ không còn chỉ dừng lại ở các hệ thống lưu trữ dữ liệu truyền thống (CRUD) mà đang dịch chuyển mạnh mẽ sang các nền tảng thông minh có khả năng tương tác ngôn ngữ tự nhiên, phân tích dữ liệu đa chiều và cá nhân hóa trải nghiệm học tập của từng học viên.'),
    p('Tại các trung tâm ngoại ngữ hiện nay, công tác quản lý vận hành bao gồm rất nhiều mắt xích phức tạp: quản lý tài khoản người dùng, phân công giảng dạy, theo dõi sĩ số, ghi nhận điểm danh chuyên cần hàng ngày, chấm và nhập điểm thi định kỳ, quản lý học phí, và đặc biệt là tư vấn lộ trình học tập phù hợp. Các phần mềm quản lý truyền thống thường đòi hỏi người dùng phải thực hiện nhiều thao tác lọc, tra cứu phức tạp qua nhiều menu con, gây tốn thời gian và dễ nhầm lẫn. Trong khi đó, học viên rất cần một trợ lý ảo thông minh đồng hành 24/7 để giải đáp thắc mắc về lớp học, điểm số và gợi ý phương pháp học tập phù hợp; giảng viên cần một công cụ sư phạm hỗ trợ nắm bắt ngay tình hình vắng mặt và phổ điểm của lớp; ban quản trị cần một cố vấn điều hành hỗ trợ phân tích hiệu quả hoạt động.'),
    p('Xuất phát từ nhu cầu thực tiễn cấp bách đó, dưới sự định hướng chuyên môn của Bộ môn Công nghệ Phần mềm — Khoa Công nghệ Thông tin, Nhóm 13 đã lựa chọn và thực hiện đề tài: "XÂY DỰNG HỆ THỐNG QUẢN LÝ TRUNG TÂM NGOẠI NGỮ CÓ TÍCH HỢP AI (LINGUAHUB)".'),
    p('Đề tài không chỉ dừng lại ở việc xây dựng một ứng dụng web quản lý trung tâm ngoại ngữ hoàn chỉnh, mà tập trung nghiên cứu sâu các giải pháp công nghệ tiên tiến nhất của Trí tuệ nhân tạo hiện đại:'),
    bullet('Ứng dụng kiến trúc RAG Grounding (Retrieval-Augmented Generation) kết hợp truy vấn CSDL để triệt tiêu hoàn toàn 100% hiện tượng ảo giác số liệu (Hallucination) của LLM.', '• Thứ nhất:'),
    bullet('Áp dụng kỹ thuật Prompt Engineering có hệ thống (Role-Based System Instructions) thiết lập 3 phong cách chuyên biệt cho 3 nhóm đối tượng: Cố vấn điều hành (Admin), Trợ lý sư phạm (Giảng viên) và Cố vấn học tập cá nhân (Học viên).', '• Thứ hai:'),
    bullet('Thiết kế kiến trúc chịu lỗi kiên cường (Resilience Architecture) với cơ chế Auto Model Failover và Resilient Safe Fallback Engine đảm bảo hệ thống không bao giờ bị gián đoạn hay crash ngay cả khi mất mạng quốc tế.', '• Thứ ba:'),
    bullet('Xây dựng bộ lọc an ninh độc lập Guardrails Shield chống các cuộc tấn công Prompt Injection, Jailbreak và bảo vệ an toàn phân quyền dữ liệu cá nhân.', '• Thứ tư:'),
    bullet('Triển khai 3 tính năng AI chuyên sâu phục vụ học tập: AI Tư vấn lớp học, AI Sinh bài tập trắc nghiệm và AI Tóm tắt tiến độ 4 chiều.', '• Thứ năm:'),
    p('Nhóm 13 xin bày tỏ lòng biết ơn chân thành và sâu sắc nhất tới ThS. Nguyễn Thị Tuyển — Giảng viên trực tiếp giảng dạy và hướng dẫn học phần "Ứng dụng Trí tuệ Nhân tạo". Cô đã tận tình truyền đạt những kiến thức khoa học nền tảng, đưa ra những định hướng học thuật quý báu và các tiêu chí đánh giá chuẩn mực, tạo điều kiện thuận lợi nhất giúp nhóm hoàn thành đồ án một cách toàn diện và xuất sắc.'),
    p('Mặc dù nhóm đã nỗ lực hết sức với tinh thần trách nhiệm cao, song do thời gian và kinh nghiệm có hạn nên báo cáo khó tránh khỏi những thiếu sót nhất định. Nhóm rất mong nhận được những ý kiến đóng góp, chỉ bảo quý báu của Quý Thầy/Cô trong Hội đồng chấm thi để đồ án được hoàn thiện hơn nữa.'),
    p('Thái Nguyên, ngày 28 tháng 10 năm 2026\nĐại diện Nhóm 13 — Sinh viên Nông Minh Trí (Trưởng nhóm)', { italic: true, align: AlignmentType.RIGHT, spaceBefore: 120 })
  ];
}

function buildTableOfContents() {
  return [
    h1('MỤC LỤC TỔNG QUAN BÁO CÁO', false),
    createTable(
      ['Nội dung', 'Trang'],
      [
        ['PHÂN CÔNG NHIỆM VỤ VÀ ĐÓNG GÓP THÀNH VIÊN', '2'],
        ['LỜI CẢM ƠN VÀ LỜI MỞ ĐẦU', '3'],
        ['MỤC LỤC TỔNG QUAN BÁO CÁO', '4'],
        ['DANH MỤC CÁC TỪ VIẾT TẮT VÀ THUẬT NGỮ CHUYÊN NGÀNH', '5'],
        ['CHƯƠNG 1: PHÂN TÍCH BÀI TOÁN VÀ TỔNG QUAN HỆ THỐNG', '6'],
        ['  1.1 Bối cảnh bài toán thực tế và tính cấp thiết', '6'],
        ['  1.2 Mục tiêu của hệ thống LinguaHub', '7'],
        ['  1.3 Các nhóm tác nhân người dùng (Actors)', '8'],
        ['  1.4 Quy trình nghiệp vụ cốt lõi của trung tâm ngoại ngữ', '9'],
        ['  1.5 Lý giải vị trí, vai trò tất yếu và giá trị khác biệt của AI Tạo sinh (GenAI)', '10'],
        ['CHƯƠNG 2: PHÂN TÍCH YÊU CẦU CHỨC NĂNG VÀ PHI CHỨC NĂNG', '11'],
        ['  2.1 Danh mục 18 Yêu cầu Chức năng (Functional Requirements F01 - F18)', '11'],
        ['  2.2 Đặc tả chi tiết 4 phân hệ chức năng hệ thống', '13'],
        ['  2.3 Phân tích các Yêu cầu Phi Chức năng (Non-Functional Requirements)', '14'],
        ['  2.4 Đặc tả danh mục điểm cuối RESTful API (25 Endpoints)', '15'],
        ['CHƯƠNG 3: THIẾT KẾ HƯỚNG ĐỐI TƯỢNG VÀ MÔ HÌNH HÓA UML', '16'],
        ['  3.1 Danh sách Actor và Phân nhóm Use Case', '16'],
        ['  3.2 Đặc tả chi tiết 6 Use Case quan trọng theo chuẩn học thuật IEEE 830', '17'],
        ['  3.3 Thiết kế Sơ đồ Lớp (Class Diagram) với 8 lớp thực thể chính', '20'],
        ['  3.4 Thiết kế Sơ đồ Tuần tự (Sequence Diagram) các luồng nghiệp vụ', '21'],
        ['CHƯƠNG 4: THIẾT KẾ CƠ SỞ DỮ LIỆU QUAN HỆ VÀ GIẢI PHÁP ĐÀN HỒI', '22'],
        ['  4.1 Cấu trúc chi tiết và từ điển dữ liệu của toàn bộ 8 bảng CSDL', '22'],
        ['  4.2 Sơ đồ Quan hệ Thực thể (ERD) và các ràng buộc toàn vẹn dữ liệu', '26'],
        ['  4.3 Chiến lược đánh chỉ mục (Indexing) và tối ưu hóa truy vấn', '27'],
        ['  4.4 Giải pháp CSDL kép đàn hồi: In-Memory Database Store trong server.js', '28'],
        ['CHƯƠNG 5: THIẾT KẾ KIẾN TRÚC HỆ THỐNG VÀ GIAO DIỆN NGƯỜI DÙNG', '29'],
        ['  5.1 Mô hình Kiến trúc Phân tầng (4-Tier Layered Architecture)', '29'],
        ['  5.2 Luồng xử lý một yêu cầu Trợ lý AI (End-to-End AI Lifecycle)', '30'],
        ['  5.3 Cơ chế Xác thực và Phân quyền đa cấp (RBAC)', '31'],
        ['  5.4 Thiết kế Giao diện Người dùng (UI/UX) chi tiết 5 màn hình chính', '32'],
        ['CHƯƠNG 6: HIỆN THỰC HÓA CHỨC NĂNG AI VÀ KIẾN TRÚC RAG GROUNDING', '34'],
        ['  6.1 Nền tảng Google Gemini API và cơ sở lựa chọn mô hình gemini-3.5-flash', '34'],
        ['  6.2 Kiến trúc RAG Grounding 3 bước và schema dữ liệu Context', '35'],
        ['  6.3 Cơ chế Tự động luân chuyển mô hình (Auto Model Failover Engine)', '36'],
        ['  6.4 Cơ chế Phục hồi an toàn (Resilient Safe Fallback Engine) Zero-Crash', '37'],
        ['  6.5 Hiện thực hóa 3 Chức năng AI Chuyên sâu (F18.1, F18.2, F18.3)', '38'],
        ['CHƯƠNG 7: THIẾT KẾ VÀ TỐI ƯU HÓA PROMPT THEO 3 VAI TRÒ', '40'],
        ['  7.1 Khung cấu trúc chuẩn 5 thành phần của một System Prompt chuyên nghiệp', '40'],
        ['  7.2 Toàn văn System Prompt của 3 Vai trò (Admin, Giảng viên, Học viên)', '41'],
        ['  7.3 Quá trình tối ưu hóa Prompt qua 3 chu kỳ lặp (v1, v2, v3)', '43'],
        ['  7.4 Tầng An ninh Guardrails Shield chống Prompt Injection và SQL Injection', '44'],
        ['CHƯƠNG 8: MINH CHỨNG ỨNG DỤNG AI TRONG SDLC VÀ TƯ DUY PHẢN BIỆN', '45'],
        ['  8.1 Minh chứng ứng dụng AI xuyên suốt 5 giai đoạn SDLC', '45'],
        ['  8.2 Nhật ký kiểm chứng, phản biện và sửa đổi 4 lỗi nghiêm trọng do AI sinh ra', '47'],
        ['  8.3 Cải tiến và đóng góp sáng tạo độc lập của nhóm tác giả', '49'],
        ['CHƯƠNG 9: THỰC NGHIỆM, KIỂM THỬ VÀ ĐÁNH GIÁ CHẤT LƯỢNG', '50'],
        ['  9.1 Kịch bản kiểm thử toàn diện với Ma trận 36 Test Cases chi tiết', '50'],
        ['  9.2 Kết quả chạy bộ kiểm thử tự động (34/34 Tests Đạt 100% PASS)', '55'],
        ['  9.3 Bảng thực nghiệm so sánh đối chứng 15 benchmark queries giữa 3 phiên bản Prompt', '56'],
        ['  9.4 Tổng hợp các chỉ số đánh giá định lượng chất lượng AI', '59'],
        ['CHƯƠNG 10: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN', '60'],
        ['  10.1 Đánh giá mức độ hoàn thiện so với Chuẩn đầu ra môn học (CLO1 - CLO5, PLO7)', '60'],
        ['  10.2 Kết luận tổng kết đề tài', '61'],
        ['  10.3 Kế hoạch mở rộng và định hướng phát triển trong tương lai', '62'],
        ['TÀI LIỆU THAM KHẢO CHUẨN IEEE', '63']
      ],
      [80, 20],
      [AlignmentType.LEFT, AlignmentType.RIGHT]
    ),

    h2('DANH MỤC CÁC TỪ VIẾT TẮT VÀ THUẬT NGỮ CHUYÊN NGÀNH'),
    createTable(
      ['Ký hiệu / Từ viết tắt', 'Thuật ngữ tiếng Anh đầy đủ', 'Ý nghĩa / Giải thích chuyên môn'],
      [
        ['AI', 'Artificial Intelligence', 'Trí tuệ nhân tạo.'],
        ['GenAI', 'Generative Artificial Intelligence', 'Trí tuệ nhân tạo tạo sinh (sinh văn bản, hình ảnh, mã nguồn).'],
        ['LLM', 'Large Language Model', 'Mô hình ngôn ngữ lớn (ví dụ: Google Gemini, GPT-4).'],
        ['RAG', 'Retrieval-Augmented Generation', 'Kiến trúc kết hợp truy xuất dữ liệu có thẩm quyền với mô hình tạo sinh.'],
        ['RBAC', 'Role-Based Access Control', 'Mô hình kiểm soát truy cập và phân quyền dựa trên vai trò.'],
        ['CRUD', 'Create, Read, Update, Delete', 'Bốn thao tác cơ bản trong quản lý dữ liệu (Thêm, Đọc, Sửa, Xóa).'],
        ['RESTful API', 'Representational State Transfer API', 'Giao diện lập trình ứng dụng theo kiến trúc chuẩn REST qua giao thức HTTP.'],
        ['DDL', 'Data Definition Language', 'Ngôn ngữ định nghĩa cấu trúc dữ liệu trong cơ sở dữ liệu quan hệ.'],
        ['3NF', 'Third Normal Form', 'Dạng chuẩn hóa bậc 3 loại bỏ dư thừa và dị thường dữ liệu trong CSDL.'],
        ['SLA', 'Service Level Agreement', 'Cam kết mức độ dịch vụ và thời gian đáp ứng hệ thống.'],
        ['OOS', 'Out-Of-Scope', 'Các câu hỏi hoặc yêu cầu nằm ngoài phạm vi nghiệp vụ cho phép của hệ thống.'],
        ['CLO', 'Course Learning Outcome', 'Chuẩn đầu ra của học phần đào tạo theo quy định của nhà trường.']
      ],
      [20, 35, 45],
      [AlignmentType.CENTER, AlignmentType.LEFT, AlignmentType.LEFT]
    )
  ];
}

module.exports = {
  buildCoverPage,
  buildTaskAssignment,
  buildPreface,
  buildTableOfContents
};
