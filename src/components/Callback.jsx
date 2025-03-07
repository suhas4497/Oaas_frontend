import React, { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GitLabContext } from '../context/GitLabContext';
import './Callback.css'; // Import the CSS file for styling

const Callback = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const navigate = useNavigate();
  const { setAccessToken, setUserDetails, setRepositories } = useContext(GitLabContext);

  useEffect(() => {
    const fetchGitLabData = async () => {
      try {
        // Exchange code for access token
        const tokenResponse = await axios.post('https://gitlab.com/oauth/token', null, {
          params: {
            client_id: import.meta.env.VITE_GITLAB_CLIENT_ID,
            client_secret: import.meta.env.VITE_GITLAB_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: import.meta.env.VITE_GITLAB_REDIRECT_URI,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        const token = tokenResponse.data.access_token;
        setAccessToken(token);

        // Fetch user details
        const userResponse = await axios.get('https://gitlab.com/api/v4/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = userResponse.data;
        setUserDetails(user);

        // Fetch user repositories
        const reposResponse = await axios.get('https://gitlab.com/api/v4/projects', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            owned: true,
          },
        });

        const repos = reposResponse.data;
        setRepositories(repos);

        // Redirect back to the base page
        navigate('/');
      } catch (error) {
        console.error('Error fetching GitLab data:', error);
      }
    };

    if (code) {
      fetchGitLabData();
    }
  }, [code, setAccessToken, setUserDetails, setRepositories, navigate]);

  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
};

export default Callback;