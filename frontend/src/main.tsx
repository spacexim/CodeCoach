// frontend/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import App from "./App.tsx";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider value={defaultSystem}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
