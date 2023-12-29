const express = require("express");
const app = express();
module.exports = app;
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db = null;
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

const initializationDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initializationDBAndServer();

const conversionSnakeToCamel = (movie) => {
  return {
    movieName: movie.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT * FROM movie ORDER BY movie_id;`;
  const movieArray = await db.all(getMoviesQuery);

  const responseList = movieArray.map((eachMovie) =>
    conversionSnakeToCamel(eachMovie)
  );
  response.send(responseList);
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie 
   WHERE movie_id = ${movieId};`;

  const movie = await db.get(getMovieQuery);
  response.send({
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  });
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const postQuery = `INSERT INTO movie (director_id , movie_name , lead_actor) 
    VALUES 
    (
        ${directorId} ,
        '${movieName}' , 
        '${leadActor}'
    );`;

  await db.run(postQuery);
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async (request, response) => {
  const movieDetails = request.body;
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = movieDetails;

  const putQuery = `UPDATE movie SET 
        director_id = ${directorId},
        movie_name = '${movieName}' ,
        lead_actor = '${leadActor}' 

        WHERE movie_id = ${movieId};
    `;

  await db.run(putQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteQuery = `
        DELETE FROM movie WHERE movie_id = ${movieId};
    
    `;

  await db.run(deleteQuery);
  response.send("Movie Removed");
});

const conversionToCamelCase = (director) => {
  return {
    directorId: director.director_id,
    directorName: director.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
        SELECT * FROM director;
    `;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) => conversionToCamelCase(eachDirector))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  console.log(directorId);
  const getDirectorMovieQuery = ` 
        SELECT * FROM movie WHERE director_id = ${directorId};
    `;

  const movies = await db.all(getDirectorMovieQuery);
  response.send(movies.map((eachMovie) => conversionSnakeToCamel(eachMovie)));
});
