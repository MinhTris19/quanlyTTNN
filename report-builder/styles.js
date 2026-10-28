// =============================================================================
// STYLES & HELPER UTILITIES FOR LINGUAHUB ACADEMIC REPORT BUILDER (.DOCX)
// Chuẩn định dạng: Luận văn tốt nghiệp / Báo cáo NCKH ICTU
// Font: Times New Roman, Size: 13pt (size 26), Giãn dòng: 1.5 lines (360)
// Lề trang: Top 2cm, Bottom 2cm, Left 3cm, Right 2cm
// =============================================================================

const {
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  PageBreak,
  ShadingType
} = require('docx');

// Hàm tạo đoạn văn bản chuẩn chuẩn 13pt, 1.5 line spacing
function p(text, options = {}) {
  const {
    bold = false,
    italic = false,
    size = 26, // 13pt (docx size is half-points: 26 = 13pt)
    color = '1f2937',
    align = AlignmentType.LEFT,
    spaceBefore = 80,
    spaceAfter = 80,
    font = 'Times New Roman',
    indent = undefined
  } = options;

  return new Paragraph({
    alignment: align,
    spacing: { before: spaceBefore, after: spaceAfter, line: 360 }, // 1.5 line spacing
    indent: indent,
    children: [
      new TextRun({
        text: text,
        bold: bold,
        italics: italic,
        size: size,
        color: color,
        font: font
      })
    ]
  });
}

// Tiêu đề chương (Heading 1) - 16pt Đậm, Xanh đậm
function h1(text, pageBreakBefore = false) {
  const children = [];
  if (pageBreakBefore) {
    children.push(new PageBreak());
  }
  children.push(
    new TextRun({
      text: text,
      bold: true,
      size: 32, // 16pt
      color: '1e3a8a',
      font: 'Times New Roman'
    })
  );

  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    children: children
  });
}

// Tiêu đề mục cấp 2 (Heading 2) - 14pt Đậm
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 28, // 14pt
        color: '1e40af',
        font: 'Times New Roman'
      })
    ]
  });
}

// Tiêu đề mục cấp 3 (Heading 3) - 13pt Đậm
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 26, // 13pt
        color: '334155',
        font: 'Times New Roman'
      })
    ]
  });
}

// Đoạn gạch đầu dòng (Bullet list)
function bullet(text, boldPrefix = '', level = 0) {
  const runs = [];
  if (boldPrefix) {
    runs.push(new TextRun({ text: boldPrefix + ' ', bold: true, size: 26, font: 'Times New Roman', color: '0f172a' }));
  }
  runs.push(new TextRun({ text: text, size: 26, font: 'Times New Roman', color: '1f2937' }));

  return new Paragraph({
    bullet: { level: level },
    spacing: { before: 60, after: 60, line: 360 },
    children: runs
  });
}

// Hộp ghi chú / Callout Box nổi bật
function callout(title, lines, borderColor = '2563eb', bgColor = 'eff6ff') {
  const border = { style: BorderStyle.SINGLE, size: 16, color: borderColor };
  const none = { style: BorderStyle.NONE };

  const contentParagraphs = [
    new Paragraph({
      spacing: { before: 40, after: 80 },
      children: [
        new TextRun({ text: '📌 ' + title, bold: true, size: 24, font: 'Times New Roman', color: borderColor })
      ]
    }),
    ...lines.map(line => new Paragraph({
      spacing: { before: 40, after: 40, line: 320 },
      children: [
        new TextRun({ text: line, size: 22, font: 'Times New Roman', color: '1e293b' })
      ]
    }))
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: { left: border, top: none, right: none, bottom: none },
            shading: { fill: bgColor, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 180, right: 180 },
            children: contentParagraphs
          })
        ]
      })
    ],
    margins: { top: 140, bottom: 140 }
  });
}

// Khối mã nguồn Monospace
function codeBox(lines) {
  return lines.map(line => new Paragraph({
    spacing: { before: 30, after: 30 },
    shading: { fill: 'f8fafc', type: ShadingType.CLEAR },
    children: [
      new TextRun({
        text: line,
        font: 'Consolas',
        size: 20, // 10pt
        color: '0f172a'
      })
    ]
  }));
}

// Hàm tạo bảng chuẩn hóa học thuật
function createTable(headers, rows, colWidths = [], alignments = []) {
  const borderStyle = { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' };
  const cellBorders = {
    top: borderStyle,
    bottom: borderStyle,
    left: borderStyle,
    right: borderStyle
  };

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: colWidths[i] ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined,
      shading: { fill: '1e3a8a', type: ShadingType.CLEAR },
      borders: cellBorders,
      margins: { top: 120, bottom: 120, left: 140, right: 140 },
      children: [
        new Paragraph({
          alignment: alignments[i] || AlignmentType.CENTER,
          spacing: { before: 40, after: 40 },
          children: [
            new TextRun({ text: h, bold: true, color: 'ffffff', size: 22, font: 'Times New Roman' })
          ]
        })
      ]
    }))
  });

  const bodyRows = rows.map((row, rIdx) => new TableRow({
    children: row.map((cellText, cIdx) => new TableCell({
      width: colWidths[cIdx] ? { size: colWidths[cIdx], type: WidthType.PERCENTAGE } : undefined,
      shading: rIdx % 2 === 1 ? { fill: 'f8fafc', type: ShadingType.CLEAR } : undefined,
      borders: cellBorders,
      margins: { top: 90, bottom: 90, left: 140, right: 140 },
      children: [
        new Paragraph({
          alignment: alignments[cIdx] || AlignmentType.LEFT,
          spacing: { before: 30, after: 30 },
          children: [
            new TextRun({ text: cellText, size: 22, font: 'Times New Roman', color: '1f2937' })
          ]
        })
      ]
    }))
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
    margins: { top: 120, bottom: 120 }
  });
}

module.exports = {
  p,
  h1,
  h2,
  h3,
  bullet,
  callout,
  codeBox,
  createTable
};
