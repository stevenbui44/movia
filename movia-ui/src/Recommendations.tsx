import './App.css';
import {useState} from "react";
import {useEffect} from "react";
import axios from 'axios';

type Movie = {
  id: number;
  tmdb_id: number;
  title: string;
  liked: boolean;
  rating: number;
  popularity: number;
}

type TMDBMovie = {
  id: number;
  title: string;
  poster_path: string;
}

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

  // useEffect hook: Gets all sets of movie recommendations
  useEffect(() => {
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

  // CASE ONE: Page is still loading
  if (loading) {
    return <div>Loading...</div>;
  }
  // CASE TWO: Page had an error
  if (error) {
    return <div>Error: {error}</div>;
  }
  // CASE THREE: Regular HTML page with movies
  return (
    <div className="recommendations-container">
      <h1>Movie Recommendations</h1>
      {recommendationSets.map((set) => (
        <div key={set.originalMovie.id} className="recommendation-set">
          <h2>Similar to: {set.originalMovie.title}</h2>
          <div className="movie-row">
            {set.recommendations.map((movie) => (
              <div key={movie.id} className="movie-card">
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
    </div>
  );
};

export default Recommendations;