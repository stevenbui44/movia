import express from "express";
import cors from "cors";
import {PrismaClient} from "@prisma/client"

const app = express();
const prisma = new PrismaClient();

app.use(express.json())
app.use(cors())

app.get("/api/movies", async (req, res) => {
  const movies = await prisma.movie.findMany()
  res.json(movies)
})

app.listen(5001, () => {
  console.log("server running on port 5001")
})
