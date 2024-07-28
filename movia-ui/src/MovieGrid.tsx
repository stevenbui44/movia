import './App.css';
import {useState} from "react";
import {useEffect} from "react";
import axios from 'axios';
import {Link} from 'react-router-dom'

type Movie = {
  id: number;
  title: string;
  poster_path: string;
  liked: boolean;
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
          `https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.REACT_APP_TMDB_API_KEY}&page=1`
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

  // useEffect(() => {
  //   if (selectedMovies.length > 0) {
  //     // Get the last added movie ID
  //     const lastAddedMovieId = selectedMovies[selectedMovies.length - 1];
  //     const addedMovie = movies.find(movie => movie.id === lastAddedMovieId);
  //     if (addedMovie) {
  //       console.log("Added movie:", addedMovie);
  //     }
  //   } else {
  //     // If selectedMovies is empty, a movie was just removed
  //     console.log("All movies deselected");
  //   }
  // }, [selectedMovies, movies]);


  // Keywords 
  // useEffect(() => {
  //   const fetchAndLogKeywords = async (movieId: number) => {
  //     try {
  //       const response = await axios.get(
  //         `https://api.themoviedb.org/3/movie/${movieId}/keywords?api_key=${process.env.REACT_APP_TMDB_API_KEY}`
  //       );
  //       const keywords = response.data.keywords.map((keyword: { name: string }) => keyword.name);
  //       console.log(`Keywords for movie ${movieId}:`, keywords);
  //     } catch (error) {
  //       console.error('Error fetching keywords:', error);
  //     }
  //   };
  //   if (selectedMovies.length > 0) {
  //     // Get the last added movie ID
  //     const lastAddedMovieId = selectedMovies[selectedMovies.length - 1];
  //     fetchAndLogKeywords(lastAddedMovieId);
  //   } else {
  //     // If selectedMovies is empty, a movie was just removed
  //     console.log("All movies deselected");
  //   }
  // }, [selectedMovies]);


  // Similar movies 
  // useEffect(() => {
  //   const fetchAndLogSimilarMovies = async (movieId: number) => {
  //     try {
  //       const response = await axios.get(
  //         `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${process.env.REACT_APP_TMDB_API_KEY}`
  //       );
  //       const similarMovies = response.data.results.map((movie: { id: number, title: string }) => ({
  //         id: movie.id,
  //         title: movie.title
  //       }));
  //       console.log(`Similar movies for movie ${movieId}:`, similarMovies);
  //     } catch (error) {
  //       console.error('Error fetching similar movies:', error);
  //     }
  //   };
  //   if (selectedMovies.length > 0) {
  //     // Get the last added movie ID
  //     const lastAddedMovieId = selectedMovies[selectedMovies.length - 1];
  //     fetchAndLogSimilarMovies(lastAddedMovieId);
  //   } else {
  //     // If selectedMovies is empty, a movie was just removed
  //     console.log("All movies deselected");
  //   }
  // }, [selectedMovies]);

  // Movies that have one specific keyword
  // useEffect(() => {
  //   const fetchAndLogMoviesByKeyword = async (movieId: number) => {
  //     try {
  //       // First, fetch keywords for the movie
  //       const keywordsResponse = await axios.get(
  //         `https://api.themoviedb.org/3/movie/${movieId}/keywords?api_key=${process.env.REACT_APP_TMDB_API_KEY}`
  //       );
  //       if (keywordsResponse.data.keywords.length > 0) {
  //         // Take the first keyword
  //         const firstKeyword = keywordsResponse.data.keywords[0];
  //         console.log(`Using keyword: ${firstKeyword.name} (ID: ${firstKeyword.id})`);
  //         // Fetch movies for this keyword
  //         const moviesResponse = await axios.get(
  //           `https://api.themoviedb.org/3/keyword/${firstKeyword.id}/movies?api_key=${process.env.REACT_APP_TMDB_API_KEY}`
  //         );
  //         const movies = moviesResponse.data.results.map((movie: { id: number, title: string }) => ({
  //           id: movie.id,
  //           title: movie.title
  //         }));
  //         console.log(`Movies with keyword "${firstKeyword.name}":`, movies);
  //       } else {
  //         console.log(`No keywords found for movie ${movieId}`);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching movies by keyword:', error);
  //     }
  //   };
  //   if (selectedMovies.length > 0) {
  //     // Get the last added movie ID
  //     const lastAddedMovieId = selectedMovies[selectedMovies.length - 1];
  //     fetchAndLogMoviesByKeyword(lastAddedMovieId);
  //   } else {
  //     // If selectedMovies is empty, a movie was just removed
  //     console.log("All movies deselected");
  //   }
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
