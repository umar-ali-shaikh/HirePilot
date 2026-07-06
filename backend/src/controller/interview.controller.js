const pdfParse = require("pdf-parse");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service");
const interviewReportModel = require("../models/interveiwReport.model");
const { application } = require("express");

/**
 * @route   POST /api/interview
 * @desc    Generate Interview Report
 * @access  Private
 */
async function generateInterviewReportController(req, res, next) {
    try {
        const resumeContent = await (
            new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))
        ).getText();

        const { selfDescription, jobDescription } = req.body;

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
        });

        // Fix preparation plan if AI returns string
        let preparationPlan = interviewReportByAi.preparationPlan;

        if (typeof preparationPlan === "string") {
            try {
                preparationPlan = JSON.parse(preparationPlan);
            } catch {
                preparationPlan = [
                    {
                        day: 1,
                        focus: "AI Generated Plan",
                        tasks: [interviewReportByAi.preparationPlan],
                    },
                ];
            }
        }

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            ...interviewReportByAi,
            preparationPlan,
        });

        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport,
        });
    } catch (err) {
        next(err);
    }
}

/**
 * @route   GET /api/interview/report/:interviewId
 * @desc    Get Interview Report By Id
 * @access  Private
 */
async function generateInterviewReportByIdController(req, res, next) {
    try {
        const { interviewId } = req.params;

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id,
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found.",
            });
        }

        return res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport,
        });
    } catch (err) {
        next(err);
    }
}

/**
 * @route   GET /api/interview
 * @desc    Get All Interview Reports
 * @access  Private
 */
async function getAllInterviewReportController(req, res, next) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select(
                "-resume -selfDescription -jobDescription -technicalQuestion -behavioralQuestion -skillGap -preparationPlan -__v"
            );

        return res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports,
        });
    } catch (err) {
        next(err);
    }
}

/**
 * @route   GET /api/interview
 * @desc    Get All Interview Reports
 * @access  Private
 */

async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params;

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport;

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition":`attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

module.exports = {
    generateInterviewReportController,
    generateInterviewReportByIdController,
    getAllInterviewReportController,
    generateResumePdfController
};