import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const downloadCertificate = async (req, res) => {
  try {
    // ✅ MOCK CERTIFICATE DATA FOR TESTING
    const cert = {
      studentName: "Ankur Kumar",
      courseName: "Machine Learning",
      rollNumber: "SKC1001",
      session: "2025 - 2030",
      percentage: "85",
      grade: "A+",
      instituteName: "AK CLASSES",
      instituteEmail: "info@akclasses.com",
      institutePhone: "+91-9876543210",
      examDate: "2025-06-25",
    };

    const templatePath = path.join(__dirname, "..", "..", "templates", "certificate.pdf");

    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      return res.status(500).json({ error: "Certificate template file not found" });
    }

    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { width, height } = page.getSize();

    // 🖊️ Draw the certificate fields
    page.drawText(cert.studentName || "", { x: 210, y: height - 320, size: 32, font, color: rgb(0, 0, 0) });
    page.drawText(cert.courseName || "", { x: 140, y: height - 395, size: 16, font });
    page.drawText(`${cert.rollNumber || ""}`, { x: 485, y: height - 160, size: 16, font });
    page.drawText(`${cert.session || ""}`, { x: 280, y: height - 248, size: 15, font });
    page.drawText(`${cert.percentage || ""}%`, { x: 160, y: height - 420, size: 16, font });
    page.drawText(`${cert.grade || ""}`, { x: 275, y: height - 415, size: 16, font });
    page.drawText(`${cert.instituteName || ""}`, { x: 35, y: 325, size: 12, font });
    // page.drawText(`${cert.rollNumber || ""}`, { x: 35, y: 325, size: 12, font });
    page.drawText(`${cert.instituteEmail || ""}`, { x: 335, y: 50, size: 12, font });
    page.drawText(`${cert.institutePhone || ""}`, { x: 360, y: 65, size: 12, font });
    page.drawText(`${cert.examDate || ""}`, { x: 470, y: height - 357, size: 16, font });

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
res.setHeader("Content-Disposition", `attachment; filename=${cert.studentName}_certificate.pdf`);
res.end(pdfBytes);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Failed to generate certificate PDF" });
  }
};


// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
// import Certificate from "../models/certificate.model.js"; // adjust path if needed

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export const downloadCertificate = async (req, res) => {
//   const { certificateId } = req.params;

//   try {
//     const cert = await Certificate.findOne({
//       "courses.results.certificateId": certificateId,
//     });
//     if (!cert) return res.status(404).json({ error: "Certificate not found" });

//     const templatePath = path.join(__dirname, "..", "..", "templates", "certificate.pdf");
//     const templateBytes = fs.readFileSync(templatePath);

//     const pdfDoc = await PDFDocument.load(templateBytes);
//     const page = pdfDoc.getPages()[0];
//     const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
//     const { width, height } = page.getSize();

//     // Example placements (adjust x/y for real template)
//     page.drawText(cert.studentName, { x: 100, y: height - 100, size: 14, font, color: rgb(0, 0, 0) });
//     page.drawText(cert.courseName, { x: 100, y: height - 130, size: 12, font, color: rgb(0, 0, 0) });
//     page.drawText(`Roll No: ${cert.rollNumber}`, { x: 100, y: height - 160, size: 12, font });
//     page.drawText(`Session: ${cert.session}`, { x: 100, y: height - 190, size: 12, font });
//     page.drawText(`Percentage: ${cert.percentage}%`, { x: 100, y: height - 220, size: 12, font });
//     page.drawText(`Grade: ${cert.grade}`, { x: 100, y: height - 250, size: 12, font });
//     page.drawText(`Institute: ${cert.instituteName}`, { x: 100, y: height - 280, size: 12, font });
//     page.drawText(`Email: ${cert.instituteEmail}`, { x: 100, y: height - 310, size: 12, font });
//     page.drawText(`Phone: ${cert.institutePhone}`, { x: 100, y: height - 340, size: 12, font });
//     page.drawText(`Exam Date: ${cert.examDate}`, { x: 100, y: height - 370, size: 12, font });

//     const pdfBytes = await pdfDoc.save();

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `attachment; filename=${cert.studentName}_certificate.pdf`);
//     res.send(pdfBytes);
//   } catch (err) {
//     console.error("Download error:", err);
//     res.status(500).json({ error: "Failed to generate certificate PDF" });
//   }
// };
