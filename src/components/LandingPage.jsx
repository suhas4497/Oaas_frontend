import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { GitLabContext } from "../context/GitLabContext";
import msalInstance from "../msalConfig";
import "./LandingPage.css";

export default function LandingPage() {
  const { accessToken, repositories } = useContext(GitLabContext);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTools, setSelectedTools] = useState({
    APM: [],
    Traceability: [],
    Logging: []
  });

  const [parameters, setParameters] = useState(["environment", "platform.kafka_bootstrap_server_config", "aipo.mongodb.username"]);
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

  const [scanResult, setScanResult] = useState(null);
  
  // Azure integration state
  const [azureInitialized, setAzureInitialized] = useState(false);
  const [azureAccessToken, setAzureAccessToken] = useState('');
  const [azureMemberId, setAzureMemberId] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [azureProjects, setAzureProjects] = useState([]);
  const [selectedAzureProject, setSelectedAzureProject] = useState(null);
  const [azureLoggedIn, setAzureLoggedIn] = useState(false);
  const [showOrgInput, setShowOrgInput] = useState(false);
  
  // Add a new state to track which auth method is active
  const [activeAuth, setActiveAuth] = useState(null); // Can be 'gitlab', 'azure', or null

  // Initialize MSAL when component mounts
  useEffect(() => {
    const initializeMsal = async () => {
      try {
        await msalInstance.initialize();
        setAzureInitialized(true);
      } catch (error) {
        console.error('MSAL initialization failed:', error);
      }
    };
    initializeMsal();
    
    // Set active auth based on existing tokens
    if (accessToken) {
      setActiveAuth('gitlab');
    } else if (azureLoggedIn) {
      setActiveAuth('azure');
    }
  }, [accessToken, azureLoggedIn]);

  // Update the GitLab auth click to set the active auth
  const handleGitLabLogin = () => {
    setActiveAuth('gitlab');
    // The actual login happens via the href redirect
  };

  const handleAzureLogin = async () => {
    if (!azureInitialized) {
      console.error('MSAL is not initialized yet');
      return;
    }
    try {
      setActiveAuth('azure');
      const loginRequest = {
        scopes: [
          "openid",
          "profile",
          "email",
          "499b84ac-1321-427f-aa17-267ca6975798/.default" // Request Azure DevOps permissions
        ]
      };
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      console.log('Azure login successful:', loginResponse);
      setAzureAccessToken(loginResponse.accessToken);
      const memberId = loginResponse.idTokenClaims?.oid;
      setAzureMemberId(memberId);
      setAzureLoggedIn(true);
      setShowOrgInput(true);
    } catch (error) {
      console.error('Azure login failed:', error);
      setActiveAuth(null); // Reset if login fails
    }
  };

  // Add a logout function to switch between auth methods
  const handleLogout = () => {
    if (activeAuth === 'azure') {
      // Logout from Azure
      msalInstance.logout();
      setAzureLoggedIn(false);
      setAzureAccessToken('');
      setAzureMemberId('');
      setAzureProjects([]);
      setSelectedAzureProject(null);
      setShowOrgInput(false);
      
    }
    // For GitLab, you would need to implement a proper logout mechanism
    // This might require changes to your GitLabContext
    setScanResult(null)
    setActiveAuth(null);
  };

  const handleFetchAzureProjects = async () => {
    if (!organizationName) {
      alert('Organization name is required');
      return;
    }
    if (!azureAccessToken) {
      alert('Access token not available');
      return;
    }
    try {
      const response = await axios.get(
        `https://dev.azure.com/${organizationName}/_apis/projects?api-version=7.1`,
        {
          headers: {
            Authorization: `Bearer ${azureAccessToken}`,
          },
        }
      );
      setAzureProjects(response.data.value);
      setShowOrgInput(false);
    } catch (error) {
      console.error('Error fetching Azure projects:', error);
      alert('Error fetching projects. Please check the organization name and try again.');
    }
  };

  const handleAzureProjectChange = (event) => {
    const selected = azureProjects.find(project => project.id === event.target.value);
    setSelectedAzureProject(selected);
  };

  const handleScanAzure = async () => {
    if (!selectedAzureProject) {
      alert('Please select a project to scan.');
      return;
    }

    try {
      console.log('Organization name:', organizationName);
      console.log('Azure URL:', `https://dev.azure.com/${organizationName}`);
      console.log('Project name:', selectedAzureProject.name);
      
      const response = await axios.post('http://localhost:8080/oaas/v1/api/azure/repository/scan', {
        azureUrl: `https://dev.azure.com/${organizationName}`,
        apiToken: azureAccessToken,
        projectId: selectedAzureProject.name,
        keywords: parameters
      });

      setScanResult(response.data);
    } catch (error) {
      console.error('Error scanning Azure repository:', error);
      alert('Error scanning repository. Please try again. Details: ' + (error.response?.data?.message || error.message));
    }
  };

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
    if (!selectedProject) {
      alert('Please select a project to scan.');
      return;
    }

    try {
      const selectedRepo = repositories.find(repo => repo.id === parseInt(selectedProject));
      const response = await axios.post(import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080/oaas/v1/api/gitlab/repository/scan', {
        gitlabUrl: 'https://gitlab.com/api/v4',
        apiToken: accessToken,
        projectId: selectedRepo.id,
        keywords: parameters
      });

      setScanResult(response.data);
    } catch (error) {
      console.error('Error scanning repository:', error);
      alert('Error scanning repository. Please try again. Details: ' + (error.response?.data?.message || error.message));
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
      <div className="git-repo-scanner">
        <h2>Repository Scanner</h2>
        <p>
          The Repository Scanner allows you to scan your repositories for vulnerabilities, outdated dependencies, and other potential issues. By integrating with popular tools and services, it provides comprehensive insights into the health and security of your codebase.
        </p>
      </div>

       {/* Content section - only visible when logged in */}
       {activeAuth && (
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
        )}
        
      <div className="full-page">
        {/* Authentication section - always visible */}
        <div className="git-repo-auth">
          <div className="auth-buttons">
            {/* Show login options only if no auth is active */}
            {!activeAuth && (
              <>
                {/* GitLab Login Button */}
                <a 
                  href={gitlabAuthUrl} 
                  className="gitlab-button" 
                  onClick={handleGitLabLogin}
                >
                  Login with GitLab
                </a>
                
                {/* Azure Login Button */}
                <button 
                  className="azure-button" 
                  onClick={handleAzureLogin} 
                  disabled={!azureInitialized}
                >
                  {azureInitialized ? 'Login with Azure' : 'Initializing Azure...'}
                </button>
              </>
            )}
            
            {/* Show logout option if an auth method is active */}
            {activeAuth && (
              <button className="logout-button" onClick={handleLogout}>
                Logout from {activeAuth === 'azure' ? 'Azure' : 'GitLab'}
              </button>
            )}
          </div>

          {/* GitLab Project Selector (show when authenticated with GitLab) */}
          {activeAuth === 'gitlab' && (
            <div className="select-scan-container">
              <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
                <option value="">Select a GitLab project</option>
                {repositories.map(repo => (
                  <option key={repo.id} value={repo.id}>{repo.name}</option>
                ))}
              </select>
              <button onClick={handleScanGithub}>Scan GitLab</button>
            </div>
          )}
          
          {/* Azure Project UI (show when authenticated with Azure) */}
          {activeAuth === 'azure' && showOrgInput && (
            <div className="azure-org-input">
              <input
                type="text"
                placeholder="Enter Azure organization name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
              <button onClick={handleFetchAzureProjects}>Fetch Projects</button>
            </div>
          )}
          
          {activeAuth === 'azure' && !showOrgInput && azureProjects.length > 0 && (
            <div className="azure-project-selector">
              <select onChange={handleAzureProjectChange}>
                <option value="">Select an Azure project</option>
                {azureProjects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              {selectedAzureProject && (
                <button onClick={handleScanAzure}>Scan Azure</button>
              )}
            </div>
          )}
        </div>

       

        {/* Scan results section - only visible after scanning */}
        {scanResult && (
          <div className="scan-result">
            <h3>Scan Results</h3>
            <p>Total YAML files scanned: {scanResult.totalItemsScanned}</p>
            <p>Valid items found: {scanResult.totalValidItems}</p>
            <ul>
              {scanResult.validItems.length === 0 ? (
                <li>No valid items found</li>
              ) : (
                scanResult.validItems.map((item, index) => (
                  <li key={index} className="scan-result-item">
                    <ul>
                      {Object.entries(item).map(([key, value]) => (
                        <li key={key}><strong>{key}:</strong> {value}</li>
                      ))}
                    </ul>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}