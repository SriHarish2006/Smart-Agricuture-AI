import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Weather from "./pages/Weather";
import Disease from "./pages/Disease";
import Chatbot from "./pages/Chatbot";
import History from "./pages/History";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/disease" element={<Disease />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/history" element={<History />} />
      </Route>
    </Routes>
  );
}
