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
    fetchMovies();
  }, []);

  // Function 1: Get all liked and disliked movies
  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Get liked movies from your own API
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

      // Step 2: Get disliked movies from your own API
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

  // Function 2: Delete a movie from either the liked/disliked list
  const deleteMovie = async (id:number) => {
    try {
      await axios.delete(`http://localhost:5001/api/movies/${id}`);
      fetchMovies();
    } 
    catch (error) {
      console.error('Error deleting movie:', error);
      setError('Error with deleting the movie :(');
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <div className="settings-container">
      <h1>Movie Settings</h1>
      <div className="movie-columns">

        {/* Column 1: Liked movies */}
        <div className="movie-column">
          <h2>Liked Movies</h2>
          <div className="scrollable-list">
            <ul>
              {likedMovies.map(movie => (
                <li key={movie.id}>
                  {movie.title}
                  <button className="delete-button" onClick={() => deleteMovie(movie.id)}>&times;</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Column 2: Disliked movies */}
        <div className="movie-column">
          <h2>Disliked Movies</h2>
          <div className="scrollable-list">
            <ul>
              {dislikedMovies.map(movie => (
                <li key={movie.id}>
                  {movie.title}
                  <button className="delete-button" onClick={() => deleteMovie(movie.id)}>&times;</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
