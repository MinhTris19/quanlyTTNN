// =============================================================================
// MAIN REPORT COMPILER SCRIPT: LINGUAHUB ACADEMIC REPORT (.DOCX)
// Đồ án Học phần: Ứng dụng Trí tuệ Nhân tạo - ICTU Thái Nguyên
// Nhóm thực hiện: Nhóm 13 (Nông Minh Trí, Triệu Quốc Khánh, Trần Xuân Trí)
// Giảng viên hướng dẫn: ThS. Nguyễn Thị Tuyển
// =============================================================================

const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Header,
  Footer,
  PageNumber,
  AlignmentType
} = require('docx');

const {
  buildCoverPage,
  buildTaskAssignment,
  buildPreface,
  buildTableOfContents
} = require('./report-builder/section-frontmatter');

const {
  buildChapter1,
  buildChapter2
} = require('./report-builder/section-ch1-ch2');

const {
  buildChapter3,
  buildChapter4
} = require('./report-builder/section-ch3-ch4');

const {
  buildChapter5,
  buildChapter6
} = require('./report-builder/section-ch5-ch6');

const {
  buildChapter7,
  buildChapter8
} = require('./report-builder/section-ch7-ch8');

const {
  buildChapter9,
  buildChapter10
} = require('./report-builder/section-ch9-ch10');

async function compileReport() {
  console.log('🚀 Đang khởi động quy trình xuất báo cáo học thuật chuyên nghiệp LinguaHub AI (.docx)...');

  // Đọc file Logo ICTU
  const logoPath = path.join(__dirname, 'assets', 'logo.png');
  let logoBuffer;
  if (fs.existsSync(logoPath)) {
    logoBuffer = fs.readFileSync(logoPath);
  } else {
    throw new Error(`Không tìm thấy file logo tại ${logoPath}`);
  }

  // Khởi tạo các phần nội dung
  const coverPageChildren = buildCoverPage(logoBuffer);

  const bodyChildren = [
    ...buildTaskAssignment(),
    ...buildPreface(),
    ...buildTableOfContents(),
    ...buildChapter1(),
    ...buildChapter2(),
    ...buildChapter3(),
    ...buildChapter4(),
    ...buildChapter5(),
    ...buildChapter6(),
    ...buildChapter7(),
    ...buildChapter8(),
    ...buildChapter9(),
    ...buildChapter10()
  ];

  // Cấu hình tài liệu chuẩn học thuật ICTU
  const doc = new Document({
    creator: 'Nhóm 13 - K23.K1.KTPM K23A - Khoa CNTT - ICTU',
    title: 'Báo cáo Đồ án Học phần Ứng dụng Trí tuệ Nhân tạo - LinguaHub AI',
    description: 'Hệ thống Quản lý Trung tâm Ngoại ngữ có Tích hợp AI (LinguaHub)',
    sections: [
      // Section 1: Trang bìa (không có Header / Footer)
      {
        properties: {
          page: {
            margin: {
              top: 1134, // 20mm
              bottom: 1134, // 20mm
              left: 1701, // 30mm (chuẩn đóng gáy)
              right: 1134 // 20mm
            }
          }
        },
        children: coverPageChildren
      },
      // Section 2: Toàn bộ nội dung báo cáo (Header nhận diện trường, Footer đánh số trang Trang X / Y)
      {
        properties: {
          page: {
            margin: {
              top: 1134,
              bottom: 1134,
              left: 1701,
              right: 1134
            },
            pageNumbers: {
              start: 2
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 120 },
                children: [
                  new TextRun({
                    text: 'ĐỒ ÁN HỌC PHẦN: ỨNG DỤNG TRÍ TUỆ NHÂN TẠO — NHÓM 13 ICTU',
                    font: 'Times New Roman',
                    size: 18, // 9pt
                    italics: true,
                    color: '64748b'
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120 },
                children: [
                  new TextRun({
                    text: 'Trang ',
                    font: 'Times New Roman',
                    size: 20, // 10pt
                    color: '64748b'
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: 'Times New Roman',
                    size: 20,
                    bold: true,
                    color: '1e3a8a'
                  }),
                  new TextRun({
                    text: ' / ',
                    font: 'Times New Roman',
                    size: 20,
                    color: '64748b'
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: 'Times New Roman',
                    size: 20,
                    color: '64748b'
                  })
                ]
              })
            ]
          })
        },
        children: bodyChildren
      }
    ]
  });

  // Xuất file .docx
  const outputPath = path.join(__dirname, 'BAO_CAO_DU_AN_AI_LINGUAHUB_NHOM13.docx');
  const backupPath = path.join(__dirname, 'docs', 'BAO_CAO_DU_AN_AI_LINGUAHUB_NHOM13.docx');

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  fs.writeFileSync(backupPath, buffer);

  console.log(`✅ ĐÃ XUẤT THÀNH CÔNG FILE WORD BÁO CÁO: ${outputPath} (${buffer.length} bytes)`);
  console.log(`✅ Đã đồng bộ bản sao lưu vào thư mục: ${backupPath}`);
}

compileReport().catch(err => {
  console.error('❌ Lỗi khi xuất báo cáo:', err);
  process.exit(1);
});
