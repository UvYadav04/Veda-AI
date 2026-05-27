import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { IPaper } from "../models/Assignment";
import { logger } from "../config/logger";

export class PDFService {
  public static async generateAssessmentPDF(
    paper: IPaper,
    assignmentId: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // =========================================================
        // SETUP
        // =========================================================

        const dirPath = path.join(__dirname, "../../public/pdfs");

        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }

        const fileName = `${assignmentId}_assessment.pdf`;
        const filePath = path.join(dirPath, fileName);

        const writeStream = fs.createWriteStream(filePath);

        const doc = new PDFDocument({
          size: "A4",
          margin: 50,
        });

        doc.pipe(writeStream);

        // =========================================================
        // COLORS
        // =========================================================

        const colors = {
          primary: "#111827",
          secondary: "#6b7280",
          border: "#e5e7eb",
          soft: "#f3f4f6",
          dark: "#2b2b2b",
          white: "#ffffff",
        };

        const PAGE_WIDTH = doc.page.width;
        const PAGE_HEIGHT = doc.page.height;

        // =========================================================
        // HELPERS
        // =========================================================

        const addNewPage = () => {
          doc.addPage();

          doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill("#f5f5f5");

          doc
            .roundedRect(20, 20, PAGE_WIDTH - 40, PAGE_HEIGHT - 40, 20)
            .fill(colors.white);

          doc.x = 50;
          doc.y = 50;
        };

        const ensureSpace = (neededHeight: number) => {
          if (doc.y + neededHeight > PAGE_HEIGHT - 70) {
            addNewPage();
          }
        };

        // =========================================================
        // PAGE BACKGROUND
        // =========================================================

        doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill("#f5f5f5");

        doc
          .roundedRect(20, 20, PAGE_WIDTH - 40, PAGE_HEIGHT - 40, 20)
          .fill(colors.white);

        // =========================================================
        // HERO HEADER
        // =========================================================

        doc.roundedRect(40, 40, PAGE_WIDTH - 80, 170, 24).fill(colors.dark);

        doc
          .fillColor(colors.white)
          .font("Helvetica-Bold")
          .fontSize(26)
          .text(paper.schoolName, 70, 70, {
            align: "center",
            width: PAGE_WIDTH - 140,
          });

        doc.moveDown(0.6);

        doc.font("Helvetica").fontSize(18).text(`Subject: ${paper.subject}`, {
          align: "center",
        });

        doc.moveDown(0.3);

        doc.fontSize(15).text(`Class: ${paper.classLevel}`, {
          align: "center",
        });

        doc.moveDown(1);

        doc
          .font("Helvetica-Bold")
          .fontSize(12)
          .fillColor("#d1d5db")
          .text(`Customized Question Paper`, {
            align: "center",
          });

        // =========================================================
        // META BOX
        // =========================================================

        const metaY = 240;

        doc
          .roundedRect(40, metaY, PAGE_WIDTH - 80, 55, 14)
          .fillAndStroke(colors.white, colors.border);

        doc
          .fillColor(colors.primary)
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(
            `Time Allowed: ${paper.timeAllowedMinutes} minutes`,
            65,
            metaY + 20,
          );

        doc.text(
          `Maximum Marks: ${paper.maxMarks}`,
          PAGE_WIDTH - 230,
          metaY + 20,
        );

        // =========================================================
        // INSTRUCTIONS
        // =========================================================

        doc
          .fillColor(colors.secondary)
          .font("Helvetica")
          .fontSize(10)
          .text(
            "All questions are compulsory unless stated otherwise.",
            45,
            320,
          );

        // =========================================================
        // STUDENT DETAILS
        // =========================================================

        const studentY = 350;

        doc
          .roundedRect(40, studentY, PAGE_WIDTH - 80, 120, 16)
          .fillAndStroke("#fafafa", colors.border);

        const drawField = (label: string, y: number) => {
          doc
            .fillColor(colors.primary)
            .font("Helvetica-Bold")
            .fontSize(11)
            .text(label, 60, y);

          doc
            .moveTo(170, y + 13)
            .lineTo(PAGE_WIDTH - 80, y + 13)
            .lineWidth(1)
            .strokeColor("#9ca3af")
            .stroke();
        };

        drawField("Student Name:", studentY + 25);

        drawField("Roll Number:", studentY + 55);

        drawField(`Class & Section:`, studentY + 85);

        doc.y = 520;

        // =========================================================
        // QUESTION SECTIONS
        // =========================================================

        paper.sections.forEach((section) => {
          ensureSpace(180);

          // =====================================================
          // SECTION HEADER
          // =====================================================

          doc.moveDown(1);

          doc
            .fillColor(colors.primary)
            .font("Helvetica-Bold")
            .fontSize(18)
            .text(section.sectionName, {
              align: "center",
            });

          doc.moveDown(0.5);

          doc.fontSize(12).text(section.questionType);

          doc
            .fillColor(colors.secondary)
            .font("Helvetica-Oblique")
            .fontSize(10)
            .text(section.instructions);

          doc.moveDown(1);

          // =====================================================
          // QUESTIONS
          // =====================================================

          section.questions.forEach((q, qIndex) => {
            ensureSpace(100);

            const startY = doc.y;

            // Divider

            if (qIndex !== 0) {
              doc
                .moveTo(50, doc.y - 10)
                .lineTo(PAGE_WIDTH - 50, doc.y - 10)
                .strokeColor(colors.border)
                .lineWidth(1)
                .stroke();
            }

            // Question Number

            doc
              .fillColor(colors.primary)
              .font("Helvetica-Bold")
              .fontSize(11)
              .text(`${qIndex + 1}.`, 50, startY);

            // Difficulty Badge

            const badgeX = 78;
            const badgeWidth = 58;

            doc
              .roundedRect(badgeX, startY - 1, badgeWidth, 18, 5)
              .fill(colors.soft);

            doc
              .fillColor(colors.primary)
              .font("Helvetica")
              .fontSize(8)
              .text(q.difficulty, badgeX + 8, startY + 4);

            // Marks

            const marksText = `[${q.marks} Mark${q.marks > 1 ? "s" : ""}]`;

            const marksWidth = 75;

            doc
              .font("Helvetica-Bold")
              .fontSize(10)
              .fillColor(colors.primary)
              .text(marksText, PAGE_WIDTH - 120, startY, {
                width: marksWidth,
                align: "right",
              });

            // Question Text

            const questionTextX = badgeX + badgeWidth + 12;

            const questionTextWidth = PAGE_WIDTH - questionTextX - 130;

            doc.fillColor(colors.primary).font("Helvetica").fontSize(11);

            const questionHeight = doc.heightOfString(q.text, {
              width: questionTextWidth,
              lineGap: 4,
            });

            doc.text(q.text, questionTextX, startY, {
              width: questionTextWidth,
              lineGap: 4,
              align: "left",
            });

            // Move cursor safely

            doc.y = startY + Math.max(questionHeight, 24) + 20;
          });

          doc.moveDown(2);
        });

        // =========================================================
        // FOOTER
        // =========================================================

        ensureSpace(60);

        doc.moveDown(2);

        doc
          .fillColor(colors.secondary)
          .font("Helvetica-Bold")
          .fontSize(10)
          .text("End of Question Paper", {
            align: "center",
          });

        // =========================================================
        // ANSWER KEY PAGE
        // =========================================================

        addNewPage();

        doc.roundedRect(40, 40, PAGE_WIDTH - 80, 80, 22).fill(colors.dark);

        doc
          .fillColor(colors.white)
          .font("Helvetica-Bold")
          .fontSize(22)
          .text("Answer Key & Marking Scheme", 0, 70, {
            align: "center",
          });

        doc.y = 160;

        paper.sections.forEach((section) => {
          ensureSpace(120);

          // Section Title

          doc
            .fillColor(colors.primary)
            .font("Helvetica-Bold")
            .fontSize(15)
            .text(section.sectionName, 0, doc.y, {
              align: "center",
            });

          doc.moveDown(1);

          section.questions.forEach((q, qIndex) => {
            ensureSpace(100);

            const answerY = doc.y;

            doc
              .roundedRect(45, answerY, PAGE_WIDTH - 90, 70, 14)
              .fillAndStroke("#fafafa", colors.border);

            doc
              .fillColor(colors.primary)
              .font("Helvetica-Bold")
              .fontSize(11)
              .text(`Q${qIndex + 1}`, 65, answerY + 18);

            doc
              .font("Helvetica")
              .fontSize(10)
              .text(q.answer, 120, answerY + 18, {
                width: PAGE_WIDTH - 190,
                lineGap: 3,
              });

            doc.y = answerY + 90;
          });

          doc.moveDown(1);
        });

        // =========================================================
        // FINALIZE
        // =========================================================

        doc.end();

        writeStream.on("finish", () => {
          logger.info(`PDF generated successfully at: ${filePath}`);

          resolve(`/pdfs/${fileName}`);
        });

        writeStream.on("error", (err) => {
          logger.error("Error writing PDF stream", err);

          reject(err);
        });
      } catch (err) {
        logger.error("Failed to construct PDF document", err);

        reject(err);
      }
    });
  }
}
