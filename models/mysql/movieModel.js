import mysql from 'mysql2/promise.js'

const config = {
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: 'admin',
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
       WHERE BIN_TO_UUID(m.id) COLLATE utf8mb4_unicode_ci = ?
       GROUP BY m.id, m.title, m.year, m.director, m.duration, m.poster, m.rate;`,
      [id]
    );
    

    return movies.map(movie => ({
      ...movie,
      genres: movie.genres ? movie.genres.split(",") : []
    }));
  }

  static async create ({ input }) {
    const {
      title,
      year,
      director,
      duration,
      poster,
      rate,
      genre
    } = input;

    //Function for get or create genre and return IDs
    const getOrCreateGenreIds = async (genres) => {
      const genreIds = [];
      
      for (const g of genres) {
        // Buscar el género
        const [[existingGenre]] = await connection.query(
          'SELECT id FROM genre WHERE LOWER(name) = ?',
          [g.toLowerCase()]
        );
  
        if (existingGenre) {
          // Si existe, añadir su ID
          genreIds.push(existingGenre.id);
        } else {
          // Si no existe, crear el género y obtener su ID
          const result = await connection.query('INSERT INTO genre (name) VALUES (?)', [g]);
          genreIds.push(result.insertId);
        }
      }
  
      return genreIds;
    };

    //Get new genre IDs
    const [[{ uuid }]] = await connection.query('SELECT UUID() AS uuid');

    //Insert movie into database
    const resultMovie = await connection.query(
      `INSERT INTO movies (id, title, year, director, duration, poster, rate) 
      VALUES (UUID_TO_BIN("${uuid}"), ?, ?, ?, ?, ?, ?)`,
      [title, year, director, duration, poster, rate]     
    )

    console.log('Movie Inserted:', resultMovie)

    //Get or create IDs to genres
    const genreIds = await getOrCreateGenreIds(genre);

    //Insert relations for the table movie_genre
    const movieGenreQueries = genreIds.map((genreId) =>
      connection.query(
        `INSERT INTO movie_genres (movie_id, genre_id) VALUES (UUID_TO_BIN(?), ?)`,
        [uuid, genreId]
      )
    );

    await Promise.all(movieGenreQueries);

    console.log('Movie Genres Inserted:', genreIds);

    return { message: 'Movie created successfully!', movieId: uuid };

  }

  static async delete ({ id }) {
    
  }

  static async update ({ id, input }) {
    
  }
}
