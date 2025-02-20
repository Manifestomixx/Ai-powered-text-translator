import React from 'react'
import { matchPath } from "react-router-dom";


const LayoutWrapper = ({children}) => {
    const pathname = location?.pathname;

    const definedRoutes = [
      "/",
      "/cover",
    ];
  
    const isKnownRoute = definedRoutes.some((route) =>
    matchPath(route, pathname) 
    );
  
  
  return (
    <div className="2xl:container w-[100%] mx-auto h-auto min-h-[100vh] relative">
      {children}
    </div>
  )
}

export default LayoutWrapper