import './App.css';
import {useState} from "react";
import {useEffect} from "react";
import axios from 'axios';
import {BrowserRouter as Router} from 'react-router-dom'
import {Routes} from 'react-router-dom'
import {Route} from 'react-router-dom'
import {Link} from 'react-router-dom'
import {Navigate} from 'react-router-dom'

// Reference: https://developer.themoviedb.org/reference/movie-images

type Movie = {
  id: number;
  title: string;
  poster_path: string;
}

// Component 1: Movie page
const MovieGrid = () => {

  // Part 1: Initialize the list of movies as an empty Movie[] array
  const [movies, setMovies] = useState<Movie[]>([]);

  // useEffect hook, which runs only once when the program is rendered
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // TMDB API call to get popular movies
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.REACT_APP_TMDB_API_KEY}`
        );
        setMovies(response.data.results);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };
    fetchMovies();
  }, []);

  // Part 2: HTML 
  return (
    <main className="Movie-grid">
      {movies.map((movie) => (
        <div key={movie.id} className="Movie-item">
          <img
            src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
            alt={movie.title}
          />
          <p>{movie.title}</p>
        </div>
      ))}
    </main>
  );
}

// Component 2: Recommendations Page (TODO: Change to have actual code)
const Recommendations = () => {
  return (
    <h2>Recommendations Page</h2>
  )
}

// Component 3: Main application
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
      {/* Part 4: Clickable link in the application */}
      <Link to="/recommendations" className="Next-button">
        Next
      </Link>
    </Router>
  )
}

export default App;
