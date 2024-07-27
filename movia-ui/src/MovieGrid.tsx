import './App.css';
import {useState} from "react";
import {useEffect} from "react";
import axios from 'axios';
import {Link} from 'react-router-dom'

type Movie = {
  id: number;
  title: string;
  poster_path: string;
}

// Component 1: Movie page
const MovieGrid = () => {

  // Part 1: Initialize the list of movies as an empty Movie[] array
  const [movies, setMovies] = useState<Movie[]>([]);

  // Part 2: Initialize selected movies as an empty number[] array of movie IDs
  const [selectedMovies, setSelectedMovies] = useState<number[]>([])

  // useEffect hook, which gets a list of top 20 movies one time when the program is rendered
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

  // usEffect hook, which prints selectedMovies every time it is updated
  // useEffect(() => {
  //   console.log(selectedMovies);
  // }, [selectedMovies]);


  // Part 3: Function to select a movie
  const toggleMovieSelection = (movieId:number) => {
    // logMovieTitle(movieId);
    setSelectedMovies((prevSelected) => {
      const isSelected = prevSelected.includes(movieId)
      const updatedSelection = isSelected 
        ? prevSelected.filter(id => id !== movieId)
        : [...prevSelected, movieId]
        return updatedSelection
    })
  }

  // Part 3.5: Helper function to print out the movie name given its ID
  const logMovieTitle = (movieId: number) => {
    const movie = movies.find(m => m.id === movieId);
    if (movie) {
      console.log(movieId, `: ${movie.title}`);
    } else {
      console.log(`No movie found with ID: ${movieId}`);
    }
  };

  // Part 4: HTML 
  return (
    <div className="container">
      <main className="Movie-grid">
        {movies.map((movie) => (
          // Each individual movie
          <div 
            key={movie.id} 
            className={`Movie-item ${selectedMovies.includes(movie.id) ? 'selected' : ''}`}
            onClick= {
              () => toggleMovieSelection(movie.id)
            }
          >
            {/* Movie poster */}
            <img
              src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
              alt={movie.title}
            />
            {/* Movie title */}
            <p>{movie.title}</p>
          </div>
        ))}
      </main>
      {/* Next button only if user selected a movie */}
      {selectedMovies.length > 0 ? (
        <Link to="/recommendations" className="Next-button">
          Next
        </Link>
      ) : (
        <span className="Next-button disabled">Next</span>
      )}
    </div>
  );
}

export default MovieGrid
