import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
});

/**
 * @description Generate Interview Report
 */
export const generateInterviewReport = async ({
    jobDescription,
    selfDescription,
    resumeFile,
}) => {
    const formData = new FormData();

    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    formData.append("resume", resumeFile);

    const response = await api.post(
        "/api/interview",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};

/**
 * @description Get All Interview Reports
 */
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview");

    return response.data;
};

/**
 * @description Get Interview Report By Id
 */
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(
        `/api/interview/report/${interviewId}`
    );

    return response.data;
};

/**
 *  @description Service to generate resume pdf based on user self description,resume, job description.
 */
export const generateResumePdf = async (interviewId) => {
    const response = await api.get(
        `/api/interview/resume/pdf/${interviewId}`,
        {
            responseType: "blob",
        }
    );

    return response.data;
};

export default api;