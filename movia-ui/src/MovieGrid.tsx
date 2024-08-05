import './App.css';
import {useState} from "react";
import {useEffect} from "react";
import {useRef} from "react";
import axios from 'axios';
import {Link} from 'react-router-dom'

type Movie = {
  id: number
  poster_path: string
  tmdb_id: number
  title: string
  liked: boolean
  vote_average: number
  popularity: number
}

// Component 1: Movie page
const MovieGrid = () => {

  // Part 1: Initialize the list of movies as an empty Movie[] array
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([])

  // Part 2: Terms and results when searching up a movie
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // useEffect 1: Gets a list of top 20 movies one time when the program is rendered
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

  // useEffect 2: Search up a movie in searchTerm with a short timeout
  useEffect(() => {
    // CASE ONE: the user typed something in to search
    if (searchTerm) {
      // if there is already a timeout counting down, clear it
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      // set a 300 ms timer before calling searchMovies()
      searchTimeoutRef.current = setTimeout(() => {
        searchMovies(searchTerm);
      }, 500);
    }
    // the user did not type in any query
    else {
      setSearchResults([]);
    }
    // return () => {
    // }
  }, [searchTerm]);


  // Function 1: Function to select/deselect a movie
  const toggleMovieSelection = (movie: Movie) => {
    setSelectedMovies((prevSelected) => {
      const isSelected = prevSelected.some(m => m.id === movie.id);
      if (isSelected) {
        return prevSelected.filter(m => m.id !== movie.id);
      } else {
        return [...prevSelected, movie];
      }
    });
  }

  // Function 1.1: Helper function to print out the movie name given its ID
  // const logMovieTitle = (movieId: number) => {
  //   const movie = movies.find(m => m.id === movieId);
  //   if (movie) {
  //     console.log(movieId, `: ${movie.title}`);
  //   } else {
  //     console.log(`No movie found with ID: ${movieId}`);
  //   }
  // };


  // Function 2: Function to make POST calls when you press 'Next'
  const handleNext = async () => {
    try {
      for (const movie of selectedMovies) {
        // if we can retrieve data (movie), then make the POST call
        if (movie) {
          try {
            await axios.post('http://localhost:5001/api/movies', {
              tmdb_id: movie.id,
              title: movie.title,
              liked: true,
              rating: movie.vote_average,
              popularity: movie.popularity
            })
          }
          catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 500) {
              console.log(`Movie already exists in database: ${movie.title}`)
            } else {
              console.error(`Error adding movie ${movie.title}:`, error)
            }
          }
        }
      }
    }
    catch (error) {
      console.log('Error handling next: ', error)
    }
  }


  // Function 3: Search up a movie using searchTerm
  const searchMovies = async (query:string) => {
    try {
      // TMDB API call to search for a movie using the query
      const response = await axios.get(
        `https://api.themoviedb.org/3/search/movie?api_key=${process.env.REACT_APP_TMDB_API_KEY}&query=${query}`
      );
      setSearchResults(response.data.results.slice(0, 20));
    } catch (error) {
      console.error('Error searching movies:', error);
    }
  };




  // Part 4: HTML 
  return (
    <div className="container">

      <div className="search-container">
        {/* Lets you type into the textbox with onChange */}
        <input 
          type="text"
          placeholder="Search for a movie..."
          value={searchTerm}
          onChange={
            (e) => setSearchTerm(e.target.value)
          }
        />
        {/* Gets the searched movies */}
        {searchResults.length > 0 && (
          <ul className="search-results">
            {searchResults.map((movie) => (
              <li key={movie.id} onClick={() => toggleMovieSelection(movie)}>

                <img 
                  className="movie-poster"
                  src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                  alt={movie.title}
                />
                <span className="movie-title">{movie.title}</span>

              </li>
            ))}
          </ul>
        )}
      </div>

      <main className="Movie-grid">
        {movies.map((movie) => (
          // Each individual movie
          <div 
            key={movie.id} 
            className={`Movie-item ${selectedMovies.some(m => m.id === movie.id) ? 'selected' : ''}`}
            onClick= {
              () => toggleMovieSelection(movie)
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

      {/* Row at bottom for selected movies */}
      <div className="Selected-movies-row">
        {selectedMovies.map((movie) => {
          return movie ? (
            <img 
              key={movie.id}
              src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
            />
          ) : null;
        })}
      </div>

      {/* Next button only if user selected a movie */}
      {selectedMovies.length > 0 ? (
        <Link to="/recommendations" className="Next-button"
            onClick={(e) => {
              e.preventDefault()
              handleNext().then(() => {
                window.location.href = '/recommendations'
              })
            }}>
            {/* onClick={(e) => {
              e.preventDefault()
              handleNext()
            }}> */}
          Next
        </Link>
      ) : (
        <span className="Next-button disabled">Next</span>
      )}
    </div>
  );
}

export default MovieGrid

  // usEffect hook: Print out selectedMovies every time it is updated
  // useEffect(() => {
  //   console.log(selectedMovies);
  // }, [selectedMovies]);

  // useEffect hook: Get keywords for a movie
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
  //     const movie = movies.find(m => m.id === lastAddedMovieId);
  //     if (movie) {
  //       fetchAndLogKeywords(movie.id);
  //     }
  //   } else {
  //     // If selectedMovies is empty, a movie was just removed
  //     console.log("All movies deselected");
  //   }
  // }, [selectedMovies, movies]);

  // useEffect hook: Print out information on each movie when selected
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
