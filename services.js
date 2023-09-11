//------------------------------------------------------------------------------
// IMPORTING PACKAGES AND DECLARATION OF CONSTANTS
//------------------------------------------------------------------------------
const express = require("express");
const { Database } = require("sqlite3");
const sqlite3 = require("sqlite3").verbose();
const app = express();

app.use(express.json());

//app.use(express.urlencoded());
const port = 8000;
//------------------------------------------------------------------------------
// DATABASE FUNCTIONS
//------------------------------------------------------------------------------
// Initialize dataBase connection on dataBase.db with SQLite3
function openDataBaseConnection() {
  const db = new sqlite3.Database(
    "data/students.db",
    sqlite3.OPEN_READWRITE,
    (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("Connected to the SQLite database.");
      }
    }
  );
  return db;
}

function closeDataBaseConnection(dataBase) {
  dataBase.close((error) => {
    if (error) {
      console.error(error.message);
    }
    console.log("Close the database connection.");
  });
}

//------------------------------------------------------------------------------
// CREATE A DATA BASE
//------------------------------------------------------------------------------
function createStudentsTable(dataBase) {
  dataBase.run(
    "CREATE TABLE IF NOT EXISTS students(id integer PRIMARY KEY AUTOINCREMENT, firstName text, lastName text, sex text, age integer)"
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
createStudentsTable(dataBase);
closeDataBaseConnection(dataBase);
//------------------------------------------------------------------------------
// Endpoints management
//------------------------------------------------------------------------------
//----------------------- Post a new student -------------------------//
app.post("/student", (request, response) => {
  const dataBase = openDataBaseConnection();
  const { firstName, lastName, age, sex } = request.body;
  const query =
    "INSERT INTO students (firstName, lastName, age, sex) VALUES (?, ?, ?, ?);";
  const values = [firstName, lastName, age, sex];

  dataBase.run(query, values, function (err) {
    if (err) {
      console.error(err.message);
      response.status(500).json({ error: "Error creating student" });
    } else {
      const studentId = this.lastID;
      const createdStudent = {
        studentId,
        firstName,
        lastName,
        age,
        sex,
      };
      response.status(200).json({
        message: "Student created successfully",
        student: createdStudent,
      });
      console.log("A new student has been added:", createdStudent);
    }
    // Close the database connection after the operation is completed
    closeDataBaseConnection(dataBase);
  });
});
//------------------------ Get ALL students --------------------------//
app.get("/students", (request, response) => {
  const dataBase = openDataBaseConnection();
  const query = "SELECT * FROM students";

  dataBase.all(query, (err, rows) => {
    if (err) {
      console.error(err.message);
      response.status(500).json({ error: "Error retrieving students" });
    } else {
      response.status(200).json(rows);
      console.log("Here's the full list of students we got!");
    }
    // Close the database connection after the operation is completed
    closeDataBaseConnection(dataBase);
  });
});
//----------------------- Get student by ID --------------------------//
app.get("/student/:studentId", (request, response) => {
  const dataBase = openDataBaseConnection();
  const studentId = request.params.studentId;
  const query = "SELECT firstName,lastName,age,sex FROM students WHERE id=?;";
  const value = [studentId];

  dataBase.get(query, value, (err, row) => {
    if (err) {
      console.error(err.message);
      response.status(500).json({ error: "Error getting student" });
    } else {
      if (row === undefined || row === null)
        row = "no data for student with this specific id exists";
      response.status(200).json({
        message: "Getting student successful with the id = " + studentId,
        student: row,
      });
      console.log("Here's the student with the specific id = " + studentId);
    }
    // Close the database connection after the operation is completed
    closeDataBaseConnection(dataBase);
  });
});

//----------------------- Delete student --------------------------//
app.delete("/student/:studentId", (request, response) => {
  const dataBase = openDataBaseConnection();
  const studentId = request.params.studentId;
  const value = [studentId];
  const query = "DELETE FROM students WHERE id=?;";

  dataBase.run(query, value, (err, row) => {
    if (err) {
      console.error(err.message);
      response.status(500).json({
        error: "Error while trying to delete student with id=" + studentId,
      });
    } else {
      if (row === undefined || row === null)
        row = "no data for student with this specific id exists";
      response.status(200).json({
        message: "Student with the id = " + studentId + " as been deleted",
        student: row,
      });
      console.log("Student with ID = " + studentId + " successfully deleted");
    }
  });
});
//--------------------- Updating student -----------------------------
app.put("/student/updateFirstName/:studentId", (request, response) => {
  const dataBase = openDataBaseConnection();
  const studentId = request.params.studentId;
  const value = [studentId, newData];
  const newData = request.body.newData;
  const query = "UPDATE students SET firstName  WHERE id=?;";

  dataBase.run(query, value, (err, row) => {
    if (err) {
      console.error(err.message);
      return response.status(500).json({
        error: "Error while updating student with id=" + studentId,
      });
    } else {
      console.log("Updated data ${this.changes} row(?)");
      response.json({ message: "Data updated succesfully" });
    }
  });
});
//------------------------------------------------------------------------------
// Close the database connection when the server is shutting down
process.on("SIGINT", () => {
  closeDataBaseConnection(dataBase);
  process.exit();
});

process.on("SIGTERM", () => {
  closeDataBaseConnection(dataBase);
  process.exit();
});
