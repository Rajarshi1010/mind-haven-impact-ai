import Login from "./components/login";
import Create from "./components/create";
import Welcome from "./components/welcome";
import Support from './components/support';
import Settings from "./components/settings";
import Chatbot from "./components/chatbot";
import Forgot from "./components/forgot";
import { Routes, Route } from "react-router-dom";
import "./styles/login.css";
import "./styles/sidebar.css";
import "./styles/chatbot.css";
import "./styles/support.css";
import "./styles/settings.css";
import "./styles/welcome.css";
import "./styles/forgot.css";
// import 


function App(){
  return (
    <div className="App">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
      </head>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/chat" element={<Chatbot />}/>
        <Route path="/create" element={<Create />} />
        <Route path="/login" element={<Login />} />
        <Route path="/support" element={<Support />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/forgot" element={<Forgot />} />
      </Routes>
    </div>
  )
}

export default App;
