//------------------------------------------------------------------------------
// IMPORTING PACKAGES AND DECLARATION OF CONSTANTS
//------------------------------------------------------------------------------
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const app = express();
app.use(express.json());
app.use(express.urlencoded());
const port = 9000;
//------------------------------------------------------------------------------
// DATABASE FUNCTIONS
//------------------------------------------------------------------------------
// Initialize dataBase connection on dataBase.db with SQLite3
function openDataBaseConnection() {
  let dataBase = new sqlite3.Database(
    path.join(__dirname + "/data/dataBase.db"),
    "OPEN_READWRITE | OPEN_CREATE",
    (error) => {
      if (error) {
        return console.error(error.message);
      }
      console.log("Connected to the dataBase.db SQlite database.");
    }
  );
  return dataBase;
}

function closeDataBaseConnection(dataBase) {
  dataBase.close((error) => {
    if (error) {
      console.error(error.message);
    }
    console.log("Close the database connection.");
  });
}

function createDataBaseTable(dataBase) {
  dataBase.run(
    "CREATE TABLE IF NOT EXISTS Students(id INTEGER PRIMARY KEY AUTOINCREMENT, firstName text, lastName text, sex text, age integer)"
  );
}

function insertIntoDataBaseTable(dataBase, newObjectData) {
  dataBase.run(
    `INSERT INTO Students(firstName, lastName,  sex, age) VALUES(?,?,?,?)`,
    [
      newObjectData.firstName,
      newObjectData.lastName,
      newObjectData.sex,
      newObjectData.age,
    ]
  );
}
//------------------------------------------------------------------------------
// INITIALIZING THE LISTEN ON PORT WITH EXPRESS APP
//------------------------------------------------------------------------------
app.listen(port, () => {
  console.log("The API is now listening on port " + port + " on localhost!");
});
//------------------------------------------------------------------------------
// DATA BASE
//------------------------------------------------------------------------------
// create dataBase, connect to it and then create a Students table inside of it
const dataBase = openDataBaseConnection();
createDataBaseTable(dataBase);
//------------------------------------------------------------------------------
// Endpoints management
//------------------------------------------------------------------------------
app.post("/student", (request, response) => {
  // Process your data and perform any necessary operations
  const requestBody = request.body;

  console.log("A new student as been added!");

  insertIntoDataBaseTable(dataBase, requestBody);
  // Create the response object
  const responseBody = {
    message: "Created successfully",
    data: requestBody,
  };

  // Send the response with HTTP code 201 and the JSON body
  response.status(201).json(responseBody);
});

app.get("/students", (request, response) => {
  const responseBody = response.body;

  console.log("Here's the full list of students we got!");
  response.sendStatus(200);
});
