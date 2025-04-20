import "./App.css";
import Header from "./components/header";
import data from "./assets/data/Electric_Vehicle_Population_Data.json";
import Dashboard from "./components/Dashboard";
import { DarkModeProvider } from "./context/DarkModeContext";

function App() {
  return (
    <DarkModeProvider>
      <div className="min-h-screen transition-colors duration-300 dark:bg-gray-900 dark:text-white">
        <Header />
        <Dashboard data={data} />
      </div>
    </DarkModeProvider>
  );
}

export default App;
