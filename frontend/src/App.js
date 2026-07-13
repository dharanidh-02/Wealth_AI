import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from './components/Signup';
import Signin from './components/Signin';
import FinancialProfile from './components/Profile'; 
import BankDetails from "./components/BankDetails";
import Homepage from "./components/Homepage";
import LandingPage from "./pages/LandingPage";  
import 'leaflet-geosearch/dist/geosearch.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<FinancialProfile />} /> 
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/bank/:bankName" element={<BankDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
