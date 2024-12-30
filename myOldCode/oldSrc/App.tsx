import LotDrawer from "./Components/LotDrawer/LotDrawer";
import Title from "./Components/Title/Title";
//import FortuneTeller from "./Components/FortuneTeller";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <Title />
      <LotDrawer />
      {/* <FortuneTeller /> */}
    </div>
  );
}

export default App;
