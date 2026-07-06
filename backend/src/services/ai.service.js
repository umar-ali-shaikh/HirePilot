const { GoogleGenAI } = require("@google/genai");
// const { default: puppeteer } = require("puppeteer");
const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");
const { z } = require("zod");
const { default: zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// ----------------------
// Zod Schema
// ----------------------

const interviewReportSchema = z.object({
    matchScore: z
        .number()
        .min(0)
        .max(100)
        .describe(
            "Overall resume and job description match percentage from 0 to 100."
        ),

    technicalQuestion: z
        .array(
            z.object({
                question: z
                    .string()
                    .describe("A technical interview question based on the candidate's skills and the job description."),

                intention: z
                    .string()
                    .describe("Explain what the interviewer wants to evaluate by asking this question."),

                answer: z
                    .string()
                    .describe("A detailed, professional sample answer suitable for an interview."),
            })
        )
        .describe("List of technical interview questions."),

    behavioralQuestion: z
        .array(
            z.object({
                question: z
                    .string()
                    .describe("A behavioral interview question related to teamwork, communication, leadership, or problem-solving."),

                intention: z
                    .string()
                    .describe("Explain what personality trait or soft skill this question is designed to assess."),

                answer: z
                    .string()
                    .describe("A strong STAR-method sample answer for this behavioral question."),
            })
        )
        .describe("List of behavioral interview questions."),

    skillGap: z
        .array(
            z.object({
                skill: z
                    .string()
                    .describe("A missing or weak skill required for the target job."),

                severity: z
                    .enum(["low", "medium", "high"])
                    .describe("Importance level of the missing skill.")
            })
        )
        .describe("List of missing skills and their importance."),

    preparationPlan: z
        .array(
            z.object({
                day: z
                    .number()
                    .describe("Preparation day number starting from 1."),

                focus: z
                    .string()
                    .describe("Main topic or objective for this day."),

                tasks: z
                    .array(
                        z.string().describe("A practical task to complete.")
                    )
                    .describe("List of tasks for the day.")
            })
        )
        .describe("A day-wise interview preparation roadmap."),

    title: z
        .string()
        .describe("A concise and professional title for the interview report.")
});
// ----------------------
// Generate Interview Report
// ----------------------

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription,
}) {

    const prompt = `
You are an expert Technical Interviewer, Senior Software Engineer and Career Coach.

Your task is to generate a complete interview preparation report.

Candidate Resume:

${resume}

--------------------------------------------------

Candidate Self Description:

${selfDescription}

--------------------------------------------------

Job Description:

${jobDescription}

--------------------------------------------------

Return ONLY valid JSON.

Do NOT write markdown.

Do NOT write explanation.

Do NOT wrap inside \`\`\`json.

Return EXACTLY this JSON structure.

{
"title": "Frontend Developer Interview Preparation Report",

  "matchScore": 90,

  "technicalQuestion": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],

  "behavioralQuestion": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],

  "skillGap": [
    {
      "skill": "",
      "severity": "low"
    }
  ],

  "preparationPlan": [
    {
      "day": 1,
      "focus": "",
      "tasks": [
        "",
        "",
        ""
      ]
    }
  ]
}

Rules

1. matchScore must be between 0-100.

2. Generate exactly 10 technicalQuestion.

3. Generate exactly 5 behavioralQuestion.

4. Generate exactly 5 skillGap.

5. Generate exactly 7 preparationPlan.

6. day must be NUMBER.

Correct

1
2
3

Wrong

Day 1
Day One

7. severity must be one of

low
medium
high

8. tasks must be array of strings.

9. Every answer should be detailed.

10. Questions must be based on Resume and Job Description.
11.
Generate a professional report title.

Example

"Frontend Developer Interview Report"

"MERN Stack Developer Interview Strategy"

"React.js Technical Interview Preparation"

Return ONLY JSON.
`;

    try {

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.2,
            },
        });

        console.log("========== RAW AI RESPONSE ==========");
        console.log(response.text);

        const parsed = JSON.parse(response.text);

        // Validate response using Zod
        const validated = interviewReportSchema.parse(parsed);

        console.log("========== VALIDATED RESPONSE ==========");
        console.log(JSON.stringify(validated, null, 2));

        return validated;

    } catch (error) {

        console.error("========== AI ERROR ==========");
        console.error(error);


        throw error;   // <-- Ye use karo


    }

}


async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
    });

    try {
        const page = await browser.newPage();

        await page.setContent(htmlContent, {
            waitUntil: "networkidle0",
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm",
            },
        });

        return pdfBuffer;
    } finally {
        await browser.close();
    }
}

// async function generateResumePdf({
//     resume,
//     selfDescription,
//     jobDescription,
// }) {

//     const resumePdfSchema = z.object({
//         html: z
//             .string()
//             .describe(`
// A complete standalone HTML resume.

// Requirements:
// - Return ONLY valid HTML.
// - Include <!DOCTYPE html>, <html>, <head>, and <body>.
// - Use modern inline CSS only (no external CSS or JavaScript).
// - Use A4 paper layout (210mm × 297mm).
// - Add professional typography, spacing, colors, and sections.
// - Make it ATS-friendly.
// - The HTML should be ready to convert directly into a PDF.

// Include these sections:
// 1. Header (Name, Email, Phone, LinkedIn, GitHub)
// 2. Professional Summary
// 3. Technical Skills
// 4. Professional Experience
// 5. Projects
// 6. Education
// 7. Certifications (if available)
// 8. Achievements (if available)

// The resume must:
// - Be tailored according to the provided Job Description.
// - Improve wording professionally.
// - Keep information truthful.
// - Highlight the most relevant skills.
// - Follow a modern one-page resume design.
// `)
//     });

//     const prompt = `Generate resume for a candidate with the following details:
//                         Resume: ${resume}
//                         Self Description: ${selfDescription}
//                         Job Description: ${jobDescription}

//                         the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
//                         The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
//                         The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
//                         you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
//                         The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
//                         The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
//                     `;

//     const response = await ai.models.generateContent({
//         model: "gemini-2.5-flash",
//         contents: prompt,
//         config: {
//             responseMimeType: "application/json",
//             responseSchema: zodToJsonSchema(resumePdfSchema)
//         },
//     });

//     const jsonContent = JSON.parse(response.text)

//     const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

//     return pdfBuffer
// }


async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription,
}) {
    try {
        const resumePdfSchema = z.object({
            html: z
                .string()
                .describe(`
A complete standalone HTML resume.

Requirements:
- Return ONLY valid HTML.
- Include <!DOCTYPE html>, <html>, <head>, and <body>.
- Use modern inline CSS only (no external CSS or JavaScript).
- Use A4 paper layout (210mm × 297mm).
- Add professional typography, spacing, colors, and sections.
- Make it ATS-friendly.
- The HTML should be ready to convert directly into a PDF.

Include these sections:
1. Header (Name, Email, Phone, LinkedIn, GitHub)
2. Professional Summary
3. Technical Skills
4. Professional Experience
5. Projects
6. Education
7. Certifications (if available)
8. Achievements (if available)

The resume must:
- Be tailored according to the provided Job Description.
- Improve wording professionally.
- Keep information truthful.
- Highlight the most relevant skills.
- Follow a modern one-page resume design.
`)
        });

        const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(resumePdfSchema)
            },
        });

        console.log("Gemini Response:", response.text);

        const jsonContent = JSON.parse(response.text);

        const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

        return pdfBuffer;

    } catch (error) {
        console.error("generateResumePdf Error:", error);
        throw error;
    }
}

module.exports = { generateInterviewReport, generateResumePdf };