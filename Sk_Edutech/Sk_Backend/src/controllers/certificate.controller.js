import certificateModel from '../models/certificate.model.js';
import Student_DetaisModel from '../models/Student/Student_Detais.model.js';
import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { join } from 'path';

// Request a certificate
export const requestCertificate = async (req, res) => {
    try {
        const { studentId, courseId } = req.body;
        
        // First check if student exists
        const student = await Student_DetaisModel.findOne({ studentId: studentId });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Check if certificate request already exists
        const existingRequest = await certificateModel.findOne({
            studentId,
            courseId,
            status: { $in: ['pending', 'approved'] }
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'Certificate request already exists for this student and course'
            });
        }

        const certificate = new certificateModel({
            studentId,
            courseId
        });

        await certificate.save();

        res.status(201).json({
            success: true,
            data: certificate
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Bulk request certificates
export const bulkRequestCertificates = async (req, res) => {
    try {
        const { requests } = req.body; // Array of {studentId, courseId}
        
        const certificates = [];
        const errors = [];

        for (const request of requests) {
            try {
                // First check if student exists
                const student = await Student_DetaisModel.findOne({ studentId: request.studentId });
                if (!student) {
                    errors.push(`Student ${request.studentId} not found`);
                    continue;
                }

                const existingRequest = await certificateModel.findOne({
                    studentId: request.studentId,
                    courseId: request.courseId,
                    status: { $in: ['pending', 'approved'] }
                });

                if (!existingRequest) {
                    const certificate = new certificateModel({
                        studentId: request.studentId,
                        courseId: request.courseId
                    });
                    await certificate.save();
                    certificates.push(certificate);
                } else {
                    errors.push(`Request already exists for student ${request.studentId}`);
                }
            } catch (error) {
                errors.push(`Error processing request for student ${request.studentId}: ${error.message}`);
            }
        }

        res.status(200).json({
            success: true,
            data: {
                certificates,
                errors
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all certificate requests with filters
export const getCertificates = async (req, res) => {
    try {
        const {
            status,
            courseId,
            search,
            page = 1,
            limit = 10
        } = req.query;

        const query = {};
        
        if (status) query.status = status;
        if (courseId) query.courseId = courseId;
        if (search) {
            query.$or = [
                { studentId: { $regex: search, $options: 'i' } }
            ];
        }

        const certificates = await Certificate.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        // Get student details for each certificate
        const certificatesWithStudents = await Promise.all(certificates.map(async (cert) => {
            const student = await Student_DetaisModel.findOne({ studentId: cert.studentId });
            return {
                ...cert.toObject(),
                student: student ? {
                    name: student.name,
                    course: student.course,
                    enrollmentDate: student.enrollmentDate
                } : null
            };
        }));

        const total = await certificateModel.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                certificates: certificatesWithStudents,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update certificate status (approve/reject)
export const updateCertificateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks, adminId } = req.body;

        const certificate = await certificateModel.findById(id);
        
        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate request not found'
            });
        }

        certificate.status = status;
        certificate.remarks = remarks;
        certificate.approvedBy = adminId;
        
        if (status === 'approved') {
            certificate.approvalDate = new Date();
        }

        await certificate.save();

        res.status(200).json({
            success: true,
            data: certificate
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Generate certificate PDF
export const generateCertificatePDF = async (req, res) => {
    try {
        const { id } = req.params;
        
        const certificate = await certificateModel.findById(id);
        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        const student = await Student_DetaisModel.findOne({ studentId: certificate.studentId });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        if (certificate.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Certificate is not approved'
            });
        }

        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4'
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificate._id}.pdf`);

        // Pipe the PDF directly to the response
        doc.pipe(res);

        // Add certificate content
        doc.fontSize(25).text('Certificate of Completion', { align: 'center' });
        doc.moveDown();
        doc.fontSize(15).text(`Certificate Number: ${certificate._id}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(20).text(`This is to certify that`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(30).text(student.name, { align: 'center' });
        doc.moveDown();
        doc.fontSize(20).text(`has successfully completed the course`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(25).text(student.course, { align: 'center' });
        doc.moveDown();
        doc.fontSize(15).text(`Date of Issue: ${certificate.approvalDate.toLocaleDateString()}`, { align: 'center' });

        // Finalize the PDF
        doc.end();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
