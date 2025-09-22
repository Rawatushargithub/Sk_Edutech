import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import dotenv from 'dotenv';
dotenv.config();
import Franchise from '../../Admin_Backend/models/franchise/franchise.models.js';

export const getCenterCertificate = async (req, res) => {
    try {
        const { franchiseId } = req.params;

        // Fetch franchise from DB
        const franchise = await Franchise.findOne({ franchiseId });
        if (!franchise) {
            return res.status(404).json({ message: 'Franchise not found' });
        }

        // Load PDF template
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const templatePath = path.join(__dirname, '..', '..', 'templates', 'centerCertificate.pdf');
        const templateBytes = fs.readFileSync(templatePath);
        

        const pdfDoc = await PDFDocument.load(templateBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        // Load fonts
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // ========== Insert Passport-Size Photo ==========
        // if (franchise.franchiseLogoUrl) {
        //     let photoBytes;
        //     if (franchise.franchiseLogoUrl.startsWith('http')) {
        //         const fetchRes = await fetch(franchise.franchiseLogoUrl);
        //         photoBytes = await fetchRes.arrayBuffer();
        //     } else {
        //         const photoPath = path.join(__dirname, '..', '..', 'uploads', franchise.franchiseLogoUrl);
        //         photoBytes = fs.readFileSync(photoPath);
        //     }

        //     const imageExt = franchise.franchiseLogoUrl.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
        //     const pdfImage =
        //         imageExt === 'png'
        //             ? await pdfDoc.embedPng(photoBytes)
        //             : await pdfDoc.embedJpg(photoBytes);

        //     firstPage.drawImage(pdfImage, {
        //         x: 400,
        //         y: 715,
        //         width: 78,
        //         height: 78
        //     });
        // }

        // ========== Insert QR Code ==========
        const frontendUrl = process.env.FRONTEND_URL;
        const encodedId = encodeURIComponent(franchise.franchiseId);
        const qrDataUrl = await QRCode.toDataURL(`${frontendUrl}/franchise/${encodedId}`);

        const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
        const qrImage = await pdfDoc.embedPng(qrImageBytes);

        firstPage.drawImage(qrImage, {
            x: 405,
            y: 22,
            width: 80,
            height: 80
        });

        // ========== Franchise Name Box ==========
        const boxXName = 95;
        const boxYName = 582;
        const boxWidthName = 350;
        const boxHeightName = 40;

        // firstPage.drawRectangle({
        //     x: boxXName,
        //     y: boxYName,
        //     width: boxWidthName,
        //     height: boxHeightName,
        //     borderColor: rgb(0, 0, 0),
        //     borderWidth: 1
        // });

        const franchiseName = franchise.franchiseName || '';
        const fontSizeFranchise = 28;
        const textWidthFranchise = boldFont.widthOfTextAtSize(franchiseName, fontSizeFranchise);
        const textHeightFranchise = boldFont.heightAtSize(fontSizeFranchise);

        const textXFranchise = boxXName + (boxWidthName - textWidthFranchise) / 2;
        const textYFranchise = boxYName + (boxHeightName - textHeightFranchise) / 2 + 4;

        firstPage.drawText(franchiseName, {
            x: textXFranchise,
            y: textYFranchise,
            size: fontSizeFranchise,
            font: boldFont,
            color: rgb(0, 0, 0)
        });

               // ✅ Helper: Word wrap
        function wrapText(text, font, fontSize, maxWidth) {
            const words = text.split(' ');
            let lines = [];
            let currentLine = '';

            for (let word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const testWidth = font.widthOfTextAtSize(testLine, fontSize);

                if (testWidth <= maxWidth) {
                    currentLine = testLine;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            if (currentLine) lines.push(currentLine);
            return lines;
        }

        // ========== Address Box (Auto-Wrapped) ==========
        const boxXAddr = 95;
        const boxYAddr = 540;
        const boxWidthAddr = 350;
        const boxHeightAddr = 45;

        const fontSizeAddr = 14;
        const lineSpacingAddr = 15;

        let addressLines = [];

        // Wrap both parts
        addressLines = [
            ...wrapText(franchise.address || '', boldFont, fontSizeAddr, boxWidthAddr),
            ...wrapText(`${franchise.city || ''}, ${franchise.state || ''} - ${franchise.postalCode || ''}`, boldFont, fontSizeAddr, boxWidthAddr)
        ];

        // Calculate height and starting Y
        const textHeightAddr = boldFont.heightAtSize(fontSizeAddr);
        const totalTextHeight = addressLines.length * (textHeightAddr + 2);
        let startYAddr = boxYAddr + (boxHeightAddr - totalTextHeight) / 2 + (addressLines.length - 1) * lineSpacingAddr;

        addressLines.forEach((line, i) => {
            const textWidth = boldFont.widthOfTextAtSize(line, fontSizeAddr);
            const textX = boxXAddr + (boxWidthAddr - textWidth) / 2;
            const textY = startYAddr - i * lineSpacingAddr;

            firstPage.drawText(line, {
                x: textX,
                y: textY,
                size: fontSizeAddr,
                font: boldFont,
                color: rgb(0, 0, 1)
            });
        });

        // ========== Owner Name & Franchise ID ==========
        const ownerName = franchise.ownerName || '';
        const fontSizeOwner = 12;
        const textWidthOwner = regularFont.widthOfTextAtSize(ownerName, fontSizeOwner);
        const xRightOwner = 210;
        const xOwner = xRightOwner - textWidthOwner;

        firstPage.drawText(ownerName, {
            x: xOwner,
            y: 530,
            size: fontSizeOwner,
            color: rgb(0, 0, 0),
            font: boldFont
        });

        firstPage.drawText(franchise.franchiseId || '', {
            x: 300,
            y: 390,
            size: 18,
            color: rgb(0, 0, 0),
            font: boldFont
        });

        // ========== Dates ==========
        const formatDate = (date) => {
            return date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        };

        const activationDate = franchise.activationDate
            ? new Date(franchise.activationDate)
            : new Date();
        const expiryDate = new Date(activationDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        firstPage.drawText(formatDate(activationDate), {
            x: 140,
            y: 358,
            size: 13,
            color: rgb(0, 0, 0),
            font: boldFont
        });

        firstPage.drawText(formatDate(activationDate), {
            x: 420,
            y: 358,
            size: 13,
            color: rgb(0, 0, 0),
            font: boldFont
        });

        firstPage.drawText(formatDate(expiryDate), {
            x: 420,
            y: 333,
            size: 13,
            color: rgb(0, 0, 0),
            font: boldFont
        });

        // Save PDF
        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Error generating certificate:', error);
        res.status(500).json({ message: 'Server error generating certificate' });
    }
};
