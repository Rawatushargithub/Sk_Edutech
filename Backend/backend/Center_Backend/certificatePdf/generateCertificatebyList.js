import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import QRCode from "qrcode";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import Certificate from "../models/certificate.model.js"; // adjust path if needed

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const downloadCertificatebyList = async (req, res) => {
  const { rollNumber } = req.params;
  console.log(rollNumber); // ✅ Now we take roll number instead of certificateId

  try {
    // Step 1: Find student by roll number
    const cert = await Certificate.findOne({
      "courses.results.rollNumber": rollNumber,
    });

    if (!cert) return res.status(404).json({ error: "Certificate not found" });

    // Step 2: Find the matching verified result
    let matchingResult = null;
    let matchingCourse = null;

    for (const course of cert.courses) {
      for (const result of course.results) {
        if (result.rollNumber === rollNumber && result.isApproved === true) {
            console.log("Matching Result:", result.isApproved);
          matchingResult = result;
          matchingCourse = course;
          break;
        }
      }
      if (matchingResult) break;
    }

    // console.log("Matching Result:", result);

    if (!matchingResult) {
      return res.status(403).json({ error: "Certificate not verified or not found" });
    }

    // Step 3: Load and modify the PDF
    const templatePath = path.join(__dirname, "..", "..", "templates", "certificate.pdf");

    if (!fs.existsSync(templatePath)) {
      return res.status(500).json({ error: "Certificate template file not found" });
    }

    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { width, height } = page.getSize();

    // Fetch student photo & signature
    const imageUrl = matchingResult.studentPhoto;
    const signatureUrl = matchingResult.studentSignature;
    const imageRes = await fetch(imageUrl);
    const signatureRes = await fetch(signatureUrl);
    const imageBuffer = await imageRes.arrayBuffer();
    const signatureBuffer = await signatureRes.arrayBuffer();

    function formatDate(dateStr) {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }

    // QR Code for verification
    const encodedCertId = encodeURIComponent(matchingResult.certificateId);
    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${encodedCertId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl);
    const qrImageBuffer = Buffer.from(
      qrCodeDataUrl.replace(/^data:image\/png;base64,/, ""),
      "base64"
    );

    const qrImage = await pdfDoc.embedPng(qrImageBuffer);

    // Draw QR Code
    const qrSize = 100;
    page.drawImage(qrImage, { x: 485, y: 67, width: qrSize, height: qrSize });

    // Student photo
    let embeddedImage;
    if (imageUrl.endsWith(".png")) {
      embeddedImage = await pdfDoc.embedPng(imageBuffer);
    } else {
      embeddedImage = await pdfDoc.embedJpg(imageBuffer);
    }

    // Student signature
    let embeddedSignature;
    if (signatureUrl.endsWith(".png")) {
      embeddedSignature = await pdfDoc.embedPng(signatureBuffer);
    } else {
      embeddedSignature = await pdfDoc.embedJpg(signatureBuffer);
    }

    // Positioning student name in center
    const studentName = matchingResult.studentName || "";
    const fontSize = 32;
    const textWidth = font.widthOfTextAtSize(studentName, fontSize);
    const centerX = (width - textWidth) / 2;

    // Passport photo
    const targetImageWidth = 85;
    const targetImageHeight = 100;
    const imageScale = Math.min(
      targetImageWidth / embeddedImage.width,
      targetImageHeight / embeddedImage.height
    );
    const scaledImageWidth = embeddedImage.width * imageScale;
    const scaledImageHeight = embeddedImage.height * imageScale;
    const boxTopY = height - 180;
    const imageX = 482 + (targetImageWidth - scaledImageWidth) / 2;
    const imageY = boxTopY - targetImageHeight + (targetImageHeight - scaledImageHeight) / 2;

    // Signature box
    const targetSignatureWidth = 80;
    const targetSignatureHeight = 38;
    const sigScale = Math.min(
      targetSignatureWidth / embeddedSignature.width,
      targetSignatureHeight / embeddedSignature.height
    );
    const scaledSigWidth = embeddedSignature.width * sigScale;
    const scaledSigHeight = embeddedSignature.height * sigScale;
    const sigBoxX = 485;
    const sigBoxTopY = height - 280;
    const sigX = sigBoxX + (targetSignatureWidth - scaledSigWidth) / 2;
    const sigY = sigBoxTopY - targetSignatureHeight + (targetSignatureHeight - scaledSigHeight) / 2;

    // Draw elements
    page.drawText(studentName, {
      x: centerX,
      y: height - 322,
      size: fontSize,
      font,
      color: rgb(0.976, 0.596, 0.0078),
    });

    page.drawImage(embeddedImage, { x: imageX, y: imageY, width: scaledImageWidth, height: scaledImageHeight });
    page.drawImage(embeddedSignature, { x: sigX, y: sigY, width: scaledSigWidth, height: scaledSigHeight });

    // Other certificate details
    page.drawText(matchingCourse.courseName || "", { x: 140, y: height - 395, size: 16, font, color: rgb(0.976, 0.596, 0.0078), });
    page.drawText(`${matchingResult.rollNumber || ""}`, { x: 485, y: height - 160, size: 16, font, color: rgb(0.976, 0.596, 0.0078), });
    page.drawText(`${matchingResult.certificateId || ""}`, { x: 180, y: height - 160, size: 16, font, color: rgb(0.976, 0.596, 0.0078), });
    page.drawText(`${matchingResult.session || ""}`, { x: 280, y: height - 248, size: 15, font, color: rgb(0.976, 0.596, 0.0078), });
    page.drawText(`${matchingResult.percentage || ""}%`, { x: 157, y: height - 417, size: 15, font, color: rgb(0.976, 0.596, 0.0078), });
    page.drawText(`${matchingResult.grade || ""}`, { x: 276, y: height - 417, size: 15, font, color: rgb(0.976, 0.596, 0.0078), });
    page.drawText(`${matchingResult.courseSubject || ""}`, { x: 190, y: height - 450, size: 16, font, color: rgb(0.976, 0.596, 0.0078), });
    page.drawText(`${matchingResult.instituteName || ""}`, { x: 32, y: 328, size: 12, font, color: rgb(0.976, 0.596, 0.0078), });
    page.drawText(`${matchingResult.certificateId || ""}`, { x: 245, y: 330, size: 7, font, color: rgb(0.976, 0.596, 0.0078), });
    page.drawText(`${matchingResult.instituteEmail || ""}`, { x: 335, y: 50, size: 12, font });
    page.drawText(`${matchingResult.institutePhone || ""}`, { x: 360, y: 65, size: 12, font });

    const formattedDate = matchingResult.examDate ? formatDate(matchingResult.examDate) : "";
    page.drawText(formattedDate, { x: 470, y: height - 357, size: 16, font, color: rgb(0.976, 0.596, 0.0078), });

    const pdfBytes = await pdfDoc.save();

    // Step 4: Send PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${matchingResult.studentName}_certificate.pdf`);
    res.end(pdfBytes);

  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Failed to generate certificate PDF" });
  }
};
