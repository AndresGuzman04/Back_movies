import mysql from 'mysql2/promise.js'

const config = {
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: '',
    database: 'moviesdb'
}

const connection = await  mysql.createConnection(config)

export class MovieModel {
  static async getAll({ genre }) {
    let genreCondition = "";
    let genreParams = [];
  
    if (genre) {
      genreCondition = `WHERE LOWER(g.name) = ?`;
      genreParams.push(genre.toLowerCase());
    }
  
    const [movies] = await connection.query(
      `SELECT 
        BIN_TO_UUID(m.id) AS id, 
        m.title, 
        m.year, 
        m.director, 
        m.duration, 
        m.poster, 
        m.rate, 
        GROUP_CONCAT(g.name) AS genres
       FROM movies m
       LEFT JOIN movie_genres mg ON m.id = mg.movie_id
       LEFT JOIN genre g ON mg.genre_id = g.id
       ${genreCondition}
       GROUP BY m.id, m.title, m.year, m.director, m.duration, m.poster, m.rate`,
      genreParams
    );
  
    return movies.map(movie => ({
      ...movie,
      genres: movie.genres ? movie.genres.split(",") : []
    }));
  }
  
  static async getById ({ id }) {

  }

  static async create ({ input }) {
    
  }

  static async delete ({ id }) {
    
  }

  static async update ({ id, input }) {
    
  }
}
