import React, { useState, useRef, useEffect } from "react";
import "../style/home.scss";
import { useInterview } from "../hook/useInterview";
import { useNavigate } from "react-router";

const Home = () => {
  const { loading, generateReport, reports, getReports } = useInterview();
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const resumeInputRef = useRef();

  const navigate = useNavigate();

  const handleGenerateReport = async () => {
    const resumeFile = resumeInputRef.current.files[0];
    const data = await generateReport({
      jobDescription,
      selfDescription,
      resumeFile,
    });
    navigate(`/interview/${data._id}`);
  };
  useEffect(() => {
    getReports();
  }, []);
  if (loading) {
    return (
      <main className="loading-screen">
        <h1>Loading your interview plan...</h1>
      </main>
    );
  }
  return (
    <main className="home">
      <div className="interview-input-group">
        <div className="left">
          <label htmlFor="jobDescription">Job Description</label>
          <textarea
            onChange={(e) => {
              setJobDescription(e.target.value);
            }}
            name="jobDescription"
            id="jobDescription"
            placeholder="Enter job description here..."
          ></textarea>
        </div>
        <div className="right">
          <div className="input-group">
            <p>
              Resume{" "}
              <small className="highlight">
                (Use Resume and Self description together for the best results)
              </small>
            </p>
            <label className="file-label" htmlFor="resume">
              Upload Resume
            </label>
            <input
              ref={resumeInputRef}
              hidden
              type="file"
              name="resume"
              id="resume"
              accept=".pdf"
            />
          </div>
          <div className="input-group">
            <label htmlFor="selfDescription">Self Description</label>
            <textarea
              onChange={(e) => {
                setSelfDescription(e.target.value);
              }}
              name="selfDescription"
              id="selfDescription"
              placeholder="Describe yourself in"
            />
          </div>
          <button
            onClick={handleGenerateReport}
            className="button primary-button generate-btn"
          >
            Generate My Interview Strategy
          </button>
        </div>
      </div>

      {/* Recent Reports List */}
      {reports.length > 0 && (
        <section className="recent-reports">
          <h2>My Recent Interview Plans</h2>
          <ul className="reports-list">
            {reports.map((report) => (
              <li
                key={report._id}
                className="report-item"
                onClick={() => navigate(`/interview/${report._id}`)}
              >
                <h3>{report.title || "Untitled Position"}</h3>
                <p className="report-meta">
                  Generated on {new Date(report.createdAt).toLocaleDateString()}
                </p>
                <p
                  className={`match-score ${report.matchScore >= 80 ? "score--high" : report.matchScore >= 60 ? "score--mid" : "score--low"}`}
                >
                  Match Score: {report.matchScore}%
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Page Footer */}
      <footer className="page-footer">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Help Center</a>
      </footer>
    </main>
  );
};

export default Home;
