// Importing dependencies using ESM syntax
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, rgb } from 'pdf-lib';
import fetch from 'node-fetch';

// Replace require() model imports with dynamic imports or named imports if available
import Exam from '../../Center_Backend/models/Exam.models.js';
import Franchise from '../../Admin_Backend/models/franchise/franchise.models.js';
import Student from '../../Admin_Backend/models/Student/Student_Details.model.js';

// Setup __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enhanced image fetching with better error handling and format detection
const fetchImageBytes = async (url) => {
    try {
        if (!url || typeof url !== 'string') {
            console.warn('Invalid image URL provided:', url);
            return null;
        }

        console.log('Fetching image from:', url);
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'image/*',
            },
            timeout: 10000 // 10 second timeout
        });

        if (!response.ok) {
            console.error(`Failed to fetch image: ${url}, status: ${response.status}`);
            return null;
        }

        const contentType = response.headers.get("content-type");
        const buffer = await response.arrayBuffer();

        // Determine image type
        let imageType = 'jpg'; // default
        if (contentType) {
            if (contentType.includes('png')) imageType = 'png';
            else if (contentType.includes('jpeg') || contentType.includes('jpg')) imageType = 'jpg';
        } else {
            // Fallback: check URL extension
            const urlLower = url.toLowerCase();
            if (urlLower.includes('.png')) imageType = 'png';
        }

        return {
            buffer: new Uint8Array(buffer),
            imageType,
            contentType
        };
    } catch (error) {
        console.error('Error fetching image:', url, error.message);
        return null;
    }
};

// Enhanced PDF template filling with fixed coordinates
export const fillAdmitCardTemplate = async (data) => {
    try {
        const templatePath = path.join(__dirname, '../templates/admitCard.pdf');
        
        if (!readFileSync(templatePath)) {
            throw new Error('Template PDF not found at: ' + templatePath);
        }
        
        const existingPdfBytes = readFileSync(templatePath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const firstPage = pdfDoc.getPages()[0];

        // Get page dimensions for reference
        const { width, height } = firstPage.getSize();
        console.log(`PDF dimensions: ${width} x ${height}`);

        // Font settings
        const fontSize = 12;
        const smallFontSize = 10;
        const titleFontSize = 16;
        const color = rgb(0, 0, 0);

        // FIXED COORDINATES FOR TEXT PLACEMENT
        // Based on your admit card template
        const coordinates = {
            // Header section
            centerAddress: { x: 155, y: height - 225 }, // After "CENTER ADDRESS:-"
            centerContact: { x: 160, y: height - 220 }, // After "CENTRE CONTACT NO.:"
            centerName: { x: 150, y: height - 195 }, // "CENTER NAME:-"
            
            // Student Details (Left column)
            studentName: { x: 50, y: height - 412 }, // After "STUDENT NAME"
            fatherName: { x: 300, y: height - 412 }, // After "S/O - D/O - W/O"
            motherName: { x: 450, y: height - 412 }, // After "MOTHER NAME"
            dateOfBirth: { x: 455, y: height - 495 }, // After "DATE OF BIRTH.:"
            gender: { x: 50, y: height - 495 }, // After "GENDER:"
            email: { x: 155, y: height - 495 }, // After "E-MAIL :"
            mobile: { x: 280, y: height - 452 }, // After "STUDENT MOBILE:"
            qualification: { x: 50, y: height - 450 }, // After "QUALIFICATION :"
            permanentAddress: { x: 50, y: height - 550 }, // After "PERMANENT ADDRESS :"
            
            // Right column
            registrationId: { x: 400, y: height - 326 }, // After "REGISTRATION ID :"
            courseInterest: { x: 50, y: height - 370 }, // After "COURSE OF INTEREST:"
            examDate: { x: 50, y: height - 329 }, // After "EXAM DATE :"
            courseCode: { x: 140, y: height - 280 }, // Af
            centerContact: { x: 420, y: height - 280 }, 
            examinationCenter: { x: 180, y: height - 650 }, // After "EXAMINATION CENTRE:-"
            
            // Image positions based on template layout
            studentPhoto: { x: 455, y: height - 195, width: 100, height: 120 }, // Right side, upper area
            // studentSignature: { x: 200, y: 167, width: 120, height: 40 }, // After "STUDENT'S SIGNATURE :"
            instituteSeal: { x: 400, y: height - 583, width: 100, height: 40 }, // "SEAL & SINGNATURE DIRECTOR" area
            examinerSignature: { x: 200, y: height - 755, width: 120, height: 40 } // After "EXAMINER SIGNATURE:-"
        };

        // Fill Institute/Center Details
        if (data.institute.instituteName) {
            firstPage.drawText(data.institute.instituteName, {
                x: coordinates.centerName.x,
                y: coordinates.centerName.y,
                size: fontSize,
                color
            });
        }

        if (data.institute.centerContact) {
            firstPage.drawText(data.institute.centerContact, {
                x: coordinates.centerContact.x,
                y: coordinates.centerContact.y,
                size: fontSize,
                color
            });
        }

        // Center address
        const fullAddress = [
            data.institute.address?.address,
            data.institute.address?.city,
            data.institute.address?.state
        ].filter(Boolean).join(', ');

        const studentfullAddress = [
            data.student.studentaddress?.permanentAddress,
            data.student.studentaddress?.city,
            data.student.studentaddress?.postCode
        ].filter(Boolean).join(', ');

        if (studentfullAddress) {
            firstPage.drawText(fullAddress, {
                x: coordinates.permanentAddress.x,
                y: coordinates.permanentAddress.y,
                size: smallFontSize,
                color
            });
        }
        
        if (fullAddress) {
            firstPage.drawText(fullAddress, {
                x: coordinates.centerAddress.x,
                y: coordinates.centerAddress.y,
                size: smallFontSize,
                color
            });
        }

        // Fill Student Details according to template layout
        const studentFields = [
            { value: data.student.name, coord: coordinates.studentName },
            { value: data.student.fatherName, coord: coordinates.fatherName },
            { value: data.student.motherName, coord: coordinates.motherName },
            { value: data.student.mobile, coord: coordinates.mobile },
            { value: data.student.qualification, coord: coordinates.qualification },
            { value: data.student.rollNumber, coord: coordinates.registrationId },
            { value: data.student.email, coord: coordinates.email },
            { value: data.student.dob, coord: coordinates.dateOfBirth },
            { value: data.student.gender, coord: coordinates.gender },
            {value: data.student.permanentAddress, coord: coordinates.permanentAddress },

            { value: data.student.courseName, coord: coordinates.courseInterest }
        ];

        studentFields.forEach(field => {
            if (field.value) {
                firstPage.drawText(String(field.value), {
                    x: field.coord.x,
                    y: field.coord.y,
                    size: fontSize,
                    color
                });
            }
        });

        // Fill Exam Details
        if (data.exam.examDate) {
            firstPage.drawText(String(data.exam.examDate), {
                x: coordinates.examDate.x,
                y: coordinates.examDate.y,
                size: fontSize,
                color
            });
        }

        if (data.exam.courseCode) {
            firstPage.drawText(String(data.exam.courseCode), {
                x: coordinates.courseCode.x,
                y: coordinates.courseCode.y,
                size: fontSize,
                color
            });
        }

        // Examination center (same as institute name)
        if (fullAddress) {
            firstPage.drawText(data.institute.instituteName, {
                x: coordinates.examinationCenter.x,
                y: coordinates.examinationCenter.y,
                size: fontSize,
                color
            });
        }

        // Embed Images with error handling - positioned for your template
        const images = [
            { url: data.student.photo, coord: coordinates.studentPhoto, name: 'student photo' },
            { url: data.student.signature, coord: coordinates.studentSignature, name: 'student signature' },
            { url: data.institute.signature, coord: coordinates.instituteSeal, name: 'institute seal/signature' },
            { url: data.institute.photo, coord: coordinates.examinerSignature, name: 'examiner signature' } // or use for institute logo
        ];

        for (const img of images) {
            if (img.url) {
                try {
                    const imageData = await fetchImageBytes(img.url);
                    if (imageData) {
                        let embeddedImage;
                        
                        if (imageData.imageType === 'png') {
                            embeddedImage = await pdfDoc.embedPng(imageData.buffer);
                        } else {
                            embeddedImage = await pdfDoc.embedJpg(imageData.buffer);
                        }

                        firstPage.drawImage(embeddedImage, {
                            x: img.coord.x,
                            y: img.coord.y,
                            width: img.coord.width,
                            height: img.coord.height
                        });
                        
                        console.log(`Successfully embedded ${img.name}`);
                    }
                } catch (error) {
                    console.error(`Failed to embed ${img.name}:`, error.message);
                    // Continue with PDF generation even if some images fail
                }
            }
        }

        // Save the PDF
        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);

    } catch (error) {
        console.error('Error filling PDF template:', error);
        throw new Error(`PDF generation failed: ${error.message}`);
    }
};

// Main function to generate admit card
export const generateAdmitCard = async (req, res) => {
    try {
        const { examId, rollNumber } = req.params;
        const decodedRollNumber = decodeURIComponent(rollNumber);

        // Fetch exam data
        const exam = await Exam.findOne({ ExamID: examId }).populate('batch');
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Fetch franchise data
        const franchise = await Franchise.findOne({ franchiseId: exam.franchiseId });
        if (!franchise) {
            return res.status(404).json({
                success: false,
                message: 'Franchise not found'
            });
        }

        // Fetch student data
        const student = await Student.findOne({ rollNumber: decodedRollNumber }).populate('courseInterested');
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Prepare admit card data
        const admitCardData = {
            exam: {
                examId: exam.ExamID,
                examDate: exam.examDate ? new Date(exam.examDate).toDateString() : '',
                examName: exam.examName || `${exam.batch?.name || ''} Examination`,
                courseCode: exam.courseCode,
                duration: exam.examDurationMinutes,
                totalMarks: exam.totalMarks,
                examMode: exam.examMode,
            },
            institute: {
                instituteName: franchise.franchiseName,
                photo: franchise.ownerPhotoUrl,
                instituteNumber: franchise.mobile,
                signature: franchise.franchiseSignatureUrl,
                centerContact: franchise.mobile,
                address: {
                    state: franchise.state || '',
                    city: franchise.city || '',
                    address: franchise.address || ''
                }
            },
            student: {
                name: student.studentName,
                rollNumber: student.rollNumber,
                photo: student.studentPhoto,
                motherName: student.motherName,
                qualification: student.qualifications,
                mobile: student.studentMobile,
                signature: student.studentSignature,
                courseName: student.courseInterested?.courseName || '',
                email: student.email,
                gender: student.gender,
                dob: student.dob ? new Date(student.dob).toLocaleDateString() : '',
                studentaddress: {
                    permanentAddress: student.permanentAddress || '',
                    city: student.city || '',
                    postCode: student.postCode || ''
                },
                fatherName: student.fatherHusbandName || ''
            }
        };

        console.log('Admit Card Data:', admitCardData);

        console.log("Generating admit card for:", {
            examId: admitCardData.exam.examId,
            rollNumber: admitCardData.student.rollNumber,
            studentName: admitCardData.student.name
        });

        // Generate PDF
        const pdfBuffer = await fillAdmitCardTemplate(admitCardData);

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=admit-card-${examId}-${rollNumber}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error generating admit card:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while generating admit card',
            error: error.message
        });
    }
};

// Optional: HTML generator for preview
export const generateAdmitCardHTML = (data) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admit Card - ${data.student.rollNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .admit-card { border: 2px solid #000; padding: 20px; max-width: 800px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 20px; }
                .student-photo, .institute-logo { width: 100px; height: 100px; object-fit: cover; }
                .signature { width: 150px; height: 60px; object-fit: contain; }
                table { width: 100%; border-collapse: collapse; }
                td { padding: 8px; border: 1px solid #ccc; }
            </style>
        </head>
        <body>
            <div class="admit-card">
                <div class="header">
                    <h1>${data.institute.instituteName}</h1>
                    <p>${data.institute.address?.address}, ${data.institute.address?.city}, ${data.institute.address?.state}</p>
                </div>
                <table>
                    <tr>
                        <td><strong>Student Name:</strong></td>
                        <td>${data.student.name}</td>
                        <td rowspan="4">
                            ${data.student.photo ? `<img src="${data.student.photo}" class="student-photo" alt="Student Photo">` : ''}
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Roll Number:</strong></td>
                        <td>${data.student.rollNumber}</td>
                    </tr>
                    <tr>
                        <td><strong>Course:</strong></td>
                        <td>${data.student.courseName}</td>
                    </tr>
                    <tr>
                        <td><strong>Exam Date:</strong></td>
                        <td>${data.exam.examDate}</td>
                    </tr>
                </table>
            </div>
        </body>
        </html>
    `;
};