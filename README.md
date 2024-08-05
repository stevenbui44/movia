# Movia

Movia is a web application that allows users to select their favorite movies and receive tailored movie recommendations based on their preferences. This project also allows users to exclude movies that they would not prefer recommendations for, as well as to get recommended movies with specific keywords.

## Features

- **Multi-factor Recommendation Algorithm**: Considers multiple factors (keywords, genre, etc.) in recommendations
- **TMDB API Integration**: Access to an extensive, up-to-date movie database
- **Movie Selection Interface**: Interactive grid for browsing and selecting movies
- **Search Functionality**: Search for specific movies in addition to the movie grid
- **Keyword Search**: Press a dropdown menu beside liked movies to find more movies with similar keywords
- **Shuffle Functionality**: Press a shuffle button to get a new set of recommendations
- **Movie Filtering**: Remove seen/disliked movies from recommendation feed
- **Customizable Settings**: Remove liked and seen/disliked movies from the system to update the recommendation algorithm

## Tech Stack

- **Frontend**: ReactJS, HTML, CSS, JavaScript, TypeScript
- **Backend**: Node.js with Express framework
- **Database**: PostgreSQL (hosted on Tembo)
- **API**: TMDB API (The Movie Database)
- **ORM**: Prisma

## Installation

1. Ensure that you have the following prerequisites installed:
  - Node.js, version 12.0 or higher
  - Visual Studio Code
  - Git

2. Open VS Code
3. Clone the repository:
```
git clone https://github.com/stevenbui44/movia.git
```
4. Install server dependencies
```
cd movia/movia-server
npm install
```
5. Open a new Terminal
6. Install ui dependencies
```
cd movia/movia-ui
npm install
```
7. Set up your PostgreSQL database
  - I used Tembo to host the database, but it's probably okay if you use something different
  - After setting up the database on Tembo, click on 'Show connection strings' and copy the 'postgresql://...' connection string

8. Create a new .env file in /movia-server
9. Add your PostgreSQL credentials into the .env file:
```
DATABASE_URL=postgres_connection_string
```
10. Set up a [TMDB API](https://developer.themoviedb.org/reference/intro/getting-started) account
11. Create a new .env file in /movia-ui
12. Add your TMDB credentials into the .env file:
```
REACT_APP_TMDB_API_KEY=tmdb_api_key
```
13. On the Terminal on movia-server, run the server:
```
npm start
```
14. On the Terminal on movia-ui, run the client:
```
npm start
```

## Usage

1. Open the application in localhost:3000
- TODO: screenshot of the main grid page

2. Select movies to get recommendations for from the grid or the search bar
- TODO: screenshot of the page with movies from the grid selected and movies being searched in the search bar, movie posters in the bottom row

3. Press Next to view personalized movie recommendations
- TODO: screenshot of personalized movie recommendations

4. Get more movie recommendations by browsing specific keywords or pressing 'x' to hide movies
- TODO: screenshot of browswing specific keywords

5. Go to the settings page to remove liked or disliked/seen movies
- TODO: screenshot of the settings page
