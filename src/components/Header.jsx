import React from "react";
import Logo from "../assets/Ascendion_Primary_Logo.jpg"
import "./global.css"

const Header = () => {
    return (
      <header className="header">
        <img 
          src={Logo} 
          alt="Logo" 
          className="logo" 
        />
      </header>
    );
  };
  
  export default Header;    

