import { useState } from "react";
import axios from "axios";
import "./LandingPage.css";

export default function LandingPage() {
  const [selectedTools, setSelectedTools] = useState({
    APM: [],
    Traceability: [],
    Logging: []
  });

  const [parameters, setParameters] = useState([]);
  const [checkboxStatus, setCheckboxStatus] = useState({
    APM: false,
    Traceability: false,
    Logging: false
  });

  const [dropdownValues, setDropdownValues] = useState({
    APM: "",
    Traceability: "",
    Logging: ""
  });

  const [scanResult, setScanResult] = useState({
    totalItemsScanned: 0,
    totalValidItems: 0,
    validItems: []
  });

  const observabilityOptions = {
    APM: {
      Prometheus: ["scrape_interval", "scrape_timeout", "metrics_path", "job_name"],
      Dynatrace: ["DT_TAGS", "DT_CLUSTER_ID", "DT_LOGLEVEL", "DT_CUSTOM_PROP"],
      DataDog: ["DD_TRACE_ENABLED", "DD_ENV", "DD_SERVICE", "DD_VERSION", "DD_TAGS"],
      AppDynamics: ["APPDYNAMICS_CONTROLLER_HOST_NAME", "APPDYNAMICS_CONTROLLER_PORT", "APPDYNAMICS_AGENT_APPLICATION_NAME", "APPDYNAMICS_AGENT_TIER_NAME", "APPDYNAMICS_AGENT_NODE_NAME"],
      All: ["scrape_interval", "scrape_timeout", "metrics_path", "job_name", "DT_TAGS", "DT_CLUSTER_ID", "DT_LOGLEVEL", "DT_CUSTOM_PROP", "DD_TRACE_ENABLED", "DD_ENV", "DD_SERVICE", "DD_VERSION", "DD_TAGS", "APPDYNAMICS_CONTROLLER_HOST_NAME", "APPDYNAMICS_CONTROLLER_PORT", "APPDYNAMICS_AGENT_APPLICATION_NAME", "APPDYNAMICS_AGENT_TIER_NAME", "APPDYNAMICS_AGENT_NODE_NAME"]
    },
    Traceability: {
      Dynatrace: ["DT_XTRACE", "DT_TRACE_CONFIG", "DT_ENABLED"],
      DataDog: ["DD_TRACE_AGENT_URL", "DD_TRACE_SAMPLE_RATE", "DD_TRACE_HEADER_TAGS", "DD_TRACE_ANALYTICS_ENABLED"],
      AppDynamics: ["APPDYNAMICS_HTTP_ENABLED", "APPDYNAMICS_CORRELATION_ENABLED", "APPDYNAMICS_TRANSACTION_MATCH", "APPDYNAMICS_ANALYTICS_AGENT_URL"],
      Prometheus: ["remote_write", "relabel_configs"],
      All: ["DT_XTRACE", "DT_TRACE_CONFIG", "DT_ENABLED", "DD_TRACE_AGENT_URL", "DD_TRACE_SAMPLE_RATE", "DD_TRACE_HEADER_TAGS", "DD_TRACE_ANALYTICS_ENABLED", "APPDYNAMICS_HTTP_ENABLED", "APPDYNAMICS_CORRELATION_ENABLED", "APPDYNAMICS_TRANSACTION_MATCH", "APPDYNAMICS_ANALYTICS_AGENT_URL", "remote_write", "relabel_configs"]
    },
    Logging: {
      Dynatrace: ["DT_LOG_PATH", "DT_LOG_CONTENT_ACCESS"],
      DataDog: ["DD_LOGS_ENABLED", "DD_LOG_LEVEL", "DD_LOGS_CONFIG_PATH", "DD_LOGS_BACKEND"],
      AppDynamics: ["APPDYNAMICS_LOG_DIR", "APPDYNAMICS_LOG_LEVEL", "APPDYNAMICS_LOG_MAX_SIZE", "APPDYNAMICS_LOG_MAX_BACKUPS"],
      Prometheus: ["log.level", "log.format", "alerting_rules"],
      All: ["DT_LOG_PATH", "DT_LOG_CONTENT_ACCESS", "DD_LOGS_ENABLED", "DD_LOG_LEVEL", "DD_LOGS_CONFIG_PATH", "DD_LOGS_BACKEND", "APPDYNAMICS_LOG_DIR", "APPDYNAMICS_LOG_LEVEL", "APPDYNAMICS_LOG_MAX_SIZE", "APPDYNAMICS_LOG_MAX_BACKUPS", "log.level", "log.format", "alerting_rules"]
    }
  };

  const handleSelectChange = (category, tool) => {
    if (tool === "") return;

    setSelectedTools((prev) => {
      if (prev[category].includes(tool) || (tool !== "All" && prev[category].includes("All"))) {
        return prev; // Tool is already selected or "All" is selected, do nothing
      }
      const updatedTools = tool === "All" ? ["All"] : [...prev[category], tool];
      return { ...prev, [category]: updatedTools };
    });

    setParameters((prev) => {
      if (tool === "All") {
        return [...new Set([...prev, ...observabilityOptions[category][tool]])];
      }
      return [...new Set([...prev, ...observabilityOptions[category][tool]])];
    });

    // Reset the dropdown value
    setDropdownValues((prev) => ({ ...prev, [category]: "" }));
  };

  const handleRemoveTool = (category, tool) => {
    setSelectedTools((prev) => {
      const updatedTools = prev[category].filter((t) => t !== tool);
      return { ...prev, [category]: updatedTools };
    });
    setParameters((prev) => prev.filter(param => !observabilityOptions[category][tool].includes(param)));
  };

  const handleCheckboxChange = (category) => {
    setCheckboxStatus((prev) => ({ ...prev, [category]: !prev[category] }));
    if (checkboxStatus[category]) {
      setSelectedTools((prev) => ({ ...prev, [category]: [] }));
      setParameters((prev) => prev.filter(param => !selectedTools[category].some(tool => observabilityOptions[category][tool].includes(param))));
    }
  };

  const handleScanGithub = async () => {
    try {
      const response = await axios.post('http://localhost:8080/oaas/v1/api/repository/scan', parameters);
      console.log('Scan response:', response.data);
      setScanResult(response.data);
    } catch (error) {
      console.error('Error scanning repository:', error);
    }
  };

  const gitlabAuthUrl = `https://gitlab.com/oauth/authorize?client_id=${import.meta.env.VITE_GITLAB_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_GITLAB_REDIRECT_URI}&response_type=code&scope=read_user+api`;

  return (
    <div className="container">
      <div className="intro">
        <h2>OBSERVABILITY AS A SERVICE</h2>
        <p>
          Observability as a Service provides a unified approach to monitoring application performance, tracing request flows, and managing logs across distributed systems. It enables organizations to integrate tools like Prometheus, Dynatrace, DataDog, and AppDynamics to track application health, detect anomalies, and optimize system performance. By leveraging Application Performance Monitoring (APM), distributed tracing, and centralized logging, users can gain real-time insights, improve troubleshooting, and enhance system reliability. This service allows dynamic tool selection and parameter configuration, ensuring comprehensive observability for modern applications.
        </p>
      </div>
      <div className="full-page">
        <div className="git-repo-scanner">
          <h2>Git Repository Scanner</h2>
          <p>
            The Git Repository Scanner allows you to scan your repositories for vulnerabilities, outdated dependencies, and other potential issues. By integrating with popular tools and services, it provides comprehensive insights into the health and security of your codebase.
          </p>
          <a href={gitlabAuthUrl}>Login with GitLab</a>
        </div>
        <div className="content">
          <div className="sidebar">
            <div className="options-container">
              {Object.keys(observabilityOptions).map((category) => (
                <div key={category} className="option-group">
                  <div className="option-group-header">
                    <input
                      type="checkbox"
                      id={category}
                      checked={checkboxStatus[category]}
                      onChange={() => handleCheckboxChange(category)}
                    />
                    <label htmlFor={category}>{category}</label>
                  </div>
                  {checkboxStatus[category] && (
                    <>
                      <select
                        value={dropdownValues[category]}
                        onChange={(e) => handleSelectChange(category, e.target.value)}
                        disabled={!checkboxStatus[category] || selectedTools[category].includes("All")}
                      >
                        <option value="">Select a tool</option>
                        {Object.keys(observabilityOptions[category]).map((tool) => (
                          <option key={tool} value={tool}>{tool}</option>
                        ))}
                      </select>
                      <div className="selected-tools">
                        {selectedTools[category].map((tool) => (
                          <div key={tool} className="selected-tool">
                            {tool}
                            <button className="remove-button" onClick={() => handleRemoveTool(category, tool)}>-</button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="main-content">
            <div className="parameters-container">
              <h3>Selected Parameters</h3>
              <ul>
                {parameters.length === 0 ? (
                  <li>No parameters selected</li>
                ) : (
                  parameters.map((param, index) => (
                    <li key={index}>{param}</li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
        <div className="scan-result">
          <h3>Scan Results</h3>
          <p>Total YAML files scanned : {scanResult.totalItemsScanned}</p>
          <p>Valid items found : {scanResult.totalValidItems}</p>
          <ul>
            {scanResult.validItems.length === 0 ? (
              <li>No valid items found</li>
            ) : (
              scanResult.validItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))
            )}
          </ul>
        </div>
        <div className="scan-button-container">
          <button onClick={handleScanGithub}>Scan Github</button>
        </div>
      </div>
    </div>
  );
}