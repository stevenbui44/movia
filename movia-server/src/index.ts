import express from "express";
import cors from "cors";
import {PrismaClient} from "@prisma/client"

const app = express();
const prisma = new PrismaClient();

app.use(express.json())
app.use(cors())

// Function 1: GET all movies
app.get("/api/movies", async (req, res) => {
  const movies = await prisma.movie.findMany()
  res.json(movies)
})

// Function 2: POST a new movie
app.post("/api/movies", async (req, res) => {
  const tmdb_id = req.body.tmdb_id
  const title = req.body.title
  const liked = req.body.liked
  const rating = req.body.rating
  const popularity = req.body.popularity
  if (!tmdb_id || !title || !rating || !popularity) {
    return res
      .status(400)
      .send("Invalid fields in POST /api/movies :(")
  }
  try {
    const movie = await prisma.movie.create({
      data: {
        tmdb_id: tmdb_id,
        title: title,
        liked: liked,
        rating: rating,
        popularity: popularity
      }
    })
    res.json(movie)
  }
  catch (error) {
    res
      .status(500)
      .send("Error with POST /api/movies with PrismaClient :(")
  }
})

// Function 3: DELETE a movie
app.delete("/api/movies/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id || isNaN(id)) {
    return res
      .status(400)
      .send("ID is not a number in DELETE /api/movies/:id :(")
  }
  try {
    await prisma.movie.delete({
      where: {
        id: id
      }
    })
    res.status(204).send()
  }
  catch (error) {
    res
      .status(500)
      .send("Error with DELETE /api/movies/:id with PrismaClient :(")
  }
})

// Function 4: GET all liked movies (liked=true)
app.get("/api/movies/liked", async (req, res) => {
  try {
    const movies = await prisma.movie.findMany({
      where: {
        liked: true
      }
    })
    if (movies.length === 0) {
      return res
        .status(404)
        .send("No liked movies in /api/movies/liked :(")
    }
    res.json(movies)
  }
  catch (error) {
    res
      .status(500)
      .send("Error with GET /api/movies/liked with PrismaClient :(")
  }
})

// Function 5: GET all disliked movies (liked=false)
app.get("/api/movies/disliked", async (req, res) => {
  try {
    const movies = await prisma.movie.findMany({
      where: {
        liked: false
      }
    })
    if (movies.length === 0) {
      return res
        .status(404)
        .send("No disliked movies in /api/movies/disliked :(")
    }
    res.json(movies)
  }
  catch (error) {
    res
      .status(500)
      .send("Error with GET /api/movies/disliked with PrismaClient :(")
  }
})


app.listen(5001, () => {
  console.log("server running on port 5001")
})
