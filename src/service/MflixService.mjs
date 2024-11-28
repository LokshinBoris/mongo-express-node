import MongoConnection from '../mongo/MongoConnection.mjs'
import { ObjectId } from 'mongodb'
export default class MflixService 
{
    #moviesCollection
    #commentsCollection
    #connection
    constructor(uri, dbName, moviesCollection, commentsCollection)
    {
        this.#connection = new MongoConnection(uri, dbName);
        this.#moviesCollection = this.#connection.getCollection(moviesCollection);
        this.#commentsCollection = this.#connection.getCollection(commentsCollection);
        
    }
    shutdown() {
        this.#connection.closeConnection();
    }
    async addComment(commentDto)
    {
        
        const commentDB = this.#toComment(commentDto);
        const result = await this.#commentsCollection.insertOne(commentDB);
        commentDB._id = result.insertedId;
        return commentDB;
    }
    #toComment(commentDto) 
    {
        const movieId = ObjectId.createFromHexString(commentDto.movie_id);
        return {...commentDto,'movie_id': movieId}
    }

    async updateComment(commentDto)
    {
        const result = await this.#commentsCollection.updateOne(
        { _id: new ObjectId(commentDto._id) },
        { $set: {text: commentDto.text }}
        );
        return result.modifiedCount > 0 ? { _id: commentDto._id, text: commentDto.text } : null;
    }
        
    async deleteComment(commentDto)
    {
        const result = await this.#commentsCollection.deleteOne({ _id: new ObjectId(commentDto) });
        return result.deletedCount > 0;
    } 

    async getComment(commentDto)
    {
        const result = await this.#commentsCollection.findOne({ _id: new ObjectId(commentDto) });
        return result;
    } 

    async findTopMovies({ amount, year, genres, cast })
    {
        const query = {};
        if (year)
        {
            query.year = parseInt(year);
        }
        if (genres)
        // It is possible to specify several genres            
        {
            query.genres = { $all: genres };
        }
        
        if (cast)
        {
            const regexCast = new RegExp(cast, 'i');
            query.cast = { $regex: regexCast};
        }
                
        const movies = await this.#moviesCollection
        .find(query)
        .sort({ 'imdb.rating': -1 })
        .limit(parseInt(amount))
        .toArray();
        
        return movies;
        }
}