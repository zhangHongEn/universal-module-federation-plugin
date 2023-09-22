import React from "react";
import ReactDom from "react-dom";

const App = () => {
  return (
    <div style={{
      margin: "10px",
      padding:"10px",
      textAlign:"center",
      backgroundColor:"cyan"
    }}>
      <h1>local MF App 01 <span style={{fontSize: 24}}>react version: {React.version}</span></h1>
    </div>
  )
}

export default App;

