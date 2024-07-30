import './App.css';
import {useState} from "react";
import {useEffect} from "react";
import axios from 'axios';

// Movie in the database
type Movie = {
  id: number;
  tmdb_id: number;
  title: string;
  liked: boolean;
  rating: number;
  popularity: number;
}

// Movie retrieved from TMDB
type TMDBMovie = {
  id: number;
  overview: string;
  popularity: number;
  release_date: string;
  title: string;
  poster_path: string;
  vote_average: number;
  genre_ids: number[];
}

// Movie genre, since genre_id is number[]
type Genre = {
  id: number;
  name: string
}

// List of recommended movies for each liked movie
type RecommendationSet = {
  originalMovie: Movie;
  recommendations: TMDBMovie[];
}

// Main component
const Recommendations:React.FC = () => {

  // Part 1: All sets of movie recommendations + loading and error screens
  const [recommendationSets, setRecommendationSets] = useState<RecommendationSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [popupMovie, setPopupMovie] = useState<TMDBMovie | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);


  // useEffect hook: Gets all sets of movie recommendations
  useEffect(() => {
    fetchGenres();
    fetchLikedMoviesAndRecommendations();
  }, []);


  // Function 1: Main function to get liked movies and recommendations based on those movies
  const fetchLikedMoviesAndRecommendations = async () => {
    try {
      // JSON object of movies, headers, request, status
      const response = await axios.get<Movie[]>(
        'http://localhost:5001/api/movies/liked'
      );
      // Movie[] array of liked movies
      const likedMovies = response.data;

      // Promise[]
      // for each Movie, get recommended TMDBMovies using TMDB API
      const recommendationPromises = likedMovies.map(async (movie) => {
        const similarMoviesResponse = await axios.get<{ results:TMDBMovie[] }>(
          `https://api.themoviedb.org/3/movie/${movie.tmdb_id}/recommendations?api_key=${process.env.REACT_APP_TMDB_API_KEY}`
        );
        // return the RecommendationSet
        return {
          originalMovie: movie,
          recommendations: similarMoviesResponse.data.results.slice(0, 5)
        };
      });

      // RecommendationSet[]
      const allRecommendations = await Promise.all(recommendationPromises);
      setRecommendationSets(allRecommendations);
    } catch (error) {
      setError('Failed to fetch recommendations :(');
    } finally {
      setLoading(false);
    }
  };

  // Function 2: Open a modal when you click on its movie poster
  const openPopup = (movie:TMDBMovie) => {
    console.log(movie)
    // console.log(movie.overview)
    setPopupMovie(movie);
  };

  // Function 3: Close a modal when you click away from its movie poster
  const closePopup = () => {
    setPopupMovie(null);
  };

  // Function 4: Get the names of the genres
  const fetchGenres = async () => {
    try {
      const response = await axios.get<{genres: Genre[]}>(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.REACT_APP_TMDB_API_KEY}`
      );
      setGenres(response.data.genres);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  // Function 5: Format the date right for the modal
  const formatDate = (dateString:string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };




  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <div className="container">
      <h1>Movie Recommendations</h1>

      {/* Part 1: Body of the page */}
      {recommendationSets.map((set) => (
        <div key={set.originalMovie.id} className="recommendation-set">
          <h2>Since you liked <i>{set.originalMovie.title}</i>...</h2>
          <div className="movie-row">
            {set.recommendations.map((movie) => (
              <div key={movie.id} className="movie-card" onClick={
                () => openPopup(movie)
              }>
                <img 
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
                  alt={movie.title} 
                />
                <p>{movie.title}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Part 2: Modal content if popupMovie is not null */}
      {popupMovie && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>

            {/* Row 1: Movie poster */}
            <div className="popup-row">
              <img 
                src={`https://image.tmdb.org/t/p/w500${popupMovie.poster_path}`} 
                alt={popupMovie.title}
                className="popup-poster"
              />
            </div>

            {/* Row 2: Title */}
            <div className="popup-row popup-title">
              <h2>{popupMovie.title}</h2>
            </div>

            {/* Row 3: Rating and date */}
            <div className="popup-row popup-info">
              <div className="popup-info-item">
                <p>Rating: {popupMovie.vote_average.toFixed(2)}/10</p>
              </div>
              <div className="popup-info-item">
                <p>{formatDate(popupMovie.release_date)}</p>
              </div>
            </div>

            {/* Row 4: Overview */}
            <div className="popup-row">
              <p className="overview">{popupMovie.overview}</p>
            </div>

            {/* Row 5: Genres */}
            <div className="popup-row">
              <div className="genres">
                <ul>
                  {popupMovie.genre_ids.map((genreId) => {
                    const genre = genres.find(g => g.id === genreId);
                    return genre ? <li key={genre.id}>{genre.name}</li> : null;
                  })}
                </ul>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Recommendations;