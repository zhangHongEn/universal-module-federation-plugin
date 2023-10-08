import React from "react";
import ReactDom from "react-dom";
import * as remixRouter from "@remix-run/router"
console.log("remixRouter", remixRouter)

const App = () => {
  return (
    <div style={{
      margin: "10px",
      padding:"10px",
      textAlign:"center",
      backgroundColor:"cyan"
    }}>
      <h1>{process.env.NODE_ENV === "development" && "local"} MF App 01 <span style={{fontSize: 24}}>react version: {React.version}</span></h1>
    </div>
  )
}

export default App;

