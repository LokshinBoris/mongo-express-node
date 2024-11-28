import express from 'express';
import MflixService from './service/MflixService.mjs'
const app = express();
const port = process.env.PORT || 3500;
const mflixService = new MflixService(process.env.MONGO_URI, process.env.DB_NAME,
    process.env.MOVIES_COLLECTION, process.env.COMMENTS_COLLECTION)
const server = app.listen(port);
server.on("listening", ()=>console.log(`server listening on port ${server.address().port}`));
app.use(express.json());
app.post("/mflix/comments", async (req, res) => 
    {
    const commentDB = await mflixService.addComment(req.body);
    res.status(201).end(JSON.stringify(commentDB));
    }
);
app.put("/mflix/comments", async (req, res) => 
{
    const updatedComment = await mflixService.updateComment(req.body);
    res.status(200).json(updatedComment);
});
app.delete("/mflix/comments/:id", async (req, res) => 
{
    const deleteComment=await mflixService.deleteComment(req.params.id);
    res.status(200).json(deleteComment);
});
app.get("/mflix/comments/:id", async (req, res) => 
{
    const getComment=await mflixService.getComment(req.params.id);
    res.status(200).json(getComment);
})
app.post("/mflix/movies/rated", async (req, res) =>
{
    const { amount, year, genres, cast } = req.body;
    const movies = await mflixService.findTopMovies({ amount, year, genres, cast });
    res.status(200).json(movies);
    //TODO find most imdb rated movies
   // req.body {"year":<number>(optional), "genre":<string>(optional),
   // "acter":<string-regex>(optional), "amount":<number>(mandatary)}
})