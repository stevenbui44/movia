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

const Settings:React.FC = () => {

  // Part 1: Liked and disliked movies
  const [likedMovies, setLikedMovies] = useState<Movie[]>([]);
  const [dislikedMovies, setDislikedMovies] = useState<Movie[]>([]);

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // useEffect hook: Get liked and disliked movies
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Get liked movies from API
        try {
          const likedResponse = await axios.get('http://localhost:5001/api/movies/liked');
          setLikedMovies(likedResponse.data);
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            setLikedMovies([]);
          } else {
            console.error('Error fetching liked movies:', error);
          }
        }

        // Step 2: Get disliked movies from API
        try {
          const dislikedResponse = await axios.get('http://localhost:5001/api/movies/disliked');
          setDislikedMovies(dislikedResponse.data);
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            setDislikedMovies([]);
          } else {
            console.error('Error fetching disliked movies:', error);
          }
        }

      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <div className="settings-container">
      <h1>Movie Settings</h1>
      <div className="movie-columns">
        {/* Column 1: Liked movies */}
        <div className="movie-column">
          <h2>Liked Movies</h2>
          <ul>
            {likedMovies.map(movie => (
              <li key={movie.id}>{movie.title}</li>
            ))}
          </ul>
        </div>
        {/* Column 2: Disliked movies */}
        <div className="movie-column">
          <h2>Disliked Movies</h2>
          <ul>
            {dislikedMovies.map(movie => (
              <li key={movie.id}>{movie.title}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Settings;
