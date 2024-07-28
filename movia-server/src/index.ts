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
  const poster_path = req.body.poster_path
  const liked = req.body.liked
  const rating = req.body.rating
  const genre_ids = req.body.genre_ids
  if (!tmdb_id || !title || !poster_path || !rating || genre_ids.length === 0) {
    return res
      .status(400)
      .send("Invalid fields in POST /api/movies :(")
  }
  try {
    const movie = await prisma.movie.create({
      data: {
        tmdb_id: tmdb_id,
        title: title,
        poster_path: poster_path,
        liked: liked,
        rating: rating,
        genre_ids: genre_ids
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


app.listen(5001, () => {
  console.log("server running on port 5001")
})
