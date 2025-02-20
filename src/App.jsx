import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AiInterface from "./components/AiInterface";
import CoverPage from "./components/CoverPage";

const App = () => {
  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<AiInterface/>}/>
      <Route path="/cover" element={<CoverPage/>}/>
    </Routes>
    </BrowserRouter>
    </>
  );
};

export default App;
