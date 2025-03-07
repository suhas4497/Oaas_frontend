import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Header from './components/Header'
import LandingPage from './components/LandingPage'
import Footer from './components/Footer'
function App() {

  return (
    <>
      <Header/>
      <LandingPage/>
      <Footer/>
    </>
  )
}

export default App
