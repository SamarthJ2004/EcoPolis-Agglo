import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MapComponent from './Pages/MapComponent';

const App = () => {
  return (
    <div className="App">
      <Router>
      {/* <Navbar /> */}
      <div className="">
          <Routes>
            {/* <Route path="/" element={<HomePage />} /> */}
            {/* <Route path="/login" element={<LoginPage />} /> */}
            <Route path="/map" element={<MapComponent />} />
          </Routes>
      </div>
      </Router>
      {/* <Footer /> */}
    </div>
  )
}

export default App;