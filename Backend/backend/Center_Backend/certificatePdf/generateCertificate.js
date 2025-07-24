import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
// import { rgb } from "pdf-lib";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import Certificate from "../models/certificate.model.js"; // adjust path if needed

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const downloadCertificate = async (req, res) => {
  const { certificateId } = req.params;
  console.log("Certificate ID:", certificateId);
  try {
    // ✅ MOCK CERTIFICATE DATA FOR TESTING
    // const cert = {
    //   studentName: "Ankur Kumar",
    //   courseName: "Machine Learning",
    //   rollNumber: "SKC1001",
    //   session: "2025 - 2030",
    //   percentage: "85",
    //   grade: "A+",
    //   instituteName: "AK CLASSES",
    //   instituteEmail: "info@akclasses.com",
    //   institutePhone: "+91-9876543210",
    //   examDate: "2025-06-25",
    // };

    const cert = await Certificate.findOne({
      "courses.results.certificateId": certificateId,
    });
    console.log("Certificate Data:", cert);

    if (!cert) return res.status(404).json({ error: "Certificate not found" });

    // Step 1: Find the matching course and result
    let matchingResult = null;
    let matchingCourse = null;

    for (const course of cert.courses) {
      for (const result of course.results) {
        if (result.certificateId === certificateId) {
          matchingResult = result;
          matchingCourse = course;
          break;
        }
      }
      if (matchingResult) break;
    }

    if (!matchingResult) {
      return res.status(404).json({ error: "Matching certificate result not found" });
    }

    // Step 2: Load and modify the PDF
    const templatePath = path.join(__dirname, "..", "..", "templates", "certificate.pdf");

    if (!fs.existsSync(templatePath)) {
      return res.status(500).json({ error: "Certificate template file not found" });
    }

    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { width, height } = page.getSize();

    const imageUrl = matchingResult.studentPhoto;
    const signatureUrl = matchingResult.studentSignature;
    const imageRes = await fetch(imageUrl);
    const signatureRes = await fetch(signatureUrl);
    const imageBuffer = await imageRes.arrayBuffer();
    const signatureBuffer = await signatureRes.arrayBuffer();

    function formatDate(dateStr) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-based
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

    // Check the image type (you can use other formats if needed)
    let embeddedImage;
    if (imageUrl.endsWith(".png")) {
      embeddedImage = await pdfDoc.embedPng(imageBuffer);
    } else {
      embeddedImage = await pdfDoc.embedJpg(imageBuffer); chrome
    }

    let embeddedSignature;
    if(signatureUrl.endsWith(".png")) {
      embeddedSignature = await pdfDoc.embedPng(signatureBuffer);
    } else {
      embeddedSignature = await pdfDoc.embedJpg(signatureBuffer);
    }


    const imageDims = embeddedImage.scale(0.15);
    const signatureDims =  embeddedSignature.scale(0.05);

    const studentName = matchingResult.studentName || "";
    const fontSize = 32;

    // Measure text width
    const textWidth = font.widthOfTextAtSize(studentName, fontSize);

    // Calculate centered X position
    const centerX = (width - textWidth) / 2;

    // Draw text at centered position
    page.drawText(studentName, {
      x: centerX,
      y: height - 320, // your Y position
      size: fontSize,
      font,
      color: rgb(0.976, 0.596, 0.0078),
    });
    page.drawImage(embeddedImage, {
      x: 480,
      y: height - 280,
      width: imageDims.width - 15,
      height: imageDims.height,
    });
    page.drawImage(embeddedSignature, {
      x: 480,
      y: height - 325,
      width: imageDims.width - 15,
      height: imageDims.height -52,
    });
    page.drawText(matchingCourse.courseName || "", { x: 140, y: height - 395, size: 16, font, color: rgb(0.976, 0.596, 0.0078), });
    page.drawText(`${matchingResult.rollNumber || ""}`, { x: 485, y: height - 160, size: 16, font, color: rgb(0.976, 0.596, 0.0078), });
    page.drawText(`${matchingResult.certificateId || ""}`, { x: 180, y: height - 160, size: 16, font, color: rgb(0.976, 0.596, 0.0078), });

    page.drawText(`${matchingResult.session || ""}`, { x: 280, y: height - 248, size: 15, font, color: rgb(0.976, 0.596, 0.0078), });
    page.drawText(`${matchingResult.percentage || ""}%`, { x: 155, y: height - 415, size: 15, font, color: rgb(0.976, 0.596, 0.0078), });
    page.drawText(`${matchingResult.grade  || ""}+ `, { x: 276, y: height - 415, size: 15, font , color: rgb(0.976, 0.596, 0.0078), });
    page.drawText(`${matchingResult.courseSubject || ""}`, { x: 190, y: height - 450, size: 16, font , color: rgb(0.976, 0.596, 0.0078), });

    page.drawText(`${matchingResult.instituteName || ""}`, { x: 35, y: 328, size: 12, font, color: rgb(0.976, 0.596, 0.0078), });
    page.drawText(`${matchingResult.certificateId || ""}`, { x: 245, y: 330, size: 7, font, color: rgb(0.976, 0.596, 0.0078), });

    page.drawText(`${matchingResult.instituteEmail || ""}`, { x: 335, y: 50, size: 12, font });
    page.drawText(`${matchingResult.institutePhone || ""}`, { x: 360, y: 65, size: 12, font });
    const rawDate = matchingResult.examDate || "";
    const formattedDate = rawDate ? formatDate(rawDate) : "";

    page.drawText(formattedDate, {
      x: 470,
      y: height - 357,
      size: 16,
      font,
      color: rgb(0.976, 0.596, 0.0078),
    });
    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${matchingResult.studentName}_certificate.pdf`);
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
