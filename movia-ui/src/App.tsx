import './App.css';
import {useState} from "react";
import {useEffect} from "react";
import axios from 'axios';

type Movie = {
  id: number;
  title: string;
  poster_path: string;
}

const App = () => {

  // Part 1: Initialize the list of movies as an empty Movie[] array
  const [movies, setMovies] = useState<Movie[]>([]);

  // useEffect hook, which runs only once when the program is rendered
  useEffect(() => {
    const fetchMovies = async () => {
      try {

        // console.log('API Key:', ${process.env.REACT_APP_TMDB_API_KEY});
        console.log('API Key:', process.env.REACT_APP_TMDB_API_KEY);

        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.REACT_APP_TMDB_API_KEY}`
        );
        setMovies(response.data.results.slice(0, 10));
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Movia</h1>
      </header>
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
    </div>
  );
}

export default App;
