import { useContext } from "react";
import {
    generateInterviewReport,
    getInterviewReportById,
    getAllInterviewReports,
    generateResumePdf,
} from "../services/interview.api";

import { InterviewContext } from "../interview.context";

export const useInterview = () => {
    const context = useContext(InterviewContext);

    if (!context) {
        throw new Error(
            "useInterview must be used within InterviewProvider"
        );
    }

    const {
        loading,
        setLoading,
        report,
        setReport,
        reports,
        setReports,
    } = context;

    /**
     * Generate Interview Report
     */
    const generateReport = async ({
        jobDescription,
        selfDescription,
        resumeFile,
    }) => {
        setLoading(true);

        try {
            const response = await generateInterviewReport({
                jobDescription,
                selfDescription,
                resumeFile,
            });

            setReport(response.interviewReport);

            return response.interviewReport;
        } catch (err) {
            console.error("Generate Report Error:", err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Get Interview Report By Id
     */
    const getReportById = async (interviewId) => {
        setLoading(true);

        try {
            const response = await getInterviewReportById(interviewId);

            setReport(response.interviewReport);

            return response.interviewReport;
        } catch (err) {
            console.error("Get Report Error:", err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Get All Interview Reports
     */
    const getReports = async () => {
        setLoading(true);

        try {
            const response = await getAllInterviewReports();

            setReports(response.interviewReports);

            return response.interviewReports;
        } catch (err) {
            console.error("Get Reports Error:", err);
            return [];
        } finally {
            setLoading(false);
        }
    };


    /**
     * Download Resume PDF
     */
    const getResumePdf = async (interviewId) => {
        try {
            setLoading(true);

            const blob = await generateResumePdf(interviewId);

            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "resume.pdf";

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download Resume PDF Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        report,
        reports,
        generateReport,
        getReportById,
        getReports,
        getResumePdf
    };
};