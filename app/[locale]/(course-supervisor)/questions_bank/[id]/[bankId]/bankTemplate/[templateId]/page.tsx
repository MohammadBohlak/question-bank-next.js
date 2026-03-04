'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ExamHeader from '@/components/Examheader';
import {
  Printer, FileText
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { getTemplateById } from '@/store/question';
import { AppDispatch } from '@/store/store';
import { Input } from '@/components/ui/input';
import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver'
export type HeaderField = {
  id: string
  value: string
  visible: boolean
}

export interface ExamHeaderConfig {
  logo?: string
  headerNote?: string

  right: HeaderField[]
  left: HeaderField[]
}

export interface FooterConfig {
  supervisor: string
  wish: string
}

interface TemplateQuestion {
  id: number;
  questionOrder: number;
  assignedPoints: number;
  question: {
    id: number;
    questionText: string | null;
    questionType: {
      code: string;
      hasOptions: boolean;
    };
    questionOptions: Array<{
      id: number;
      optionText: string;
      optionOrder: number;
      isCorrect: boolean;
    }>;
    notes: string | null;
    wordsLimit: number | null;
  };
}

const FONT_FAMILIES = [
  { value: 'Arial, sans-serif', label: 'Arial ( sans-serif )' },
  { value: '"Times New Roman", serif', label: 'Times New Roman ( serif )' },
  { value: '"Courier New", monospace', label: 'Courier New ( monospace )' },
  { value: 'Tahoma, sans-serif', label: 'Tahoma' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: '"Segoe UI", sans-serif', label: 'Segoe UI' },
];

const FONT_SIZES = [
  { value: '12px', label: 'صغير (12px)' },
  { value: '14px', label: 'عادي (14px)' },
  { value: '18px', label: 'كبير (18px)' },
];

const LINE_HEIGHTS = [
  { value: '1.3', label: 'مضغوط (1.3)' },
  { value: '1.6', label: 'عادي (1.6)' },
  { value: '1.8', label: 'مريح (1.8)' },
];

const initialHeaderConfig: ExamHeaderConfig = {
  logo: "/logo2.png",
  headerNote: "",

  right: [
    { id: "university", value: "جامعة دمشق", visible: true },
    { id: "faculty", value: "كلية الهندسة المعلوماتية", visible: true },
    { id: "department", value: "قسم البرمجيات", visible: true },
  ],

  left: [
    { id: "studentName", value: "اسم الطالب:", visible: true },
    { id: "studentId", value: "الرقم الجامعي:", visible: true },
    { id: "duration", value: "المدة: ساعتان", visible: true },
  ],
}

const initialFooterConfig: FooterConfig = {
  supervisor: "",
  wish: "مع تمنياتي بالتوفيق",
}


export default function ExamPaperDisplay() {
  const examPaperRef = useRef<HTMLDivElement>(null);
  const { templateId } = useParams<{ templateId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const [headerConfig, setHeaderConfig] = useState(initialHeaderConfig)
  const [footerConfig, setFooterConfig] = useState(initialFooterConfig)
  const [selectedFontFamily, setSelectedFontFamily] = useState('Arial, sans-serif');
  const [selectedFontSize, setSelectedFontSize] = useState('12px');
  const [selectedLineHeight, setSelectedLineHeight] = useState('1.6');
  const [isPrintingWithAnswers, setIsPrintingWithAnswers] = useState(false);
  const [sectionTitles, setSectionTitles] = useState<Record<string, string>>({});

  // State for the text input field
  const [studentInput, setStudentInput] = useState('');
  const optionTextRefs = useRef<Map<string, HTMLSpanElement>>(new Map());

  // Add this function to get the section title (custom or default)
  const getSectionTitle = (type: string, sectionIndex: number) => {
    const defaultTitles: Record<string, string> = {
      'multiple_choice': 'اختر الإجابة الصحيحة من بين الخيارات التالية',
      'multiple_response': 'اختر الإجابات الصحيحة من بين الخيارات التالية (قد يكون هناك أكثر من إجابة صحيحة)',
      'true_false': 'ضع علامة (✓) أمام العبارة الصحيحة وعلامة (✗) أمام العبارة الخاطئة',
      'essay': 'أجب عن الأسئلة التالية',
    };

    // Use custom title if exists, otherwise use default
    const titleBase = sectionTitles[type] || defaultTitles[type] || type;
    return `القسم ${sectionIndex + 1}: ${titleBase}`;
  };
  useEffect(() => {
    if (templateId) {
      dispatch(getTemplateById(Number(templateId)));
    }
  }, [dispatch, templateId]);

  const examData = useSelector((state: RootState) => state.questions.templateDetails);

  // Inside your component, replace the groupedQuestions useMemo with this:
  const { sections, allQuestions } = React.useMemo(() => {
    if (!examData?.templateQuestions) {
      return { sections: [], allQuestions: [] };
    }

    // Group by type, preserving original order within type
    const groups: Record<string, TemplateQuestion[]> = {};
    examData.templateQuestions.forEach(q => {
      const type = q.question.questionType.code;
      if (!groups[type]) groups[type] = [];
      groups[type].push(q);
    });

    // Define desired type order
    const typeOrder = ['multiple_choice', 'multiple_response', 'true_false', 'essay'];

    // Filter and sort sections by typeOrder, but only include types that exist
    const orderedTypes = typeOrder.filter(type => groups[type]?.length > 0);

    // Build sections with global question list
    let globalIndex = 0;
    const sections: Array<{
      type: string;
      title: string;
      questions: TemplateQuestion[];
    }> = [];
    const allQuestions: Array<{
      question: TemplateQuestion;
      globalIndex: number;
      sectionIndex: number
    }> = [];

    orderedTypes.forEach((type, sectionIdx) => {
      const questions = [...groups[type]].sort((a, b) => a.questionOrder - b.questionOrder);

      const sectionQuestions = questions.map(q => {
        const qWithIndex = {
          question: q,
          globalIndex: ++globalIndex, // starts at 1
          sectionIndex: sectionIdx,
        };
        allQuestions.push(qWithIndex);
        return q;
      });

      sections.push({
        type,
        title: '', // Empty title, we'll generate it dynamically
        questions: sectionQuestions,
      });
    });

    return { sections, allQuestions };
  }, [examData]);

  const handlePrintWithAnswers = () => {
    setIsPrintingWithAnswers(true);
    // Allow DOM to update before printing
    setTimeout(() => {
      window.print();
      // Reset after print dialog closes (prevents screen flash)
      setTimeout(() => setIsPrintingWithAnswers(false), 1000);
    }, 100);
  };

  const handlePrint = () => {
    setIsPrintingWithAnswers(false);
    window.print();
  };

  const cleanupForWordExport = (element: HTMLElement) => {
    // ====== CONVERT HEADER TO 2-COLUMN TABLE FOR WORD ======
    const header = element.querySelector('.exam-header, .border-b.pb-2.mb-2');
    if (header) {
      // Extract all visible print-only content from header
      const headerContent = Array.from(header.querySelectorAll('.print-only'))
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 0);

      // Parse the content into right (institutional) and left (student) sections
      // Assuming first 3 items are institutional, next 3 are student info
      const institutionalInfo = headerContent.slice(0, 3);
      const studentInfo = headerContent.slice(3, 6);

      const university = institutionalInfo[0] || 'جامعة دمشق';
      const college = institutionalInfo[1] || 'كلية الهندسة المعلوماتية';
      const department = institutionalInfo[2] || 'قسم البرمجيات';

      const studentName = studentInfo[0] || 'اسم الطالب:';
      const studentId = studentInfo[1] || 'الرقم الجامعي:';
      const duration = studentInfo[2] || 'المدة: ساعتان';

      // Create 2-column table (RTL: right column first in DOM)
      const table = document.createElement('table');
      table.setAttribute('dir', 'rtl');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.fontSize = '14pt';
      table.style.lineHeight = '1.6';
      table.style.marginBottom = '20px';
      table.style.borderBottom = '2px solid #000';
      table.style.paddingBottom = '10px';

      const row = document.createElement('tr');

      // RIGHT COLUMN - Institutional info (appears on right in RTL)
      const rightCell = document.createElement('td');
      rightCell.style.verticalAlign = 'top';
      rightCell.style.textAlign = 'right';
      rightCell.style.padding = '0 10px';
      rightCell.style.width = '50%';
      rightCell.innerHTML = `
      <div style="font-weight: bold; font-size: 16pt;">${university}</div>
      <div style="margin-top: 4px;">${college}</div>
      <div style="margin-top: 2px;">${department}</div>
    `;

      // LEFT COLUMN - Student info (appears on left in RTL)
      const leftCell = document.createElement('td');
      leftCell.style.verticalAlign = 'top';
      leftCell.style.textAlign = 'left';
      leftCell.style.padding = '0 10px';
      leftCell.style.width = '50%';
      leftCell.innerHTML = `
      <div>${studentName}</div>
      <div style="margin-top: 4px;">${studentId}</div>
      <div style="margin-top: 4px;">${duration}</div>
    `;

      row.appendChild(rightCell);
      row.appendChild(leftCell);
      table.appendChild(row);

      // Replace header with table
      header.replaceWith(table);
    }

    // ... REST OF YOUR CLEANUP LOGIC CONTINUES BELOW ...

    // Remove UI controls
    element.querySelectorAll('.no-print, button, .control-panel, details, summary').forEach(el => {
      el.remove();
    });

    // Convert student input field
    element.querySelectorAll('.student-input-print').forEach(el => {
      const container = document.createElement('div');
      container.style.borderBottom = '1px solid #000';
      container.style.minHeight = '24px';
      container.style.textAlign = 'center';
      container.style.margin = '8px auto';
      container.style.width = '80%';
      container.innerHTML = el.textContent?.trim() || '&nbsp;';
      el.replaceWith(container);
    });

    // Convert footer to static content
    element.querySelectorAll('.footer-editable').forEach(footerEl => {
      const supervisor = footerEl.querySelector('textarea')?.value || '';
      const wish = footerEl.querySelector('input')?.value || footerConfig.wish;

      const footerContent = document.createElement('div');
      footerContent.innerHTML = `
      <div style="margin-bottom: 8px; font-weight: bold;">${supervisor || '&nbsp;'}</div>
      <div style="font-style: italic;">${wish || '&nbsp;'}</div>
    `;
      footerEl.replaceWith(footerContent);
    });

    // Convert MCQ sections to tables
    element.querySelectorAll('[data-section-type="multiple_choice"], [data-section-type="multiple_response"]').forEach(section => {
      const grid = section.querySelector('.grid.grid-cols-2');
      if (!grid) return;

      const questions = Array.from(grid.children) as HTMLElement[];
      const table = document.createElement('table');
      table.setAttribute('dir', 'rtl');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.tableLayout = 'fixed';

      for (let i = 0; i < questions.length; i += 2) {
        const row = document.createElement('tr');

        [0, 1].forEach(colIdx => {
          const cell = document.createElement('td');
          cell.style.width = '50%';
          cell.style.verticalAlign = 'top';
          cell.style.padding = '8px';
          cell.style.border = '1px solid #000';
          cell.style.pageBreakInside = 'avoid';

          if (questions[i + colIdx]) {
            if (colIdx === 0) cell.style.borderRight = 'none';
            if (colIdx === 1) cell.style.borderLeft = 'none';

            questions[i + colIdx].style.border = 'none';
            questions[i + colIdx].style.padding = '0 4px';
            cell.appendChild(questions[i + colIdx]);
          }
          row.appendChild(cell);
        });

        table.appendChild(row);
      }

      grid.replaceWith(table);
    });

    // Convert options inside questions to tables
    element.querySelectorAll('[data-section-type="multiple_choice"] .question-container, [data-section-type="multiple_response"] .question-container').forEach(question => {
      const optionGrid = question.querySelector('.grid.grid-cols-1, .grid.grid-cols-2');
      if (!optionGrid) return;

      const options = Array.from(optionGrid.children) as HTMLElement[];
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.marginTop = '4px';

      options.forEach(opt => {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.style.padding = '2px 4px';
        cell.style.border = '1px solid #999';
        cell.appendChild(opt);
        row.appendChild(cell);
        table.appendChild(row);
      });

      optionGrid.replaceWith(table);
    });

    // Remove borders from True/False and Essay sections
    element.querySelectorAll('[data-section-type="true_false"], [data-section-type="essay"]').forEach(section => {
      section.querySelectorAll('.question-container').forEach(q => {
        (q as HTMLElement).style.border = 'none';
        (q as HTMLElement).style.padding = '6px 0';
      });
    });

    // Convert checkboxes/radios to boxes
    element.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
      const placeholder = document.createElement('span');
      placeholder.style.display = 'inline-block';
      placeholder.style.width = '14px';
      placeholder.style.height = '14px';
      placeholder.style.border = '1px solid #000';
      placeholder.style.marginLeft = '4px';
      input.replaceWith(placeholder);
    });
  };
  const getWordExportStyles = () => {
    return `
    body {
      margin: 0;
      padding: 20px;
      direction: rtl;
      font-family: ${selectedFontFamily}, 'Traditional Arabic', Arial, sans-serif;
      background: white;
      font-size: ${selectedFontSize};
      line-height: ${selectedLineHeight};
    }
    /* Word-specific fixes */
    table {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      mso-table-alt-row-color: #FFFFFF;
    }
    td {
      mso-border-alt: solid windowtext .5pt;
      padding: 2.25pt 4.5pt 2.25pt 4.5pt;
    }
    /* Header styles */
    .exam-header {
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .header-row {
      display: table;
      width: 100%;
      table-layout: fixed;
    }
    .header-col {
      display: table-cell;
      vertical-align: top;
    }
    .header-logo {
      max-height: 60px;
      max-width: 150px;
    }
    /* Section titles */
    .section-title {
      font-size: 16px;
      font-weight: bold;
      padding: 4px 0;
      border-bottom: 1px solid #000;
      margin: 12px 0 8px;
    }
    /* Question numbering */
    .question-number {
      font-weight: bold;
      min-width: 20px;
      display: inline-block;
    }
    /* Correct answers highlighting */
    .correct-answer-option {
      background-color: #E8F5E9 !important;
      mso-background-themecolor: accent3;
      mso-background-themetint: 150;
    }
    /* Page breaks */
    .question-section {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    /* Footer */
    .exam-footer {
      margin-top: 40px;
      padding-top: 15px;
      border-top: 1px solid #000;
      text-align: center;
    }
    /* Student input area */
    .student-input-area {
      text-align: center;
      margin: 15px 0;
      border-bottom: 1px solid #000;
      min-height: 24px;
      padding-bottom: 4px;
    }
  `;
  };
  const exportToWord = () => {
    if (!examPaperRef.current) return;

    // Clone content
    const contentClone = examPaperRef.current.cloneNode(true) as HTMLElement;
    contentClone.querySelectorAll('.no-print').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
    contentClone.querySelectorAll('.print-only').forEach(el => {
      (el as HTMLElement).style.display = 'block';
    });

    // Apply Cleanup
    cleanupForWordExport(contentClone);

    // Generate HTML string
    const htmlString = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word'>
      <head>
        <meta charset="UTF-8">
        <title>Exam Paper</title>
        <style>
          ${getWordExportStyles()}
          
          /* Ensure proper Arabic support */
          * {
            font-family: ${selectedFontFamily}, 'Traditional Arabic', Arial, sans-serif !important;
            direction: rtl !important;
            text-align: right !important;
          }
          
          /* Fix for Word table rendering */
          table {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
            border-collapse: collapse;
            mso-border-alt: solid windowtext .5pt;
          }
          
          td {
            mso-border-alt: solid windowtext .5pt;
            padding: 2.25pt 2.25pt 2.25pt 2.25pt;
          }
        </style>
      </head>
      <body>
        ${contentClone.outerHTML}
      </body>
    </html>
  `;

    // Convert and save
    const converted = htmlDocx.asBlob(htmlString, {
      orientation: 'portrait',
      margins: { top: 720, right: 720, bottom: 720, left: 720 }
    });

    const fileName = examData?.code
      ? `${examData.code.replace(/\s+/g, '_')}_exam.docx`
      : 'exam_paper.docx';

    saveAs(converted, fileName);
  };
  const printStyles = `
  @media print {
    html, body {
      height: auto !important;
      overflow: visible !important;
    }
    .grid {
      break-inside: auto !important;
    }

    .grid > div {
      break-inside: avoid;
    }
    
    /* 
      CRITICAL: Ensure questions are never split across pages.
      This forces the whole question block to the next page if it doesn't fit.
    */
    .question-container {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
    }

    /* 
      LOCK PAGES: 
      Force a physical page break after every 20-question block.
      This ensures the numbering (Page X/Y) aligns with these blocks.
    */
    .multi-mcq-page {
      break-inside: auto;
      page-break-inside: auto;
      
      break-after: page;
      page-break-after: always;
    }

    /* Don't force break on the very last element to avoid blank page */
    .multi-mcq-page:last-child {
      break-after: auto;
      page-break-after: auto;
    }

    .multi-select-grid-print {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      grid-auto-flow: column !important;
      gap: 6px !important;
    }

    @page {
      margin: 0.2cm 0.2cm 2cm; /* bottom margin = 2cm */
          size: auto;
          
      @bottom-center {
        content: "الصفحة " counter(page) "/" counter(pages);
        font-family: Arial, sans-serif;
        font-size: 12pt;
        color: #000;
        border-top: 1px solid #000;
        padding-top: 5px;
      }
      /* CRITICAL: Blank all other margin boxes */
      @top-left, @top-center, @top-right,
      @bottom-left, @bottom-right {
        content: "";
      }
    }

    /* Ensure all text elements inherit the font settings */
    .exam-paper-container *,
    .exam-paper-container *::before,
    .exam-paper-container *::after {
      font-family: inherit !important;
      font-size: inherit !important;
      line-height: inherit !important;
    }

    /* Special handling for code/monospace elements */
    .exam-paper-container code,
    .exam-paper-container pre,
    .exam-paper-container kbd,
    .exam-paper-container samp {
      font-family: inherit !important;
    }

    * {
      overflow: visible !important;
      max-height: none !important;
    }

    .no-print {
      display: none !important;
    }

    .print-only {
      display: block !important;
    }

    .no-screen {
      display: none !important;
    }

    .exam-paper-container {
      box-shadow: none !important;
      border: none !important;
      margin: 0 !important;
      padding: 0 !important;
    }
  .exam-paper-container {
    font-family: var(--exam-font-family) !important;
    font-size: var(--exam-font-size) !important;
    line-height: var(--exam-line-height) !important;
  }

    img {
      max-width: 100% !important;
      page-break-inside: avoid;
    }

    body {
      background: white !important;
    }

    /* PAGE BREAK CONTROL - PREVENT SECTION SPLITTING IF DESIRED, 
       though questions take priority */
    .question-section {
      page-break-inside: auto !important;
      break-inside: auto !important;
    }
    
    /* Force page break before very large questions (fallback) */
    .question-container.very-large {
      page-break-inside: auto !important;
      break-inside: auto !important;
      page-break-before: always !important;
    }
    
    .exam-paper-container {
      min-height: 95vh !important;
    }
    
    /* SIMPLE GREEN BACKGROUND FOR CORRECT ANSWERS */
    .print-with-answers .correct-answer-option {
      background-color: rgba(220, 252, 231, 0.5) !important; /* Light green */
      border: 1px solid rgba(34, 197, 94, 0.3) !important; /* Green border */
    }
    
    /* Remove all extra icons and text */
    .print-with-answers .correct-answer-option::after,
    .print-with-answers .correct-answer-option::before {
      display: none !important;
    }
    
    .print-with-answers .correct-indicator {
      display: none !important;
    }
  }

    /* Screen-only styles */
    .print-only {
      display: none;
    }
    
    /* Simple green background for screen preview */
    .print-with-answers .correct-answer-option {
      background-color: #dcfce7 !important;
      border: 1px solid #22c55e !important;
    }
    
    .correct-indicator {
      display: none;
    }
    
    .correct-answer-option::after {
      display: none;
    }
    
    /* Student input field styles for print */
    .student-input-print {
      border-bottom: 0.2px solid gray  !important;
      background: white !important;
      min-height: 10px !important;
      margin:  auto !important;
      margin-bottom:2px
      width: 80% !important;
      display: block !important;
    }
  `;
  <style jsx global>{`
      .exam-paper-container {
        transition: font-family 0.3s ease, font-size 0.3s ease, line-height 0.3s ease;
      }
      
      @media (prefers-reduced-motion) {
        .exam-paper-container {
          transition: none !important;
        }
      }
    `}</style>

  return (
    <div className="p-4 print:p-0 print:bg-white" dir="rtl">
      {/* Print styles */}
      <style jsx global>{printStyles}</style>

      {/* Control Panel */}
      <div className="no-print mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          {/* Print Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={exportToWord}
              className="gap-2 border border-green-300 bg-white hover:bg-green-50 text-green-700"
              variant="outline"
            >
              <FileText className="h-4 w-4" />
              تصدير إلى Word
            </Button>
            <Button
              onClick={handlePrint}
              className="gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-800"
              variant="outline"
            >
              <Printer className="h-4 w-4" />
              طباعة
            </Button>
            <Button
              onClick={handlePrintWithAnswers}
              className="gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-800"
              variant="outline"
            >
              طباعة مع الإجابات
            </Button>

          </div>

          {/* Font Controls - Hidden on mobile to save space */}
          <div className="flex flex-wrap items-center gap-4 ms-auto border-l border-gray-200 pl-4 max-md:hidden">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 whitespace-nowrap">الخط:</label>
              <select
                value={selectedFontFamily}
                onChange={(e) => setSelectedFontFamily(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="ltr"
              >
                {FONT_FAMILIES.map(font => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 whitespace-nowrap">الحجم:</label>
              <select
                value={selectedFontSize}
                onChange={(e) => setSelectedFontSize(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {FONT_SIZES.map(size => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 whitespace-nowrap">التباعد:</label>
              <select
                value={selectedLineHeight}
                onChange={(e) => setSelectedLineHeight(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LINE_HEIGHTS.map(lh => (
                  <option key={lh.value} value={lh.value}>
                    {lh.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mobile-friendly font controls (collapsible) */}
        <div className="mt-3 md:hidden">
          <details className="border border-gray-200 rounded-lg">
            <summary className="list-none p-3 bg-gray-50 hover:bg-gray-100 rounded-t-lg cursor-pointer font-medium text-gray-700">
              ⚙️ إعدادات الخط (اضغط للتوسيع)
            </summary>
            <div className="p-3 space-y-3 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع الخط</label>
                <select
                  value={selectedFontFamily}
                  onChange={(e) => setSelectedFontFamily(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dir="ltr"
                >
                  {FONT_FAMILIES.map(font => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">حجم الخط</label>
                <select
                  value={selectedFontSize}
                  onChange={(e) => setSelectedFontSize(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {FONT_SIZES.map(size => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تباعد الأسطر</label>
                <select
                  value={selectedLineHeight}
                  onChange={(e) => setSelectedLineHeight(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {LINE_HEIGHTS.map(lh => (
                    <option key={lh.value} value={lh.value}>
                      {lh.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </details>
        </div>

        {/* Section Titles Editor - Collapsible */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <details className="border border-gray-200 rounded-lg">
            <summary className="list-none p-3 bg-gray-50 hover:bg-gray-100 rounded-t-lg cursor-pointer font-medium text-gray-700">
              📝 تعديل عناوين الأقسام
            </summary>
            <div className="p-3 space-y-3 border-t border-gray-200">
              {sections.length > 0 ? (
                sections.map((section, index) => {
                  const defaultTitles: Record<string, string> = {
                    'multiple_choice': 'اختر الإجابة الصحيحة من بين الخيارات التالية',
                    'multiple_response': 'اختر الإجابات الصحيحة من بين الخيارات التالية (قد يكون هناك أكثر من إجابة صحيحة)',
                    'true_false': 'ضع علامة (✓) أمام العبارة الصحيحة وعلامة (✗) أمام العبارة الخاطئة',
                    'essay': 'أجب عن الأسئلة التالية',
                  };

                  const currentTitle = sectionTitles[section.type] || defaultTitles[section.type];
                  const sectionTypeNames: Record<string, string> = {
                    'multiple_choice': 'اختيار من متعدد',
                    'multiple_response': 'اختيار متعدد',
                    'true_false': 'صح أم خطأ',
                    'essay': 'مقالي',
                  };

                  return (
                    <div key={section.type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          {sectionTypeNames[section.type] || section.type} (القسم {index + 1})
                        </label>
                        {sectionTitles[section.type] && (
                          <Button
                            onClick={() => setSectionTitles(prev => {
                              const newTitles = { ...prev };
                              delete newTitles[section.type];
                              return newTitles;
                            })}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                          >
                            إعادة للافتراضي
                          </Button>
                        )}
                      </div>
                      <textarea
                        value={currentTitle}
                        onChange={(e) => setSectionTitles(prev => ({
                          ...prev,
                          [section.type]: e.target.value
                        }))}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                        rows={2}
                        placeholder={`اكتب عنوان القسم ${index + 1} هنا...`}
                        dir="rtl"
                      />
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">
                  لم يتم تحميل الأقسام بعد
                </p>
              )}
            </div>
          </details>
        </div>
      </div>

      {/* Exam Paper Content */}
      <div
        ref={examPaperRef}
        className={`exam-paper-container mx-auto max-w-5xl bg-white shadow-lg rounded-lg border border-gray-300 px-4  ${isPrintingWithAnswers ? 'print-with-answers' : ''
          }`}
        style={{
          fontFamily: selectedFontFamily,
          fontSize: selectedFontSize,
          lineHeight: selectedLineHeight,
          // Ensure these styles apply to print too
          '--exam-font-family': selectedFontFamily,
          '--exam-font-size': selectedFontSize,
          '--exam-line-height': selectedLineHeight,
        } as React.CSSProperties}
      >
        {/* Exam Header */}
        <ExamHeader config={headerConfig}
          onChange={setHeaderConfig} />

        {/* Student Input Field - Added under header separator line */}
        <div className=" border-gray-300 pt-1">
          <div className="flex flex-col items-center justify-center">
            {/* Screen/Editable Version */}
            <div className="no-print w-full max-w-3xl mx-auto">
              <textarea
                value={studentInput}
                onChange={(e) => setStudentInput(e.target.value)}
                placeholder="اكتب هنا..."
                className="w-full h-16 p-3 border border-gray-300 rounded-lg resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                dir="rtl"
              />
              <p className="text-sm text-gray-500 text-center mt-2">
              </p>
            </div>

            {/* Print Version */}
            <div className="print-only student-input-print ">
              {studentInput ? (
                <div className=" whitespace-pre-wrap text-right">
                  {studentInput}
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>

        {/* Instructions
          {examData?.instructions && (
            <div className="mb-4 border-l-4 border-gray-300 pl-4">
              <div className="flex items-center gap-2 text-gray-800 ">
                <ListChecks className="h-5 w-5 text-gray-500" />
                <h3 className="font-medium">التعليمات</h3>
              </div>
              <p className="text-gray-800 text-lg leading-relaxed">
                {examData?.instructions}
              </p>
            </div>
          )} */}

        {/* Render sections with global numbering */}
        {sections.map((section, sectionIndex) => (
          <div key={section.type} className="question-section"
            data-section-type={section.type}
          >
            {/* Section Header */}
            <div className="mb-1 p-1 print:mb-0.5 mt-2 print:p-0.5 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <Badge className="bg-white text-gray-800 border-gray-300 text-xs px-1 py-0">
                  {section.questions.length} سؤال
                </Badge>
                <h2 className="text-xl font-semibold text-gray-800">
                  {getSectionTitle(section.type, sectionIndex)}
                </h2>
              </div>
            </div>

            {section.type.includes('multiple') ? (
              // SIMPLE 2-COLUMN GRID FOR ALL MCQ QUESTIONS
              <div className="grid grid-cols-2">
                {section.questions.map((templateQuestion, questionIndex) => {
                  const globalQ = allQuestions.find(q => q.question.id === templateQuestion.id);
                  const globalNumber = globalQ?.globalIndex ?? 0;
                  const isRightColumn = questionIndex % 2 === 1;
                  const questionHasLongOption = templateQuestion.question.questionOptions?.some(
                    option => option.optionText.length > 40
                  ) || false;
                  return (
                    <div
                      key={templateQuestion.id}
                      className={`border-b p-2 ${questionIndex < section.questions.length - (section.questions.length % 2 === 0 ? 2 : 1) ? '' : ''} ${isRightColumn ? '' : 'border-l border-gray-300'}`}
                    >
                      {/* Question number and text */}
                      <div className="flex items-start ">
                        <div className="shrink-0 font-semibold text-gray-800 w-6">
                          {globalNumber}.
                        </div>
                        <h3 className="text-gray-800 flex-1">
                          {templateQuestion.question.questionText}
                        </h3>
                      </div>
                      {templateQuestion.question.questionType?.hasOptions && templateQuestion.question.questionOptions && templateQuestion.question.questionOptions.length > 0 && (
                        <div className={`grid ${questionHasLongOption ? 'grid-cols-1' : 'grid-cols-2'} p-1 gap-1`}>
                          {[...templateQuestion.question.questionOptions]
                            .sort((a, b) => a.optionOrder - b.optionOrder)
                            .map((option, idx) => {
                              const refKey = `${templateQuestion.id}-${option.id}`;
                              return (
                                <div
                                  key={option.id}
                                  className={`rounded ${option.isCorrect ? 'correct-answer-option' : ''}`}
                                >
                                  <div className="flex gap-1 min-w-0">
                                    <span className="font-medium shrink-0">{String.fromCharCode(97 + idx)})</span>
                                    <span
                                      ref={el => {
                                        if (el) optionTextRefs.current.set(refKey, el);
                                        else optionTextRefs.current.delete(refKey);
                                      }}
                                      className="flex-1 min-w-0 wrap-break-word"
                                    >
                                      {option.optionText}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            ) : (
              // SINGLE COLUMN FOR NON-MULTIPLE CHOICE
              <div className="print:outline-0">
                {section.questions.map((templateQuestion) => {
                  const globalQ = allQuestions.find(q => q.question.id === templateQuestion.id);
                  const globalNumber = globalQ?.globalIndex ?? 0;

                  return (
                    <div
                      key={templateQuestion.id}
                      className="question-container border-gray-300 p-1 bg-white"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-1">
                        <div className="flex items-start gap-1">
                          <div className="shrink-0 font-semibold text-gray-800 w-6">
                            {globalNumber}.
                          </div>
                          <div className="flex-1">
                            <h3 className="text-gray-800">
                              {templateQuestion.question.questionText}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Options */}
                      {templateQuestion.question.questionType?.hasOptions &&
                        templateQuestion.question.questionOptions &&
                        templateQuestion.question.questionOptions.length > 0 && (
                          <div className={`${templateQuestion.question.questionOptions.length > 2 ? 'grid grid-cols-2' : ''}`}>
                            {[...templateQuestion.question.questionOptions]
                              .sort((a, b) => a.optionOrder - b.optionOrder)
                              .map((option, idx) => (
                                <div
                                  key={option.id}
                                  className={`flex items-start rounded-lg ${option.isCorrect ? 'correct-answer-option' : ''}`}
                                >
                                  <div className="grow">
                                    <div className={`flex items-start ${section.type === 'multiple_choice' ? 'p-1.5' : ''} gap-1`}>
                                      <span className="font-medium">{String.fromCharCode(97 + idx)})</span>
                                      <span>{option.optionText}</span>
                                    </div>
                                    {option.isCorrect && (
                                      <span className="correct-indicator">(الإجابة الصحيحة)</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}

                      {/* Essay */}
                      {templateQuestion.question.questionType?.code === 'essay' && (
                        <div className="mt-6 border-2 border-dashed border-gray-400 rounded-lg p-4">
                          <div className="text-center text-gray-600 mb-2">مساحة الإجابة</div>
                          <div className="h-32"></div>
                          <div className="text-xs text-gray-500 text-center mt-2">
                            حد الكلمات: {templateQuestion.question.wordsLimit} كلمة
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Footer */}
        <div className="mt-12 pt-8  text-center space-y-4">

          {/* SCREEN */}
          <div className="no-print space-y-2">
            <textarea
              className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              value={footerConfig.supervisor}
              onChange={e =>
                setFooterConfig({ ...footerConfig, supervisor: e.target.value })
              }
              placeholder="اسم المشرف"
            />

            <Input
              value={footerConfig.wish}
              onChange={e =>
                setFooterConfig({ ...footerConfig, wish: e.target.value })
              }
              placeholder="جملة التمنيات"
            />
          </div>

          <div className="print-only space-y-2">
            {/* حل 1: استخدام CSS white-space */}
            <div className="whitespace-pre-line text-center">
              {footerConfig.supervisor}
            </div>
            <p>{footerConfig.wish}</p>
          </div>
        </div>

      </div>
    </div >
  );
}