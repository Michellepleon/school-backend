//------------------------------------------------------------------------------
// IMPORTING PACKAGES AND DECLARATION OF CONSTANTS
//------------------------------------------------------------------------------
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();

app.use(express.json());

//app.use(express.urlencoded());
const port = 8080;
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

app.get("/students", (request, response) => {
  const dataBase = openDataBaseConnection();
  const query = "SELECT * FROM students";

  dataBase.all(query, (err, rows) => {
    if (err) {
      console.error(err.message);
      response.status(500).json({ error: "Error retrieving students" });
    } else {
      response.json(rows);
      console.log("Here's the full list of students we got!");
    }
    // Close the database connection after the operation is completed
    closeDataBaseConnection(dataBase);
  });
});

app.delete("/student/:id", (request, response) => {
  const dataBase = openDataBaseConnection();
  const student = student.find((c) => c.Id === parseInt(request.params.Id));
  if (!student) return response.status(404).send("Student not found");

  const index = student.indexOf(student);
  student.splice(index, 1);
  response.send(student);
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
