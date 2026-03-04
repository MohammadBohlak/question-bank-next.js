// 'use client';

// import React, { useRef, useEffect, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import ExamHeader from '@/components/Examheader';
// import {
//   Printer, FileText
// } from 'lucide-react';
// import { useParams } from 'next/navigation';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState } from '@/store/store';
// import { getTemplateById } from '@/store/question';
// import { AppDispatch } from '@/store/store';
// import { Input } from '@/components/ui/input';
// import htmlDocx from 'html-docx-js/dist/html-docx';
// import { saveAs } from 'file-saver'
// export type HeaderField = {
//   id: string
//   value: string
//   visible: boolean
// }

// export interface ExamHeaderConfig {
//   logo?: string
//   headerNote?: string

//   right: HeaderField[]
//   left: HeaderField[]
// }

// export interface FooterConfig {
//   supervisor: string
//   wish: string
// }

// interface TemplateQuestion {
//   id: number;
//   questionOrder: number;
//   assignedPoints: number;
//   question: {
//     id: number;
//     questionText: string | null;
//     questionType: {
//       code: string;
//       hasOptions: boolean;
//     };
//     questionOptions: Array<{
//       id: number;
//       optionText: string;
//       optionOrder: number;
//       isCorrect: boolean;
//     }>;
//     notes: string | null;
//     wordsLimit: number | null;
//   };
// }

// const FONT_FAMILIES = [
//   { value: 'Arial, sans-serif', label: 'Arial ( sans-serif )' },
//   { value: '"Times New Roman", serif', label: 'Times New Roman ( serif )' },
//   { value: '"Courier New", monospace', label: 'Courier New ( monospace )' },
//   { value: 'Tahoma, sans-serif', label: 'Tahoma' },
//   { value: 'Verdana, sans-serif', label: 'Verdana' },
//   { value: 'Georgia, serif', label: 'Georgia' },
//   { value: '"Segoe UI", sans-serif', label: 'Segoe UI' },
// ];

// const FONT_SIZES = [
//   { value: '12px', label: 'صغير (12px)' },
//   { value: '14px', label: 'عادي (14px)' },
//   { value: '18px', label: 'كبير (18px)' },
// ];

// const LINE_HEIGHTS = [
//   { value: '1.3', label: 'مضغوط (1.3)' },
//   { value: '1.6', label: 'عادي (1.6)' },
//   { value: '1.8', label: 'مريح (1.8)' },
// ];

// const initialHeaderConfig: ExamHeaderConfig = {
//   logo: "/logo2.png",
//   headerNote: "",

//   right: [
//     { id: "university", value: "جامعة دمشق", visible: true },
//     { id: "faculty", value: "كلية الهندسة المعلوماتية", visible: true },
//     { id: "department", value: "قسم البرمجيات", visible: true },
//   ],

//   left: [
//     { id: "studentName", value: "اسم الطالب:", visible: true },
//     { id: "studentId", value: "الرقم الجامعي:", visible: true },
//     { id: "duration", value: "المدة: ساعتان", visible: true },
//   ],
// }

// const initialFooterConfig: FooterConfig = {
//   supervisor: "",
//   wish: "مع تمنياتي بالتوفيق",
// }


// export default function ExamPaperDisplay() {
//   const examPaperRef = useRef<HTMLDivElement>(null);
//   const { templateId } = useParams<{ templateId: string }>();
//   const dispatch = useDispatch<AppDispatch>();
//   const [headerConfig, setHeaderConfig] = useState(initialHeaderConfig)
//   const [footerConfig, setFooterConfig] = useState(initialFooterConfig)
//   const [selectedFontFamily, setSelectedFontFamily] = useState('Arial, sans-serif');
//   const [selectedFontSize, setSelectedFontSize] = useState('12px');
//   const [selectedLineHeight, setSelectedLineHeight] = useState('1.6');
//   const [isPrintingWithAnswers, setIsPrintingWithAnswers] = useState(false);
//   // State for the text input field
//   const [studentInput, setStudentInput] = useState('');


//   // Fetch exam data
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token && templateId) {
//       dispatch(getTemplateById(Number(templateId)));
//     }
//   }, [dispatch, templateId]);

//   const examData = useSelector((state: RootState) => state.questions.templateDetails);

//   // Inside your component, replace the groupedQuestions useMemo with this:
//   const { sections, allQuestions } = React.useMemo(() => {
//     if (!examData?.templateQuestions) {
//       return { sections: [], allQuestions: [] };
//     }

//     // Group by type, preserving original order within type
//     const groups: Record<string, TemplateQuestion[]> = {};
//     examData.templateQuestions.forEach(q => {
//       const type = q.question.questionType.code;
//       if (!groups[type]) groups[type] = [];
//       groups[type].push(q);
//     });

//     // Define desired type order
//     const typeOrder = ['multiple_choice', 'multiple_response', 'true_false', 'essay'];

//     // Filter and sort sections by typeOrder, but only include types that exist
//     const orderedTypes = typeOrder.filter(type => groups[type]?.length > 0);

//     // Build sections with global question list
//     let globalIndex = 0;
//     const sections: Array<{
//       type: string;
//       title: string;
//       questions: TemplateQuestion[];
//     }> = [];
//     // Helper: get base title without "القسم X"
//     const getSectionTitleBase = (type: string): string => {
//       const titles: Record<string, string> = {
//         'multiple_choice': 'اختر الإجابة الصحيحة من بين الخيارات التالية',
//         'multiple_response': 'اختر الإجابات الصحيحة من بين الخيارات التالية (قد يكون هناك أكثر من إجابة صحيحة)',
//         'true_false': 'ضع علامة (✓) أمام العبارة الصحيحة وعلامة (✗) أمام العبارة الخاطئة',
//         'essay': 'أجب عن الأسئلة التالية',
//       };
//       return titles[type] || type;
//     };
//     const allQuestions: Array<{
//       question: TemplateQuestion;
//       globalIndex: number;
//       sectionIndex: number
//     }> = [];

//     orderedTypes.forEach((type, sectionIdx) => {
//       const questions = [...groups[type]].sort((a, b) => a.questionOrder - b.questionOrder);
//       const sectionTitle = `القسم ${sectionIdx + 1}: ${getSectionTitleBase(type)}`;

//       const sectionQuestions = questions.map(q => {
//         const qWithIndex = {
//           question: q,
//           globalIndex: ++globalIndex, // starts at 1
//           sectionIndex: sectionIdx,
//         };
//         allQuestions.push(qWithIndex);
//         return q;
//       });

//       sections.push({
//         type,
//         title: sectionTitle,
//         questions: sectionQuestions,
//       });
//     });

//     return { sections, allQuestions };
//   }, [examData]);

//   const handlePrintWithAnswers = () => {
//     setIsPrintingWithAnswers(true);
//     // Allow DOM to update before printing
//     setTimeout(() => {
//       window.print();
//       // Reset after print dialog closes (prevents screen flash)
//       setTimeout(() => setIsPrintingWithAnswers(false), 1000);
//     }, 100);
//   };

//   const handlePrint = () => {
//     setIsPrintingWithAnswers(false);
//     window.print();
//   };

//   const cleanupForWordExport = (element: HTMLElement) => {
//     // 1. Remove screen-only UI
//     element.querySelectorAll('.no-print, button, .control-panel, details, .print-only').forEach(el => {
//       el.remove();
//     });

//     // 2. Fix Textareas
//     element.querySelectorAll('textarea').forEach(textarea => {
//       const div = document.createElement('div');
//       div.style.borderBottom = '1px solid #000';
//       div.style.height = '20px';
//       div.style.width = '80%';
//       div.style.margin = '0 auto';
//       div.style.textAlign = 'center';
//       div.innerHTML = (textarea as HTMLTextAreaElement).value || '&nbsp;';
//       textarea.parentNode?.replaceChild(div, textarea);
//     });

//     // 3. Fix Inputs
//     element.querySelectorAll('input[type="text"]').forEach(input => {
//       const div = document.createElement('div');
//       div.innerHTML = (input as HTMLInputElement).value || '';
//       input.parentNode?.replaceChild(div, input);
//     });

//     // 4. CRITICAL FIX: Add borders to Single Column Questions (True/False, Essay)
//     // These are not in a table, so we add the border directly to the container div
//     element.querySelectorAll('.question-section > div:not(.multi-mcq-page) > .question-container').forEach(q => {
//       const el = q as HTMLElement;
//       el.style.border = '1px solid #000'; // Solid black border for Word
//       el.style.padding = '5px';
//       el.style.marginBottom = '10px';
//     });

//     // 5. CRITICAL FIX: Convert Grid to Table AND add borders to cells
//     element.querySelectorAll('.multi-mcq-page .grid').forEach(gridContainer => {
//       const table = document.createElement('table');
//       table.style.width = '100%';
//       table.style.borderCollapse = 'collapse';
//       table.setAttribute('dir', 'rtl');

//       const tbody = document.createElement('tbody');
//       table.appendChild(tbody);

//       const children = Array.from(gridContainer.children);

//       for (let i = 0; i < children.length; i += 2) {
//         const row = document.createElement('tr');

//         // Helper to create a styled cell
//         const createCell = (child: Element) => {
//           const cell = document.createElement('td');
//           cell.style.width = '50%';
//           cell.style.verticalAlign = 'top';
//           cell.style.padding = '5px';

//           // --- THE FIX: Apply the border directly to the cell ---
//           // This mimics the .question-container outline in print
//           cell.style.border = '1px solid #000';
//           cell.style.backgroundColor = '#ffffff'; // Ensure white background

//           cell.appendChild(child);
//           return cell;
//         };

//         const cell1 = createCell(children[i]);
//         const cell2 = children[i + 1] ? createCell(children[i + 1]) : document.createElement('td');

//         row.appendChild(cell1);
//         row.appendChild(cell2);
//         tbody.appendChild(row);
//       }

//       gridContainer.parentNode?.replaceChild(table, gridContainer);
//     });

//     // 6. Clean up images
//     element.querySelectorAll('img').forEach(img => {
//       img.setAttribute('style', 'max-width: 100%; height: auto;');
//     });
//   };

//   const getWordExportStyles = () => {
//     return `
//       /* GENERAL SETTINGS */
//       body {
//         margin: 0;
//         padding: 20px;
//         direction: rtl;
//         font-family: ${selectedFontFamily}, Arial, sans-serif;
//         background: white;
//       }

//       .exam-paper-container {
//         width: 100%;
//         max-width: 100%;
//         margin: 0;
//         padding: 0;
//         box-shadow: none;
//         border: none;
//       }

//       /* PAGE BREAKS */
//       .multi-mcq-page {
//         page-break-after: always;
//         break-after: page;
//         margin-bottom: 30px;
//       }
//       .multi-mcq-page:last-child {
//         page-break-after: auto;
//         break-after: auto;
//       }

//       /* QUESTION STYLING */
//       .question-container {
//         margin-bottom: 15px;
//         padding: 5px;
//         /* Keep a light fallback border, though JS adds a stronger one */
//         border: 1px solid #ccc; 
//       }

//       /* SECTIONS */
//       .question-section {
//         margin-bottom: 30px;
//       }
      
//       /* TYPOGRAPHY */
//       h2 { font-size: 1.2em; border-bottom: 1px solid #eee; padding-bottom: 5px; }
//       h3 { font-size: 1em; margin: 5px 0; font-weight: bold; }
      
//       /* OPTIONS */
//       .question-container div { margin-bottom: 2px; }
//       .correct-answer-option {
//         background-color: #e8f5e9 !important; /* Light Green */
//         border: 1px solid #4caf50;
//         padding: 2px;
//       }

//       /* Hide "Continuation" text */
//       .text-center.text-gray-500 { display: none; }
//     `;
//   };
//   const exportToWord = () => {
//     if (!examPaperRef.current) return;

//     // Clone content
//     const contentClone = examPaperRef.current.cloneNode(true) as HTMLElement;

//     // Apply Cleanup (Includes the Grid -> Table conversion)
//     cleanupForWordExport(contentClone);

//     // Generate HTML string
//     const htmlString = `
//       <!DOCTYPE html>
//       <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
//         <head>
//           <meta charset="UTF-8">
//           <title>Exam Paper</title>
//           <style>
//             /* Apply Font and Direction globally */
//             body { direction: rtl; }
//             * { font-family: ${selectedFontFamily}, Arial, sans-serif; }
            
//             /* Inject Custom Print Styles */
//             ${getWordExportStyles()}
//           </style>
//         </head>
//         <body>
//           ${contentClone.outerHTML}
//         </body>
//       </html>
//     `;

//     // Convert
//     const converted = htmlDocx.asBlob(htmlString, {
//       orientation: 'portrait',
//       margins: { top: 720, right: 720, bottom: 720, left: 720 }
//     });

//     // Save
//     const fileName = examData?.code
//       ? `${examData.code.replace(/\s+/g, '_')}_exam.docx`
//       : 'exam_paper.docx';

//     saveAs(converted, fileName);
//   };
//   const printStyles = `
//   @media print {
//     html, body {
//       height: auto !important;
//       overflow: visible !important;
//     }
//     .grid {
//       break-inside: auto !important;
//     }

//     .grid > div {
//       break-inside: avoid;
//     }
    
//     /* 
//       CRITICAL: Ensure questions are never split across pages.
//       This forces the whole question block to the next page if it doesn't fit.
//     */
//     .question-container {
//         break-inside: avoid !important;
//         page-break-inside: avoid !important;
//     }

//     /* 
//       LOCK PAGES: 
//       Force a physical page break after every 20-question block.
//       This ensures the numbering (Page X/Y) aligns with these blocks.
//     */
//     .multi-mcq-page {
//       break-inside: auto;
//       page-break-inside: auto;
      
//       /* Force a new page after this specific div (the 20-question chunk) */
//       break-after: page;
//       page-break-after: always;
//     }

//     /* Don't force break on the very last element to avoid blank page */
//     .multi-mcq-page:last-child {
//       break-after: auto;
//       page-break-after: auto;
//     }

//     .multi-select-grid-print {
//       display: grid !important;
//       grid-template-columns: 1fr 1fr !important;
//       grid-template-rows: repeat(10, auto) !important;
//       grid-auto-flow: column !important;
//       gap: 6px !important;
//     }
    
//     .question-container,
//     .multi-mcq-page > .grid > div {

//     }

//     @page {
//       margin: 0.2cm 0.2cm 2cm; /* bottom margin = 2cm */
//           size: auto;
          
//       @bottom-center {
//         content: "الصفحة " counter(page) "/" counter(pages);
//         font-family: Arial, sans-serif;
//         font-size: 12pt;
//         color: #000;
//         border-top: 1px solid #000;
//         padding-top: 5px;
//       }
//       /* CRITICAL: Blank all other margin boxes */
//       @top-left, @top-center, @top-right,
//       @bottom-left, @bottom-right {
//         content: "";
//       }
//     }

//     /* Ensure all text elements inherit the font settings */
//     .exam-paper-container *,
//     .exam-paper-container *::before,
//     .exam-paper-container *::after {
//       font-family: inherit !important;
//       font-size: inherit !important;
//       line-height: inherit !important;
//     }

//     /* Special handling for code/monospace elements */
//     .exam-paper-container code,
//     .exam-paper-container pre,
//     .exam-paper-container kbd,
//     .exam-paper-container samp {
//       font-family: inherit !important;
//     }

//     * {
//       overflow: visible !important;
//       max-height: none !important;
//     }

//     .no-print {
//       display: none !important;
//     }

//     .print-only {
//       display: block !important;
//     }

//     .no-screen {
//       display: none !important;
//     }

//     .exam-paper-container {
//       box-shadow: none !important;
//       border: none !important;
//       margin: 0 !important;
//       padding: 0 !important;
//     }
//     .exam-paper-container {
//       font-size: 13px !important;   
//       line-height: 1.25 !important; 
//     }

//     img {
//       max-width: 100% !important;
//       page-break-inside: avoid;
//     }

//     body {
//       background: white !important;
//     }

//     /* PAGE BREAK CONTROL - PREVENT SECTION SPLITTING IF DESIRED, 
//        though questions take priority */
//     .question-section {
//       page-break-inside: auto !important;
//       break-inside: auto !important;
//     }
    
//     /* Force page break before very large questions (fallback) */
//     .question-container.very-large {
//       page-break-inside: auto !important;
//       break-inside: auto !important;
//       page-break-before: always !important;
//     }
    
//     .exam-paper-container {
//       min-height: 95vh !important;
//     }
    
//     /* SIMPLE GREEN BACKGROUND FOR CORRECT ANSWERS */
//     .print-with-answers .correct-answer-option {
//       background-color: rgba(220, 252, 231, 0.5) !important; /* Light green */
//       border: 1px solid rgba(34, 197, 94, 0.3) !important; /* Green border */
//     }
    
//     /* Remove all extra icons and text */
//     .print-with-answers .correct-answer-option::after,
//     .print-with-answers .correct-answer-option::before {
//       display: none !important;
//     }
    
//     .print-with-answers .correct-indicator {
//       display: none !important;
//     }
//   }

//     /* Screen-only styles */
//     .print-only {
//       display: none;
//     }
    
//     /* Simple green background for screen preview */
//     .print-with-answers .correct-answer-option {
//       background-color: #dcfce7 !important;
//       border: 1px solid #22c55e !important;
//     }
    
//     .correct-indicator {
//       display: none;
//     }
    
//     .correct-answer-option::after {
//       display: none;
//     }
    
//     /* Student input field styles for print */
//     .student-input-print {
//       border-bottom: 0.2px solid gray  !important;
//       background: white !important;
//       min-height: 10px !important;
//       margin:  auto !important;
//       margin-bottom:2px
//       width: 80% !important;
//       display: block !important;
//     }
//   `;
//   <style jsx global>{`
//       .exam-paper-container {
//         transition: font-family 0.3s ease, font-size 0.3s ease, line-height 0.3s ease;
//       }
      
//       @media (prefers-reduced-motion) {
//         .exam-paper-container {
//           transition: none !important;
//         }
//       }
//     `}</style>
//   return (
//     <div className="p-4 print:p-0 print:bg-white" dir="rtl">
//       {/* Print styles */}
//       <style jsx global>{printStyles}</style>

//       {/* Control Panel */}
//       <div className="no-print mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//         <div className="flex flex-wrap items-center gap-4">
//           {/* Print Buttons */}
//           <div className="flex flex-wrap gap-3">
//             <Button
//               onClick={exportToWord}
//               className="gap-2 border border-green-300 bg-white hover:bg-green-50 text-green-700"
//               variant="outline"
//             >
//               <FileText className="h-4 w-4" />
//               تصدير إلى Word
//             </Button>
//             <Button
//               onClick={handlePrint}
//               className="gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-800"
//               variant="outline"
//             >
//               <Printer className="h-4 w-4" />
//               طباعة
//             </Button>
//             <Button
//               onClick={handlePrintWithAnswers}
//               className="gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-800"
//               variant="outline"
//             >
//               طباعة مع الإجابات
//             </Button>
//           </div>

//           {/* Font Controls - Hidden on mobile to save space */}
//           <div className="flex flex-wrap items-center gap-4 ms-auto border-l border-gray-200 pl-4 max-md:hidden">
//             <div className="flex items-center gap-2">
//               <label className="text-sm text-gray-700 whitespace-nowrap">الخط:</label>
//               <select
//                 value={selectedFontFamily}
//                 onChange={(e) => setSelectedFontFamily(e.target.value)}
//                 className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 dir="ltr"
//               >
//                 {FONT_FAMILIES.map(font => (
//                   <option key={font.value} value={font.value}>
//                     {font.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="flex items-center gap-2">
//               <label className="text-sm text-gray-700 whitespace-nowrap">الحجم:</label>
//               <select
//                 value={selectedFontSize}
//                 onChange={(e) => setSelectedFontSize(e.target.value)}
//                 className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 {FONT_SIZES.map(size => (
//                   <option key={size.value} value={size.value}>
//                     {size.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="flex items-center gap-2">
//               <label className="text-sm text-gray-700 whitespace-nowrap">التباعد:</label>
//               <select
//                 value={selectedLineHeight}
//                 onChange={(e) => setSelectedLineHeight(e.target.value)}
//                 className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 {LINE_HEIGHTS.map(lh => (
//                   <option key={lh.value} value={lh.value}>
//                     {lh.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Mobile-friendly font controls (collapsible) */}
//         <div className="mt-3 md:hidden">
//           <details className="border border-gray-200 rounded-lg">
//             <summary className="list-none p-3 bg-gray-50 hover:bg-gray-100 rounded-t-lg cursor-pointer font-medium text-gray-700">
//               ⚙️ إعدادات الخط (اضغط للتوسيع)
//             </summary>
//             <div className="p-3 space-y-3 border-t border-gray-200">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">نوع الخط</label>
//                 <select
//                   value={selectedFontFamily}
//                   onChange={(e) => setSelectedFontFamily(e.target.value)}
//                   className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   dir="ltr"
//                 >
//                   {FONT_FAMILIES.map(font => (
//                     <option key={font.value} value={font.value}>
//                       {font.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">حجم الخط</label>
//                 <select
//                   value={selectedFontSize}
//                   onChange={(e) => setSelectedFontSize(e.target.value)}
//                   className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   {FONT_SIZES.map(size => (
//                     <option key={size.value} value={size.value}>
//                       {size.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">تباعد الأسطر</label>
//                 <select
//                   value={selectedLineHeight}
//                   onChange={(e) => setSelectedLineHeight(e.target.value)}
//                   className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   {LINE_HEIGHTS.map(lh => (
//                     <option key={lh.value} value={lh.value}>
//                       {lh.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </details>
//         </div>
//       </div>

//       {/* Exam Paper Content */}
//       <div
//         ref={examPaperRef}
//         className={`exam-paper-container mx-auto max-w-5xl bg-white shadow-lg rounded-lg border border-gray-300 px-4  ${isPrintingWithAnswers ? 'print-with-answers' : ''
//           }`}
//         style={{
//           fontFamily: selectedFontFamily,
//           fontSize: selectedFontSize,
//           lineHeight: selectedLineHeight,
//           // Ensure these styles apply to print too
//           '--exam-font-family': selectedFontFamily,
//           '--exam-font-size': selectedFontSize,
//           '--exam-line-height': selectedLineHeight,
//         } as React.CSSProperties}
//       >
//         {/* Exam Header */}
//         <ExamHeader config={headerConfig}
//           onChange={setHeaderConfig} />

//         {/* Student Input Field - Added under header separator line */}
//         <div className=" border-gray-300 pt-1">
//           <div className="flex flex-col items-center justify-center">
//             {/* Screen/Editable Version */}
//             <div className="no-print w-full max-w-3xl mx-auto">
//               <textarea
//                 value={studentInput}
//                 onChange={(e) => setStudentInput(e.target.value)}
//                 placeholder="اكتب هنا..."
//                 className="w-full h-16 p-3 border border-gray-300 rounded-lg resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
//                 dir="rtl"
//               />
//               <p className="text-sm text-gray-500 text-center mt-2">
//               </p>
//             </div>

//             {/* Print Version */}
//             <div className="print-only student-input-print ">
//               {studentInput ? (
//                 <div className=" whitespace-pre-wrap text-right">
//                   {studentInput}
//                 </div>
//               ) : (
//                 <></>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Instructions
//           {examData?.instructions && (
//             <div className="mb-4 border-l-4 border-gray-300 pl-4">
//               <div className="flex items-center gap-2 text-gray-800 ">
//                 <ListChecks className="h-5 w-5 text-gray-500" />
//                 <h3 className="font-medium">التعليمات</h3>
//               </div>
//               <p className="text-gray-800 text-lg leading-relaxed">
//                 {examData?.instructions}
//               </p>
//             </div>
//           )} */}

//         {/* Render sections with global numbering */}
//         {sections.map((section) => (
//           <div key={section.type} className="question-section">
//             {/* Section Header */}
//             <div className="mb-1 p-1 print:mb-0.5 mt-2 print:p-0.5 bg-gray-50 rounded">
//               <div className="flex items-center gap-3">
//                 <Badge className="bg-white text-gray-800 border-gray-300 text-xs px-1 py-0">
//                   {section.questions.length} سؤال
//                 </Badge>
//                 <h2 className="text-xl font-semibold text-gray-800">
//                   {section.title}
//                 </h2>
//               </div>
//             </div>

//             {/* Questions in this section */}
//             {section.type.includes('multiple') ? (
//               // MULTIPLE CHOICE WITH PAGINATION
//               (() => {
//                 // Split questions into pages of 20 questions each
//                 const questionsPerPage = 20; // 10 left + 10 right
//                 const totalQuestions = section.questions.length;
//                 const totalPages = Math.ceil(totalQuestions / questionsPerPage);

//                 return (
//                   <>
//                     {Array.from({ length: totalPages }).map((_, pageIndex) => {
//                       const startIndex = pageIndex * questionsPerPage;
//                       const endIndex = Math.min(startIndex + questionsPerPage, totalQuestions);
//                       const pageQuestions = section.questions.slice(startIndex, endIndex);

//                       // Split page questions into two columns
//                       const half = Math.ceil(pageQuestions.length / 2);
//                       const leftColumn = pageQuestions.slice(0, half);
//                       const rightColumn = pageQuestions.slice(half);
//                       return (
//                         <div
//                           key={`page-${pageIndex}`}
//                           className={`multi-mcq-page ${pageIndex > 0 ? 'mt-8 print:mt-0' : ''}`}
//                         >
//                           {/* Page indicator (optional) */}
//                           {pageIndex > 0 && (
//                             <div className="text-center text-gray-500 text-sm mb-4 print:hidden">
//                               --- استمرار القسم ---
//                             </div>
//                           )}

//                           {/* Questions grid for this page */}
//                           {/* Questions grid for this page */}
//                           <div className="grid grid-cols-2 ">
//                             {(() => {
//                               const questionPairs = [];
//                               for (let i = 0; i < half; i++) {
//                                 questionPairs.push({
//                                   left: leftColumn[i],
//                                   right: rightColumn[i],
//                                 });
//                               }

//                               return questionPairs.map((pair, rowIndex) => (
//                                 <React.Fragment key={`row-${rowIndex}`}>
//                                   {/* LEFT QUESTION */}
//                                   {pair.left && (
//                                     <QuestionCard
//                                       question={pair.left}
//                                       globalIndex={allQuestions.find(q => q.question.id === pair.left.id)?.globalIndex ?? 0}
//                                     />
//                                   )}

//                                   {/* RIGHT QUESTION */}
//                                   {pair.right && (
//                                     <QuestionCard
//                                       question={pair.right}
//                                       globalIndex={allQuestions.find(q => q.question.id === pair.right.id)?.globalIndex ?? 0}
//                                     />
//                                   )}
//                                 </React.Fragment>
//                               ));
//                             })()}
//                           </div>

//                         </div>
//                       );
//                     })}
//                   </>
//                 );
//               })()
//             ) : (
//               // SINGLE COLUMN FOR NON-MULTIPLE CHOICE
//               <div className=" print:outline-0">
//                 {section.questions.map((templateQuestion) => {
//                   const globalQ = allQuestions.find(q => q.question.id === templateQuestion.id);
//                   const globalNumber = globalQ?.globalIndex ?? 0;

//                   return (
//                     <div
//                       key={templateQuestion.id}
//                       className="question-container border-gray-300 p-1 bg-white"
//                     >
//                       <div className="flex flex-wrap items-start justify-between gap-1">
//                         <div className="flex items-start gap-1">
//                           <div className="shrink-0 font-semibold text-gray-800 w-6">
//                             {globalNumber}.
//                           </div>
//                           <div className="flex-1">
//                             <h3 className="text-gray-800">
//                               {templateQuestion.question.questionText}
//                             </h3>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Options */}
//                       {templateQuestion.question.questionType?.hasOptions &&
//                         templateQuestion.question.questionOptions &&
//                         templateQuestion.question.questionOptions.length > 0 && (
//                           <div className={`${templateQuestion.question.questionOptions.length > 2 ? 'grid grid-cols-2' : ''}`}>
//                             {[...templateQuestion.question.questionOptions]
//                               .sort((a, b) => a.optionOrder - b.optionOrder)
//                               .map((option, idx) => (
//                                 <div
//                                   key={option.id}
//                                   className={`flex items-start rounded-lg ${option.isCorrect ? 'correct-answer-option' : ''}`}
//                                 >
//                                   <div className="grow">
//                                     <div className={`flex items-start ${section.type === 'multiple_choice' ? 'p-1.5' : ''} gap-1`}>
//                                       <span className="font-medium">{String.fromCharCode(97 + idx)})</span>
//                                       <span>{option.optionText}</span>
//                                     </div>
//                                     {option.isCorrect && (
//                                       <span className="correct-indicator">(الإجابة الصحيحة)</span>
//                                     )}
//                                   </div>
//                                 </div>
//                               ))}
//                           </div>
//                         )}

//                       {/* Essay */}
//                       {templateQuestion.question.questionType?.code === 'essay' && (
//                         <div className="mt-6 border-2 border-dashed border-gray-400 rounded-lg p-4">
//                           <div className="text-center text-gray-600 mb-2">مساحة الإجابة</div>
//                           <div className="h-32"></div>
//                           <div className="text-xs text-gray-500 text-center mt-2">
//                             حد الكلمات: {templateQuestion.question.wordsLimit} كلمة
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         ))}

//         {/* Footer */}
//         <div className="mt-12 pt-8  text-center space-y-4">

//           {/* SCREEN */}
//           <div className="no-print space-y-2">
//             <textarea
//               className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               rows={2}
//               value={footerConfig.supervisor}
//               onChange={e =>
//                 setFooterConfig({ ...footerConfig, supervisor: e.target.value })
//               }
//               placeholder="اسم المشرف"
//             />

//             <Input
//               value={footerConfig.wish}
//               onChange={e =>
//                 setFooterConfig({ ...footerConfig, wish: e.target.value })
//               }
//               placeholder="جملة التمنيات"
//             />
//           </div>

//           <div className="print-only space-y-2">
//             {/* حل 1: استخدام CSS white-space */}
//             <div className="whitespace-pre-line text-center">
//               {footerConfig.supervisor}
//             </div>
//             <p>{footerConfig.wish}</p>
//           </div>
//         </div>

//       </div>
//     </div >
//   );
// }
// interface QuestionCardProps {
//   question: TemplateQuestion;
//   globalIndex: number;
// }

// const QuestionCard: React.FC<QuestionCardProps> = ({ question, globalIndex }) => {
//   const optionsRef = useRef<HTMLDivElement>(null);
//   const [singleCol, setSingleCol] = useState(false);

//   // Measure options after render
//   useEffect(() => {
//     if (!question.question.questionOptions || !optionsRef.current) return;

//     const parentWidth = optionsRef.current.offsetWidth;
//     const tooLong = question.question.questionOptions.some(opt => {
//       // create hidden span to measure
//       const span = document.createElement('span');
//       span.style.visibility = 'hidden';
//       span.style.position = 'absolute';
//       span.style.whiteSpace = 'nowrap';
//       span.style.fontSize = '12px'; // approximate, adjust to match your font
//       span.innerText = opt.optionText;
//       document.body.appendChild(span);
//       const isLong = span.offsetWidth > parentWidth / 2;
//       document.body.removeChild(span);
//       return isLong;
//     });

//     setSingleCol(tooLong);
//   }, [question.question.questionOptions]);

//   return (
//     <div className=" bg-white border-b border-l border-gray-400  ">
//       <div className="flex items-start gap-1 ">
//         <div className="shrink-0 font-semibold text-gray-800 w-6">{globalIndex}.</div>
//         <div className="flex-1">
//           <h3 className="text-gray-800">{question.question.questionText}</h3>
//         </div>
//       </div>

//       {/* Options */}
//       {question.question.questionType?.hasOptions &&
//         question.question.questionOptions &&
//         question.question.questionOptions.length > 0 && (
//           <div
//             ref={optionsRef}
//             className={`${singleCol
//                 ? 'grid grid-cols-1'
//                 : question.question.questionOptions.length > 2
//                   ? 'grid grid-cols-2'
//                   : 'grid grid-cols-1'
//               }`}
//           >
//             {[...question.question.questionOptions]
//               .sort((a, b) => a.optionOrder - b.optionOrder)
//               .map((option, idx) => (
//                 <div
//                   key={option.id}
//                   className={`p-1 flex items-start rounded-lg ${option.isCorrect ? 'correct-answer-option' : ''
//                     }`}
//                 >
//                   <span className="font-medium shrink-0 w-6">{String.fromCharCode(97 + idx)})</span>
//                   <span className="flex-1">{option.optionText}</span>
//                 </div>
//               ))}
//           </div>
//         )}

//       {/* Essay */}
//       {question.question.questionType?.code === 'essay' && (
//         <div className="mt-4 border-2 border-dashed border-gray-400 rounded-lg p-2">
//           <div className="text-center text-gray-600 mb-1">مساحة الإجابة</div>
//           <div className="h-28"></div>
//           <div className="text-xs text-gray-500 text-center mt-1">
//             حد الكلمات: {question.question.wordsLimit} كلمة
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
