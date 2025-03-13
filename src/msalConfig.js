import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "2e41a609-06e8-492a-a724-aedc8ed7980e", // Replace with your client ID
    authority: "https://login.microsoftonline.com/34147e6d-4430-452f-aeb1-61f82347079b", // Replace with your tenant ID
    redirectUri: "http://localhost:5173", // Replace with your redirect URI
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

export default msalInstance;