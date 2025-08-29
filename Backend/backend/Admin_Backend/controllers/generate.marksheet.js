import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from "url";
import { PDFDocument as PDFLib, rgb, StandardFonts } from 'pdf-lib';
import Marksheet from '../../Center_Backend/models/Marksheet.model.js';
import Student from '../models/Student/Student_Details.model.js';
import Franchise from '../models/franchise/franchise.models.js'; // ✅ Make sure this path is correct

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const downloadMarksheetPDF = async (req, res) => {
    try {
        const { franchiseId, rollNumber } = req.query;

        if (!franchiseId || !rollNumber) {
            return res.status(400).json({
                success: false,
                message: "Franchise ID and Roll Number are required"
            });
        }

        // ✅ Fetch student data
        const student = await Student.findOne({ rollNumber, franchiseId });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // ✅ Fetch marksheet data
        const marksheet = await Marksheet.findOne({ franchiseId });
        if (!marksheet) {
            return res.status(404).json({
                success: false,
                message: "Marksheet not found for this franchise"
            });
        }

        // ✅ Fetch franchise details
        const franchise = await Franchise.findOne({ franchiseId }).select("franchiseName address zipcode state");
        if (!franchise) {
            return res.status(404).json({
                success: false,
                message: "Franchise not found"
            });
        }

        // ✅ Extract student marksheet data
        let courseData = null;
        let studentMarksheetData = null;
        let marksheetCreatedDate = null;

        for (const course of marksheet.courses) {
            const studentInCourse = course.students.find(s => s.rollNumber === rollNumber);
            if (studentInCourse && studentInCourse.approvalStatus === 'approved') {
                courseData = course;
                studentMarksheetData = studentInCourse;
                marksheetCreatedDate = marksheet.createdAt;
                break;
            }
        }

        if (!studentMarksheetData) {
            return res.status(404).json({
                success: false,
                message: "Approved marksheet not found for this student"
            });
        }

        // ✅ Load Template PDF
        const templatePath = path.join(__dirname, "..", "..", "templates", "marksheet_template.pdf");
        if (!fs.existsSync(templatePath)) {
            return res.status(500).json({
                success: false,
                message: "Template PDF not found. Please ensure marksheet_template.pdf exists in /templates folder"
            });
        }

        const existingPdfBytes = fs.readFileSync(templatePath);
        const pdfDoc = await PDFLib.load(existingPdfBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();

        // ✅ Field Positions
        const fieldPositions = {
            marksheetId: { x: 520, y: height - 21 },
            studentName: { x: 80, y: height - 230 },
            rollNumber: { x: 150, y: height - 21 },
            fatherHusbandName: { x: 223, y: height - 250 },
            motherName: { x: 155, y: height - 269 },
            dob: { x: 125, y: height - 289 },
            courseName: { x: 125, y: height - 315 },
            courseCode: { x: 400, y: height - 350 },
            franchiseId: { x: 310, y: height - 355 },
            marksheetDate: { x: 85, y: 32 },

            // ✅ New fields
            franchiseName: { x: 460, y: height - 356 },
            franchiseAddress: { x: 105, y: height - 332 },

            overallMarks: { x: 350, y: 209 },
            overallGrade: { x: 510, y: 209 },

            subjectTableStart: { x: 50, y: height - 440 },
            studentPhoto: { x: 470, y: height - 230, width: 83, height: 95 },
            studentSignature: { x: 470, y: height - 272, width: 84, height: 35 }
        };

        // ✅ Draw Student Photo
        if (student.studentPhoto) {
            try {
                const photoResponse = await axios.get(student.studentPhoto, { responseType: 'arraybuffer' });
                const fileExt = path.extname(student.studentPhoto).toLowerCase();

                let photoImage;
                if (fileExt === ".png") {
                    photoImage = await pdfDoc.embedPng(photoResponse.data);
                } else {
                    photoImage = await pdfDoc.embedJpg(photoResponse.data);
                }

                firstPage.drawImage(photoImage, {
                    x: fieldPositions.studentPhoto.x,
                    y: fieldPositions.studentPhoto.y,
                    width: fieldPositions.studentPhoto.width,
                    height: fieldPositions.studentPhoto.height,
                });
            } catch (err) {
                console.warn("Failed to load student photo:", err.message);
            }
        }

        // ✅ Draw Student Signature
        if (student.studentSignature) {
            try {
                const signatureUrl = student.studentSignature.replace("/upload/", "/upload/f_png/");
                const signResponse = await axios.get(signatureUrl, { responseType: 'arraybuffer' });
                const fileExt = path.extname(signatureUrl).toLowerCase();

                let signImage;
                if (fileExt === ".jpg" || fileExt === ".jpeg") {
                    signImage = await pdfDoc.embedJpg(signResponse.data);
                } else {
                    signImage = await pdfDoc.embedPng(signResponse.data);
                }

                firstPage.drawImage(signImage, {
                    x: fieldPositions.studentSignature.x,
                    y: fieldPositions.studentSignature.y,
                    width: fieldPositions.studentSignature.width,
                    height: fieldPositions.studentSignature.height,
                });
            } catch (err) {
                console.warn("Failed to load student signature:", err.message);
            }
        }
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // ✅ Draw Franchise Details
        firstPage.drawText(franchise.franchiseName || 'N/A', {
            x: width - fieldPositions.franchiseName.x,
            y: fieldPositions.franchiseName.y,
            size: 8,
            font,
            //  color: rgb(1, 1, 0),
        });

        const addressText = `${franchise.address || ''}, ${franchise.state || ''} - ${franchise.zipcode || ''}`;
        firstPage.drawText(addressText, {
            x: fieldPositions.franchiseAddress.x,
            y: fieldPositions.franchiseAddress.y,
            size: 12,
            // color: rgb(0.976, 0.596, 0.008),
        });

        firstPage.drawText(studentMarksheetData.marksheetId || '', {
            x: fieldPositions.marksheetId.x,
            y: fieldPositions.marksheetId.y,
            size: 12,
            font,
        });

        // ✅ Student Info

        // Yellow fields
        firstPage.drawText(student.studentName || '', {
            x: fieldPositions.studentName.x,
            y: fieldPositions.studentName.y,
            size: 12,
            font,
         color: rgb(0.976, 0.596, 0.008),
        });

        firstPage.drawText(student.fatherHusbandName || 'N/A', {
            x: fieldPositions.fatherHusbandName.x,
            y: fieldPositions.fatherHusbandName.y,
            size: 12,
            font,
            color: rgb(0.976, 0.596, 0.008),
        });

        firstPage.drawText(student.motherName || 'N/A', {
            x: fieldPositions.motherName.x,
            y: fieldPositions.motherName.y,
            size: 12,
            font,
            color: rgb(0.976, 0.596, 0.008),
        });

        firstPage.drawText(student.dob || '', {
            x: fieldPositions.dob.x,
            y: fieldPositions.dob.y,
            size: 12,
            font,
            color: rgb(0.976, 0.596, 0.008),
        });

        // Roll Number stays black
        firstPage.drawText(student.rollNumber || '', {
            x: fieldPositions.rollNumber.x,
            y: fieldPositions.rollNumber.y,
            size: 12,
            font
        });

        // ✅ Course Info
        firstPage.drawText(`${courseData.courseName} (${courseData.courseCode})`, { x: fieldPositions.courseName.x, y: fieldPositions.courseName.y, size: 12 });
        firstPage.drawText(franchiseId, { x: fieldPositions.franchiseId.x, y: fieldPositions.franchiseId.y, size: 7 });
        firstPage.drawText(new Date(marksheetCreatedDate).toLocaleDateString('en-IN'), { x: fieldPositions.marksheetDate.x, y: fieldPositions.marksheetDate.y, size: 12 });

        // ✅ Academic Info
        firstPage.drawText(studentMarksheetData.overallTotalMarks.toString(), { x: fieldPositions.overallMarks.x, y: fieldPositions.overallMarks.y, size: 10 });
        firstPage.drawText(studentMarksheetData.overallGrade, { x: fieldPositions.overallGrade.x, y: fieldPositions.overallGrade.y, size: 10 });

        // ✅ Subject Table
        let subjectY = fieldPositions.subjectTableStart.y;
        studentMarksheetData.subjects.forEach((subject, index) => {
            const rowY = subjectY - (index * 20);

            firstPage.drawText(subject.srNo.toString(), { x: 50, y: rowY, size: 12 });
            firstPage.drawText(subject.subjectName, { x: 90, y: rowY, size: 10 });
            firstPage.drawText(subject.theoryMarks.toString(), { x: 310, y: rowY, size: 10 });
            firstPage.drawText(subject.practicalMarks.toString(), { x: 370, y: rowY, size: 10 });
            firstPage.drawText(subject.totalMarks.toString(), { x: 420, y: rowY, size: 10 });
            firstPage.drawText(subject.maximumMarks.toString(), { x: 470, y: rowY, size: 10 });
            firstPage.drawText(subject.grade, { x: 520, y: rowY, size: 10 });
        });

        // ✅ Save and Send PDF
        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${rollNumber}_marksheet.pdf"`);
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('PDF Generation Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate PDF', error: error.message });
    }
};

// import PDFDocument from 'pdfkit';
// import fs from 'fs';
// import path from 'path';
// import axios from 'axios';
// import { fileURLToPath } from "url";
// import { PDFDocument as PDFLib, rgb, StandardFonts } from 'pdf-lib';
// import Marksheet from '../../Center_Backend/models/Marksheet.model.js';
// import Student from '../models/Student/Student_Details.model.js';
// import Franchise from '../models/franchise/franchise.models.js'; // ✅ Make sure this path is correct


// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export const downloadMarksheetPDF = async (req, res) => {
//     try {
//         const { franchiseId, rollNumber } = req.query;

//         if (!franchiseId || !rollNumber) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Franchise ID and Roll Number are required"
//             });
//         }

//         // ✅ Fetch student data
//         const student = await Student.findOne({ rollNumber, franchiseId });
//         if (!student) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Student not found"
//             });
//         }

//         // ✅ Fetch marksheet data
//         const marksheet = await Marksheet.findOne({ franchiseId });
//         if (!marksheet) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Marksheet not found for this franchise"
//             });
//         }

//         // ✅ Fetch franchise details
//         const franchise = await Franchise.findOne({ franchiseId }).select("franchiseName address zipcode state");
//         if (!franchise) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Franchise not found"
//             });
//         }

//         // ✅ Extract student marksheet data
//         let courseData = null;
//         let studentMarksheetData = null;
//         let marksheetCreatedDate = null;

//         for (const course of marksheet.courses) {
//             const studentInCourse = course.students.find(s => s.rollNumber === rollNumber);
//             if (studentInCourse && studentInCourse.approvalStatus === 'approved') {
//                 courseData = course;
//                 studentMarksheetData = studentInCourse;
//                 marksheetCreatedDate = marksheet.createdAt;
//                 break;
//             }
//         }

//         if (!studentMarksheetData) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Approved marksheet not found for this student"
//             });
//         }

//         // ✅ Load Template PDF
//         const templatePath = path.join(__dirname, "..", "..", "templates", "marksheet_template.pdf");
//         if (!fs.existsSync(templatePath)) {
//             return res.status(500).json({
//                 success: false,
//                 message: "Template PDF not found. Please ensure marksheet_template.pdf exists in /templates folder"
//             });
//         }

//         const existingPdfBytes = fs.readFileSync(templatePath);
//         const pdfDoc = await PDFLib.load(existingPdfBytes);
//         const pages = pdfDoc.getPages();
//         const firstPage = pages[0];
//         const { width, height } = firstPage.getSize();

//         // ✅ Field Positions
//         const fieldPositions = {
//             marksheetId: { x: 520, y: height - 21 },
//             studentName: { x: 80, y: height - 230 },
//             rollNumber: { x: 150, y: height - 21 },
//             fatherHusbandName: { x: 223, y: height - 250 },
//             motherName: { x: 155, y: height - 269 },
//             dob: { x: 125, y: height - 289 },
//             courseName: { x: 125, y: height - 315 },
//             courseCode: { x: 400, y: height - 350 },
//             franchiseId: { x: 300, y: height - 355 },
//             marksheetDate: { x: 85, y: 32 },

//             // ✅ New fields
//             franchiseName: { x: 460, y: height - 356 },
//             franchiseAddress: { x: 105, y: height - 332 },

//             overallMarks: { x: 250, y: 209 },
//             // percentage: { x: 300, y: height - 500 },
//             overallGrade: { x: 510, y: 209 },
//             // result: { x: 150, y: height - 530 },

//             subjectTableStart: { x: 50, y: height - 440 }, // shifted down
//             studentPhoto: { x: 470, y: height - 230, width: 83, height: 95 },
//             studentSignature: { x: 470, y: height - 272, width: 84, height: 35 }
//         };


        
//         // ✅ Draw Student Photo
//         if (student.studentPhoto) {
//             try {
//                 const photoResponse = await axios.get(student.studentPhoto, { responseType: 'arraybuffer' });
//                 const fileExt = path.extname(student.studentPhoto).toLowerCase();

//                 let photoImage;
//                 if (fileExt === ".png") {
//                     photoImage = await pdfDoc.embedPng(photoResponse.data);
//                 } else {
//                     photoImage = await pdfDoc.embedJpg(photoResponse.data); // Default to JPG
//                 }

//                 firstPage.drawImage(photoImage, {
//                     x: fieldPositions.studentPhoto.x,
//                     y: fieldPositions.studentPhoto.y,
//                     width: fieldPositions.studentPhoto.width,
//                     height: fieldPositions.studentPhoto.height,
//                 });
//             } catch (err) {
//                 console.warn("Failed to load student photo:", err.message);
//             }
//         }


//         // ✅ Draw Student Signature
//         if (student.studentSignature) {
//             try {
//                 // Force Cloudinary to return PNG (safe for signatures with transparency)
//                 const signatureUrl = student.studentSignature.replace("/upload/", "/upload/f_png/");

//                 const signResponse = await axios.get(signatureUrl, { responseType: 'arraybuffer' });
//                 const fileExt = path.extname(signatureUrl).toLowerCase();

//                 let signImage;
//                 if (fileExt === ".jpg" || fileExt === ".jpeg") {
//                     signImage = await pdfDoc.embedJpg(signResponse.data);
//                 } else {
//                     signImage = await pdfDoc.embedPng(signResponse.data); // default to PNG
//                 }

//                 firstPage.drawImage(signImage, {
//                     x: fieldPositions.studentSignature.x,
//                     y: fieldPositions.studentSignature.y,
//                     width: fieldPositions.studentSignature.width,
//                     height: fieldPositions.studentSignature.height,
//                 });
//             } catch (err) {
//                 console.warn("Failed to load student signature:", err.message);
//             }
//         }


//         // ✅ Draw Franchise Details
//         firstPage.drawText(franchise.franchiseName || 'N/A', {
//             x: width - fieldPositions.franchiseName.x,
//             y: fieldPositions.franchiseName.y,
//             size: 8,
//             color: rgb(0, 0, 0),
//         });

//         const addressText = `${franchise.address || ''}, ${franchise.state || ''} - ${franchise.zipcode || ''}`;
//         firstPage.drawText(addressText, {
//             x: fieldPositions.franchiseAddress.x,
//             y: fieldPositions.franchiseAddress.y,
//             size: 12,
//             color: rgb(0, 0, 0),
//         });

//         firstPage.drawText(studentMarksheetData.marksheetId || '', {
//             x: fieldPositions.marksheetId.x,
//             y: fieldPositions.marksheetId.y,
//             size: 12
//         });
//         // ✅ Student Infoimport { rgb, StandardFonts } from 'pdf-lib';

//         const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

//         firstPage.drawText(student.studentName || '', {
//             x: fieldPositions.studentName.x,
//             y: fieldPositions.studentName.y,
//             size: 12,
//             font,
//             color: rgb(1, 1, 0), // Yellow
//         });

//         firstPage.drawText(student.rollNumber || '', {
//             x: fieldPositions.rollNumber.x,
//             y: fieldPositions.rollNumber.y,
//             size: 12,
//             font,
//             color: rgb(1, 1, 0),
//         });

//         firstPage.drawText(student.fatherHusbandName || 'N/A', {
//             x: fieldPositions.fatherHusbandName.x,
//             y: fieldPositions.fatherHusbandName.y,
//             size: 12,
//             font,
//             color: rgb(1, 1, 0),
//         });

//         firstPage.drawText(student.motherName || 'N/A', {
//             x: fieldPositions.motherName.x,
//             y: fieldPositions.motherName.y,
//             size: 12,
//             font,
//             color: rgb(1, 1, 0),
//         });

//         firstPage.drawText(student.dob || '', {
//             x: fieldPositions.dob.x,
//             y: fieldPositions.dob.y,
//             size: 12,
//             font,
//             color: rgb(1, 1, 0),
//         });

//         firstPage.drawText(student.studentName || '', { x: fieldPositions.studentName.x, y: fieldPositions.studentName.y, size: 12 });

//         firstPage.drawText(student.rollNumber || '', { x: fieldPositions.rollNumber.x, y: fieldPositions.rollNumber.y, size: 12 });
//         firstPage.drawText(student.fatherHusbandName || 'N/A', { x: fieldPositions.fatherHusbandName.x, y: fieldPositions.fatherHusbandName.y, size: 12 });
//         firstPage.drawText(student.motherName || 'N/A', { x: fieldPositions.motherName.x, y: fieldPositions.motherName.y, size: 12 });
//         firstPage.drawText(student.dob || '', { x: fieldPositions.dob.x, y: fieldPositions.dob.y, size: 12 });

//         // ✅ Course Info
//         firstPage.drawText(`${courseData.courseName} (${courseData.courseCode})`, { x: fieldPositions.courseName.x, y: fieldPositions.courseName.y, size: 12 });
//         firstPage.drawText(franchiseId, { x: fieldPositions.franchiseId.x, y: fieldPositions.franchiseId.y, size: 7 });
//         firstPage.drawText(new Date(marksheetCreatedDate).toLocaleDateString('en-IN'), { x: fieldPositions.marksheetDate.x, y: fieldPositions.marksheetDate.y, size: 12 });

//         // ✅ Academic Info
//         firstPage.drawText(studentMarksheetData.overallTotalMarks.toString(), { x: fieldPositions.overallMarks.x, y: fieldPositions.overallMarks.y, size: 10 });
//         // firstPage.drawText(`${studentMarksheetData.percentage}%`, { x: fieldPositions.percentage.x, y: fieldPositions.percentage.y, size: 12 });
//         firstPage.drawText(studentMarksheetData.overallGrade, { x: fieldPositions.overallGrade.x, y: fieldPositions.overallGrade.y, size: 10 });
//         // const result = studentMarksheetData.percentage >= 33 ? 'PASS' : 'FAIL';
//         // firstPage.drawText(result, { x: fieldPositions.result.x, y: fieldPositions.result.y, size: 12, color: result === 'PASS' ? rgb(0, 0.5, 0) : rgb(0.8, 0, 0) });

//         // ✅ Subject Table (pushed down because franchise info is added)
//         let subjectY = fieldPositions.subjectTableStart.y;
//         studentMarksheetData.subjects.forEach((subject, index) => {
//             const rowY = subjectY - (index * 20);

//             firstPage.drawText(subject.srNo.toString(), { x: 50, y: rowY, size: 12 });
//             firstPage.drawText(subject.subjectName, { x: 90, y: rowY, size: 10 });
//             firstPage.drawText(subject.theoryMarks.toString(), { x: 310, y: rowY, size: 10 });
//             firstPage.drawText(subject.practicalMarks.toString(), { x: 370, y: rowY, size: 10 });
//             firstPage.drawText(subject.totalMarks.toString(), { x: 420, y: rowY, size: 10 });
//             firstPage.drawText(subject.maximumMarks.toString(), { x: 470, y: rowY, size: 10 });
//             firstPage.drawText(subject.grade, { x: 520, y: rowY, size: 10 });
//         });

//         // ✅ Save and Send PDF
//         const pdfBytes = await pdfDoc.save();
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename="${rollNumber}_marksheet.pdf"`);
//         res.send(Buffer.from(pdfBytes));

//     } catch (error) {
//         console.error('PDF Generation Error:', error);
//         res.status(500).json({ success: false, message: 'Failed to generate PDF', error: error.message });
//     }
// };
