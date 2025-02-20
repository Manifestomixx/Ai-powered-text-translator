import React from "react";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LayoutWrapper from './layouts/LayoutWrapper.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LayoutWrapper>
      <App />
    </LayoutWrapper>
  </StrictMode>,
)
