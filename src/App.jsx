
import './App.css';
import Sidebar from './layouts/Sidebar';
import Navbar from './layouts/Navbar';
import Footer from './layouts/Footer';
import Dashboard from './layouts/Dashboard';
function App() {
  return (
    <div className= "min-h-screen  bg-white">
      <Sidebar />
      <Navbar />
      <Dashboard />
      <Footer />
    </div>
  );
}
export default App;