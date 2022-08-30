const express = require("express");
const mongodb = require("mongodb");
const path = require("path");

const app = express();

// inbuilt in express to recognize the incoming Request Object as strings or arrays
app.use(express.urlencoded({ extended: true }));

//tell express that all the static assets can be found in directories images and CSS
app.use(express.static("public/imgs"));
app.use(express.static("public/css"));
//To use multiple static assets directories, call the express.static middleware function multiple times

//configure the Express app to handle the engine
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.listen(8081);

//Reference MongoDB client
const MongoClient = mongodb.MongoClient;
//The URL to the MongoDB server
const url = "mongodb://localhost:27017/";
//reference to the database
let db;
//Connect our app to the MongoDB server:
MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
  if (err) {
    console.log("Err  ", err);
  } else {
    console.log("Connected successfully to server");
    db = client.db("fit2095parcels");
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

app.get("/addparcel", (req, res) => {
  res.sendFile(path.join(__dirname, "views/newparcel.html"));
});

app.get("/listparcels", function (req, res) {
  db.collection("parcels")
    .find()
    .toArray(function (err, data) {
      if (err) {
        console.log("unsuccessful");
      } else {
        res.render("listparcels", { parcels: data });
      }
    });
});

app.get("/listvaluableparcels", function (req, res) {
  let query = {cost: {$gt: 50}, fragile: "yes"};
  db.collection("parcels")
    .find(query)
    .toArray(function (err, data) {
      if (err) {
        console.log("unsuccessful");
      } else {
        res.render("listvaluableparcels", { parcels: data });
      }
    });
});

app.get("/delparcel", function (req, res) {
  res.sendFile(path.join(__dirname, "views/delbyid.html"));
});

app.get("/updateparcel", function (req, res) {
  res.sendFile(path.join(__dirname, "views/updateparcel.html"));
});

app.post("/newparcel", function (req, res) {
  if (
    req.body.sender.length < 3 ||
    req.body.address.length < 3 ||
    req.body.weight < 0
  ) {
    res.sendFile(path.join(__dirname, "views/invaliddata.html"));
  } else {
    let aParcel = req.body;
    aParcel.cost = parseInt(aParcel.cost);
    // let cost = parseInt(aParcel.cost);
    // aParcel.cost = cost.toLocaleString('en-US', {
    //   style: 'currency',
    //   currency: 'USD',
    // });
    db.collection("parcels").insertOne(aParcel);
    res.redirect("/listparcels");
  }
});
// What is const VAR let?
// The scope of a var variable is functional scope. The scope of a let variable is block scope. The scope of a const variable is block scope

app.post("/delparcel", function (req, res) {
  let id = req.body.id;
  db.collection("parcels").deleteOne({ _id: mongodb.ObjectId(id) });
  res.redirect("/listparcels");
});

app.post("/updateparcel", function (req, res) {
  let aParcel = req.body;
  let id = aParcel.id;
  aParcel.cost = parseInt(aParcel.cost);
  // let cost = parseInt(aParcel.cost);
  // aParcel.cost = cost.toLocaleString('en-US', {
  //   style: 'currency',
  //   currency: 'USD',
  // });
  db.collection("parcels").updateOne(
    { _id: mongodb.ObjectId(id) },
    {
      $set: {
        sender: aParcel.sender,
        address: aParcel.address,
        weight: aParcel.weight,
        fragile: aParcel.fragile,
        cost: aParcel.cost
      },
    }
  );
  res.redirect("/listparcels");
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "views/404.html"));
});
