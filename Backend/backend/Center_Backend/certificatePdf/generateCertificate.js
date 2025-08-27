import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import QRCode from "qrcode";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import Certificate from "../models/certificate.model.js"; // adjust path if needed

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const downloadCertificate = async (req, res) => {
  const { certificateId } = req.params;
  // console.log("Certificate ID:", certificateId);

  try {
    const cert = await Certificate.findOne({
      "courses.results.certificateId": certificateId,
    });
    // console.log("Certificate Data:", cert);

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

    // Get the franchiseId from the certificate document (not from result)
    const franchiseId = cert.franchiseId;
    console.log("Certificate found in Franchise ID:", franchiseId);

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

    const encodedCertId = encodeURIComponent(certificateId);
    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${encodedCertId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl);
    const qrImageBuffer = Buffer.from(
      qrCodeDataUrl.replace(/^data:image\/png;base64,/, ""),
      "base64"
    );

    // Embed QR image
    const qrImage = await pdfDoc.embedPng(qrImageBuffer);

    // Define QR size and position
    const qrSize = 100;
    const qrX = 485;
    const qrY = 72;

    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

    // Check the image type (you can use other formats if needed)
    let embeddedImage;
    if (imageUrl.endsWith(".png")) {
      embeddedImage = await pdfDoc.embedPng(imageBuffer);
    } else {
      embeddedImage = await pdfDoc.embedJpg(imageBuffer);
    }

    let embeddedSignature;
    if (signatureUrl.endsWith(".png")) {
      embeddedSignature = await pdfDoc.embedPng(signatureBuffer);
    } else {
      embeddedSignature = await pdfDoc.embedJpg(signatureBuffer);
    }

    const imageDims = embeddedImage.scale(0.15);
    const signatureDims = embeddedSignature.scale(0.05);

    const studentName = matchingResult.studentName || "";
    const fontSize = 32;

    // Measure text width
    const textWidth = font.widthOfTextAtSize(studentName, fontSize);

    // Calculate centered X position
    const centerX = (width - textWidth) / 2;

    // Passport size photo box
    const targetImageWidth = 85;
    const targetImageHeight = 100;

    // Get actual image dimensions
    const actualImageWidth = embeddedImage.width;
    const actualImageHeight = embeddedImage.height;

    // Calculate scale factor to fit image in box (preserving aspect ratio)
    const imageScale = Math.min(
      targetImageWidth / actualImageWidth,
      targetImageHeight / actualImageHeight
    );

    // Final scaled dimensions
    const scaledImageWidth = actualImageWidth * imageScale;
    const scaledImageHeight = actualImageHeight * imageScale;

    // Optional: center the image inside the box (adjust X, Y)
    const boxTopY = height - 174; // top Y position of the image box
    const imageX = 482 + (targetImageWidth - scaledImageWidth) / 2;
    const imageY = boxTopY - targetImageHeight + (targetImageHeight - scaledImageHeight) / 2;

    page.drawText(studentName, {
      x: centerX,
      y: height - 318, // your Y position
      size: fontSize,
      font,
      color: rgb(0.976, 0.596, 0.0078),
    });

    // Draw image inside the box
    page.drawImage(embeddedImage, {
      x: imageX,
      y: imageY,
      width: scaledImageWidth,
      height: scaledImageHeight,
    });

    // Signature box with aspect ratio
    const targetSignatureWidth = 80;
    const targetSignatureHeight = 38;

    // Get actual signature image dimensions
    const actualSigWidth = embeddedSignature.width;
    const actualSigHeight = embeddedSignature.height;

    // Calculate scale factor to fit signature in box
    const sigScale = Math.min(
      targetSignatureWidth / actualSigWidth,
      targetSignatureHeight / actualSigHeight
    );

    // Final scaled dimensions
    const scaledSigWidth = actualSigWidth * sigScale;
    const scaledSigHeight = actualSigHeight * sigScale;

    // Signature box top-left reference point
    const sigBoxX = 485;
    const sigBoxTopY = height - 274;

    // Center signature inside the box
    const sigX = sigBoxX + (targetSignatureWidth - scaledSigWidth) / 2;
    const sigY = sigBoxTopY - targetSignatureHeight + (targetSignatureHeight - scaledSigHeight) / 2;

    // Draw the signature image
    page.drawImage(embeddedSignature, {
      x: sigX,
      y: sigY,
      width: scaledSigWidth,
      height: scaledSigHeight,
    });

    // Add all the text fields - using franchiseId from document level, not result level
    page.drawText(matchingCourse.courseName || "", { x: 140, y: height - 387, size: 16, font, color: rgb(0.976, 0.596, 0.0078), });
    page.drawText(`${matchingResult.certificateId || ""}`, { x: 425, y: height - 152, size: 16, font, color: rgb(0.976, 0.596, 0.0078), });
    page.drawText(`${matchingResult.rollNumber || ""}`, { x: 180, y: height - 152, size: 16, font, color: rgb(0.976, 0.596, 0.0078), });

    page.drawText(`${matchingResult.session || ""}`, { x: 278, y: height - 240, size: 15, font, color: rgb(0.976, 0.596, 0.0078), });
    page.drawText(`${matchingResult.percentage || ""}%`, { x: 157, y: height - 408, size: 15, font, color: rgb(0.976, 0.596, 0.0078), });
    page.drawText(`${matchingResult.grade || ""}+ `, { x: 276, y: height - 408, size: 15, font, color: rgb(0.976, 0.596, 0.0078), });
    page.drawText(`${matchingResult.courseSubject || ""}`, { x: 190, y: height - 440, size: 16, font, color: rgb(0.976, 0.596, 0.0078), });

    page.drawText(`${matchingResult.instituteName || ""}`, { x: 32, y: 338, size: 12, font, color: rgb(0.976, 0.596, 0.0078), });
    // Use franchiseId from document level (cert.franchiseId), not from matchingResult
    page.drawText(`${franchiseId || "Null"}`, { x: 246, y: 338, size: 8, font, color: rgb(0.976, 0.596, 0.0078), });

    page.drawText(`${matchingResult.instituteEmail || ""}`, { x: 335, y: 58, size: 12, font });
    page.drawText(`${matchingResult.institutePhone || ""}`, { x: 360, y: 73, size: 12, font });
    
    const rawDate = matchingResult.examDate || "";
    const formattedDate = rawDate ? formatDate(rawDate) : "";

    page.drawText(formattedDate, {
      x: 470,
      y: height - 350,
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