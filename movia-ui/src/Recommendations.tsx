import './App.css'
import {useState} from "react"
import {useEffect} from "react"
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRandom } from '@fortawesome/free-solid-svg-icons'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'

// Movie in the database
type Movie = {
  id: number
  tmdb_id: number
  title: string
  liked: boolean
  rating: number
  popularity: number
}

// Movie retrieved from TMDB
type TMDBMovie = {
  id: number
  overview: string
  popularity: number
  release_date: string
  title: string
  poster_path: string
  vote_average: number
  genre_ids: number[]
}

// Movie genre, since genre_id is number[]
type Genre = {
  id: number
  name: string
}

// List of recommended movies for each liked movie
type RecommendationSet = {
  originalMovie: Movie
  recommendations: TMDBMovie[]
  recommendationPool: TMDBMovie[]
}

// A keyword for a movie
type Keyword = {
  id: number
  name: string
}

// A set containing a movie's ID and its keywords
type KeywordSet = {
  movieId: number
  keywords: Keyword[]
}


// Main component
const Recommendations:React.FC = () => {

  // Part 1: All sets of movie recommendations + loading and error screens
  const [recommendationSets, setRecommendationSets] = useState<RecommendationSet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [popupMovie, setPopupMovie] = useState<TMDBMovie | null>(null)
  const [genres, setGenres] = useState<Genre[]>([])

  const [dislikedMovies, setDislikedMovies] = useState<Movie[]>([])
  const [likedMovies, setLikedMovies] = useState<Movie[]>([])

  const [selectedKeywords, setSelectedKeywords] = useState<{[key:number]: number}>({})
  const [keywordSets, setKeywordSets] = useState<KeywordSet[]>([])


  // useEffect hook: Gets genres + disliked/liked movies first, then all sets of movie recommendations
  useEffect(() => {
    fetchGenres()
    fetchDislikedMovies()
    fetchLikedMovies()
    fetchLikedMoviesAndRecommendations()
  }, [])


  // Function 1: Main function to get liked movies and recommendations based on those movies
  const fetchLikedMoviesAndRecommendations = async () => {
    try {
      const dislikedMoviesList = await fetchDislikedMovies()

      // JSON object of movies, headers, request, status
      const response = await axios.get<Movie[]>(
        'http://localhost:5001/api/movies/liked'
      )
      // Movie[] array of liked movies
      const likedMovies = response.data

      // for each Movie, get the keywords using TMDB API
      const keywordPromises = likedMovies.map(async (movie) => {
        const keywords = await fetchKeywords(movie.tmdb_id)
        return { 
          movieId: movie.tmdb_id, 
          keywords 
        }
      })
      const allKeywords = await Promise.all(keywordPromises)
      setKeywordSets(allKeywords)
      

      // Promise[]
      // for each Movie, get recommended TMDBMovies using TMDB API
      const recommendationPromises = likedMovies.map(async (movie) => {
        // Step 1: Get all recommended movies
        const similarMoviesResponse = await axios.get<{ results:TMDBMovie[] }>(
          `https://api.themoviedb.org/3/movie/${movie.tmdb_id}/recommendations?api_key=${process.env.REACT_APP_TMDB_API_KEY}`
        )

        // // Step 2: Filter out movies in disliked and liked list
        const filteredRecommendations = similarMoviesResponse.data.results.filter(recommendation => 
          !dislikedMoviesList.some(disliked => disliked.tmdb_id === recommendation.id) &&
          !likedMovies.some(liked => liked.tmdb_id === recommendation.id)
        )

        // Step 3: Return the RecommendationSet
        return {
          originalMovie: movie,
          recommendations: filteredRecommendations.slice(0, 5),
          recommendationPool: filteredRecommendations.slice(5)
        }
      })

      // RecommendationSet[]
      const allRecommendations = await Promise.all(recommendationPromises)
      setRecommendationSets(allRecommendations)
    } catch (error) {
      setError('Failed to fetch recommendations :(')
    } finally {
      setLoading(false)
    }
  }

  // Function 2: Open a modal when you click on its movie poster
  const openPopup = (movie:TMDBMovie) => {
    console.log(movie)
    // console.log(movie.overview)
    setPopupMovie(movie)
  }

  // Function 3: Close a modal when you click away from its movie poster
  const closePopup = () => {
    setPopupMovie(null)
  }

  // Function 4: Get the names of the genres
  const fetchGenres = async () => {
    try {
      const response = await axios.get<{genres: Genre[]}>(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.REACT_APP_TMDB_API_KEY}`
      )
      setGenres(response.data.genres)
    } catch (error) {
      console.error('Error fetching genres:', error)
    }
  }

  // Function 5: Format the date right for the modal
  const formatDate = (dateString:string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  // Function 6: Make a POST call with liked=false if the user presses the 'x' button, as well as
  // updates the RecommendedSet with a new movie
  const putMovieInDislikedMovies = async (movie:TMDBMovie, setId:number) => {
    try {
      const response = await axios.post('http://localhost:5001/api/movies', {
        tmdb_id: movie.id,
        title: movie.title,
        liked: false,
        rating: movie.vote_average,
        popularity: movie.popularity
      })
      setDislikedMovies([...dislikedMovies, response.data])
    
      // Turns all previous sets to new sets, where one set gets a new movie
      setRecommendationSets(prevSets => 
        prevSets.map(set => {
          // if this is the set with the movie to replace
          if (set.originalMovie.id === setId) {
            // exclude the disliked movie
            const updatedRecommendations = set.recommendations.filter(recommendation => recommendation.id !== movie.id)
            if (set.recommendationPool.length > 0) {
              // add the new movie
              updatedRecommendations.push(set.recommendationPool[0])
              // return the new RecommendationSet
              return {
                ...set,
                recommendations: updatedRecommendations,
                recommendationPool: set.recommendationPool.slice(1)
              }
            }
            else {
              // return the set excluding the disliked movie and no replacement
              return {
                ...set,
                recommendations: updatedRecommendations
              }
            }
          }
          return set
        })
      )

    } catch (error) {
      console.error('Error disliking movie:', error)
    }
  }

  // Function 7: Get and return user's disliked movies
  const fetchDislikedMovies = async () => {
    try {
      const response = await axios.get<Movie[]>('http://localhost:5001/api/movies/disliked')
      setDislikedMovies(response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching disliked movies:', error)
      return []
    }
  }

  // Function 8: Get and return user's liked movies
  const fetchLikedMovies = async () => {
    try {
      const response = await axios.get<Movie[]>('http://localhost:5001/api/movies/liked')
      setLikedMovies(response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching liked movies:', error)
      return []
    }
  }

  // Function 9: Get a movie's keywords
  const fetchKeywords = async (movieId:number) => {
    try {
      const response = await axios.get<{keywords:Keyword[]}>(
        `https://api.themoviedb.org/3/movie/${movieId}/keywords?api_key=${process.env.REACT_APP_TMDB_API_KEY}`
      )
      return response.data.keywords
    } catch (error) {
      console.error('Error fetching keywords:', error)
      return []
    }
  }

  // Function 10: Get recommended movies given a movie's keywords
  const fetchMoviesByKeyword = async (keywordId:number, setId:number) => {
    try {
      // Step 1: Get movies given a keyword
      const response = await axios.get<{ results:TMDBMovie[] }>(
        `https://api.themoviedb.org/3/keyword/${keywordId}/movies?api_key=${process.env.REACT_APP_TMDB_API_KEY}`
      )
      // Step 2: Filter out liked and disliked movies
      const filteredMovies = response.data.results.filter(movie => 
        !dislikedMovies.some(disliked => disliked.tmdb_id === movie.id) &&
        !likedMovies.some(liked => liked.tmdb_id === movie.id)
      )
      // Step 3: Update the RecommendationSet to show the new recommended movies
      setRecommendationSets(prevSets => 
        prevSets.map(set => 
          set.originalMovie.id === setId 
            ? { ...set, recommendations: filteredMovies.slice(0, 5) }
            : set
        )
      )
    } catch (error) {
      console.error('Error fetching movies by keyword:', error)
    }
  }

  // Function 11: Shuffle movies
  const shuffleMovies = (setId:number) => {
    setRecommendationSets(prevSets => 
      prevSets.map(set => {
        // if this is the set to shuffle, then get the next 5 movies in the recommendations pool
        if (set.originalMovie.id === setId) {
          const newRecommendations = set.recommendationPool.slice(0, 5)
          const newPool = [...set.recommendationPool.slice(5), ...set.recommendations]
          return {
            ...set,
            recommendations: newRecommendations,
            recommendationPool: newPool
          }
        }
        // if not, skip it
        return set
      })
    )
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) return <div>Error: {error}</div>
  return (
    <div className="container">
      
      <div className="header-container">
        <h1>Our Recommended Picks for You</h1>
        <div className="settings-icon">
          <Link to="/settings">
            <FontAwesomeIcon icon={faEllipsisV} />
          </Link>
        </div>
      </div>

      {/* Part 1: Body of the page */}
      {recommendationSets.map((set) => (
        <div key={set.originalMovie.id} className="recommendation-set">

          {/* 1.1: The dropdown menu for keywords */}
          <div className="recommendation-header">
            <div className="recommendation-header-left">
              <h2>Since you liked <i>{set.originalMovie.title}</i>...</h2>
            </div>
            <div className="recommendation-header-right">
              <select 
                value={selectedKeywords[set.originalMovie.id] || ''}
                onChange={(e) => {
                  const keywordId = Number(e.target.value)
                  setSelectedKeywords({
                    ...selectedKeywords, 
                    [set.originalMovie.id]:keywordId
                  })
                  fetchMoviesByKeyword(keywordId, set.originalMovie.id)
                }}
              >
                <option value="">Select a keyword</option>
                {keywordSets
                  .find(keywordSet => keywordSet.movieId === set.originalMovie.tmdb_id)
                  ?.keywords.map(keyword => (
                    <option key={keyword.id} value={keyword.id}>
                      {keyword.name}
                    </option>
                  ))
                }
              </select>

              {/* 1.2: Shuffle button */}
              <button 
                className="shuffle-button" 
                onClick={() => shuffleMovies(set.originalMovie.id)}
              >
                <FontAwesomeIcon icon={faRandom} />
              </button>
            </div>
          </div>

          {/* 1.3: 5 recommended movies for each row */}
          <div className="movie-row">

            {/* for each movie, have the 'x' button and the movie poster */}
            {set.recommendations.map((movie) => (
              <div key={movie.id} className="movie-card">
                {/* 'x' button */}
                {popupMovie === null && (<div className="dislike-button" onClickCapture={(e) => {
                  e.stopPropagation()
                  putMovieInDislikedMovies(movie, set.originalMovie.id)
                }}>
                  &times;
                </div>)}
                {/* movie poster */}
                <div onClick={
                  () => openPopup(movie)
                }>
                  <img 
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
                    alt={movie.title} 
                  />
                  <p>{movie.title}</p>
                </div>
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
                    const genre = genres.find(g => g.id === genreId)
                    return genre ? <li key={genre.id}>{genre.name}</li> : null
                  })}
                </ul>
              </div>
            </div>

          </div>
        </div>
      )}

      <footer className="footer">
        <p>&copy; 2024 Movia</p>
      </footer>

    </div>
  )
}

export default Recommendations