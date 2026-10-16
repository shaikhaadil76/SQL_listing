const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "delta_app",
  password: "@aadil.$",
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

app.get("/", (req, res) => {
  let q = `SELECT count(*)  FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      // console.log(result[0]["count(*)"]);
      res.render("home.ejs", { totalUsers: result[0]["count(*)"] });
    });
  } catch (error) {
    console.error(error);
    res.send(error);
  }
});

app.get("/user", (req, res) => {
  let q = `SELECT * FROM user`;
  try {
    connection.query(q, (err, users) => {
      if (err) throw err;
      // console.log(users);
      res.render("showusers.ejs", { users: users });
    });
  } catch (error) {
    console.error(error);
    res.send(error);
  }
});

app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  // console.log("id : ", id);
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      // console.log(result);
      res.render("edit.ejs", { user });
    });
  } catch (error) {
    console.error(error);
    res.send(error);
  }
});

app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: formpass, userName: newUsername } = req.body;
  let q = `SELECT * FROM user WHERE id = '${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      // console.log(user);
      if (formpass != user.password) {
        res.send("Password is incorrect");
      } else {
        let q2 = `UPDATE user SET userName = '${newUsername}' WHERE id = '${id}'`;
        connection.query(q2, (err, result) => {
          if (err) throw err;
          res.redirect("/user");
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.send(error);
  }
});

app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let q = `DELETE FROM user WHERE id = '${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      // res.send(`User with id ${id} deleted successfully!`);
      res.redirect("/user");
    });
  } catch (error) {
    console.error(error);
    res.send(error);
  }
});
app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/user/new", (req, res) => {
  let { username, email, password } = req.body;
  let id = uuidv4();
  //Query to Insert New User
  let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log("added new user");
      res.redirect("/user");
    });
  } catch (err) {
    res.send("some error occurred");
  }
});

app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.delete("/user/:id/", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.listen(8080, () => {
  console.log(`Server is running on http://localhost:8080/user`);
});
