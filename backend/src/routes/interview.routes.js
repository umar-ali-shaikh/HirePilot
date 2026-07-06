const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/file.middleware");

const {
    generateInterviewReportController,
    getAllInterviewReportController,
    generateInterviewReportByIdController,
    generateResumePdfController,
} = require("../controller/interview.controller");

const interviewRouter = express.Router();

/**
 * ==========================================================
 * Interview Report Routes
 * ==========================================================
 */

/**
 * @route   POST /api/interview
 * @desc    Generate a new AI interview report
 * @access  Private
 */
interviewRouter.post(
    "/",
    authMiddleware.authUser,
    upload.single("resume"),
    generateInterviewReportController
);

/**
 * @route   GET /api/interview
 * @desc    Get all interview reports of logged-in user
 * @access  Private
 */
interviewRouter.get(
    "/",
    authMiddleware.authUser,
    getAllInterviewReportController
);

/**
 * @route   GET /api/interview/report/:interviewId
 * @desc    Get interview report by ID
 * @access  Private
 */
interviewRouter.get(
    "/report/:interviewId",
    authMiddleware.authUser,
    generateInterviewReportByIdController
);

/**
 * ==========================================================
 * Resume Routes
 * ==========================================================
 */

/**
 * @route   GET /api/interview/resume/pdf/:interviewReportId
 * @desc    Generate ATS Resume PDF from Interview Report
 * @access  Private
 */
interviewRouter.get(
    "/resume/pdf/:interviewReportId",
    authMiddleware.authUser,
    generateResumePdfController
);

module.exports = interviewRouter;