import React from "react";
import { FpjsProvider } from "@fingerprintjs/fingerprintjs-pro-react";

import Canvas from "./Canvas";
import Login from "./Login";

import "./App.css";
import "remirror/styles/all.css";

import { Route, Routes } from "react-router-dom";
import NotFound from "./NotFound";

function Redirect() {
  window.location.href = "https://app.explain.dev/";

  return null;
}

function App() {
  return (
    <FpjsProvider
      loadOptions={{
        apiKey: "VpmDLGlD4pCjDLrS0imU",
        endpoint: "https://vid.app.explain.dev",
      }}
    >
      <Routes>
        <Route path="/" element={<Canvas new={true} />}></Route>
        <Route path="new" element={<Canvas new={true} />} />
        <Route path="e/:id" element={<Redirect />} />
        <Route path="*" element={<NotFound />} />
        <Route path="login" element={<Login />} />
      </Routes>
    </FpjsProvider>
  );
}

export default App;
