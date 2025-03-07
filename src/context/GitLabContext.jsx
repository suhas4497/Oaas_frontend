import React, { createContext, useState } from 'react';

export const GitLabContext = createContext();

export const GitLabProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [repositories, setRepositories] = useState([]);

  return (
    <GitLabContext.Provider value={{ accessToken, setAccessToken, userDetails, setUserDetails, repositories, setRepositories }}>
      {children}
    </GitLabContext.Provider>
  );
};