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
  static async getAll ({ genre }) {

    if (genre) {
      const lowerCaseGenre = genre.toLowerCase()
      
      const [genres] = await connection.query('SELECT id, name FROM genre WHERE LOWER(name) = ?', [lowerCaseGenre])

      // no genre found
      if (genres.length === 0) return []

      //get th id from the first genre result
      const [{ id }] = genres

      // get all movies ids from database table
      const [movies_id] = await connection.query('SELECT movie_id FROM movie_genres WHERE genre_id = ?', [id])

      // Si no hay películas relacionadas, devolver un array vacío
      if (movies_id.length === 0) return [];

      const movieIds = movies_id.map(item => item.movie_id);

      // Consultar las películas usando los IDs
      const [movies] = await connection.query(
        `SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) AS uuid 
        FROM movies 
        WHERE id IN (${movieIds.map(() => '?').join(',')})`,
        movieIds
      );

      return movies;
    }

    const [movies] = await connection.query('SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) AS uuid FROM movies ;')

    return movies
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
