import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Settings from "./pages/Setting";
import SendMessage from "./pages/SendMessage";
import Templates from "./pages/Templates";

function App() {
  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/settings" replace />}/>
          <Route path="/settings"element={<Settings />}/>
          <Route path="/send-message" element={<SendMessage />}/>
          <Route path="/templates" element={<Templates />} />
        </Routes>
      </main>
      
    </div>
  );
}

export default App;