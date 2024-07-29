import './App.css';
import {useState} from "react";
import {useEffect} from "react";
import axios from 'axios';
import {Link} from 'react-router-dom'
import { populate } from 'dotenv';

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

  // usEffect hook: Print out selectedMovies every time it is updated
  // useEffect(() => {
  //   console.log(selectedMovies);
  // }, [selectedMovies]);

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


  // Function 1: Function to select/deselect a movie
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

  // Function 1.1: Helper function to print out the movie name given its ID
  const logMovieTitle = (movieId: number) => {
    const movie = movies.find(m => m.id === movieId);
    if (movie) {
      console.log(movieId, `: ${movie.title}`);
    } else {
      console.log(`No movie found with ID: ${movieId}`);
    }
  };


  // Function 2: Function to make POST calls when you press 'Next'
  const handleNext = async () => {
    console.log('inside handleNext')
    try {
      for (const movieId of selectedMovies) {
        const movie = movies.find(m => m.id === movieId)
        // if we can retrieve data (movie), then make the POST call
        if (movie) {
          console.log('movie:', movie)
          console.log('tmdb_id:', movie.id)
          console.log('title:', movie.title)
          console.log('liked:', true)
          console.log('rating:', movie.vote_average)
          console.log('popularity:', movie.popularity)

          
          await axios.post('http://localhost:5001/api/movies', {
            // method: 'POST',
            // headers: {
            //   'Content-Type': 'application/json'
            // },
            // body: JSON.stringify({
            tmdb_id: movie.id,
            title: movie.title,
            liked: true,
            rating: movie.vote_average,
            popularity: movie.popularity

            //   tmdb_id: 2400,
            //   title: 'movie 2',
            //   liked: true,
            //   rating: 10.000,
            //   popularity: 20.000
            // })

            // tmdb_id: 2400,
            // title: 'movie 2',
            // liked: true,
            // rating: 10.000,
            // popularity: 20.000

          })


        }
      }
    }
    catch (error) {
      console.log('Error handling next: ', error)
    }
  }








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

      {/* Row at bottom for selected movies */}
      <div className="Selected-movies-row">
        {selectedMovies.map((id) => {
          const movie = movies.find(m => m.id === id);
          return movie ? (
            <img 
              key={id}
              src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
            />
          ) : null;
        })}
      </div>

      {/* Next button only if user selected a movie */}
      {selectedMovies.length > 0 ? (
        <Link to="/recommendations" className="Next-button"
            // onClick={(e) => {
            //   e.preventDefault()
            //   handleNext().then(() => {
            //     window.location.href = '/recommendations'
            //   })
            // }}>
            onClick={(e) => {
              e.preventDefault()
              handleNext()
            }}>
          Next
        </Link>
      ) : (
        <span className="Next-button disabled">Next</span>
      )}
    </div>
  );
}

export default MovieGrid
