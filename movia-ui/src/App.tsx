import './App.css';
// import {useState} from "react";
// import {useEffect} from "react";
// import axios from 'axios';
import {BrowserRouter as Router} from 'react-router-dom'
import {Routes} from 'react-router-dom'
import {Route} from 'react-router-dom'
// import {Link} from 'react-router-dom'
import {Navigate} from 'react-router-dom'

// Reference: https://developer.themoviedb.org/reference/movie-images

// Component 1: Imports
import MovieGrid from './MovieGrid'
import Recommendations from './Recommendations'

// Component 2: Main application
const App = () => {
  return (
    // Part 1: Router - Main component to wrap entire application
    <Router>
      {/* Part 2: Put this header on every page */}
      <header className="App-header">
        <h1>Movia</h1>
      </header>
      {/* Part 3: Routes - Mapping a path to a component above */}
      <Routes>
        <Route path="/" element={<Navigate replace to="/select-movies" />} />
        <Route path="/select-movies" element={<MovieGrid />} />
        <Route path="recommendations" element={<Recommendations />} />
      </Routes>
    </Router>
  )
}

export default App;
