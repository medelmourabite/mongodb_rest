var express = require("express");
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
var bodyParser = require("body-parser");

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

const PORT = Number(process.env.PORT || 3003);
 const DB_URL = "mongodb://localhost:27017";
//const DB_URL =  "mongodb+srv://username:password@url/db_name?retryWrites=true";
const DB_NAME = "onshor_db";
var db;

let entities = [
  "books",
  "chapters",
  "authors",
  "users",
  "questions",
  "answers",
  "comments",
  "advertisers"
];

MongoClient.connect(
  DB_URL,
  function(err, client) {
    if (err) throw err;
    db = client.db(DB_NAME);
    app.listen(PORT);
    console.log("Server running > ", "http://localhost:" + PORT);
  }
);

entities.forEach(entity => {
  //find All
  app.get("/api/" + entity, function(req, res) {
    console.log("Getting", entity);
    db.collection(entity)
      .find()
      .toArray(function(err, result) {
        if (err) throw err;
        return res.status(200).json({ result });
      });
  });

  //find by Id
  app.get("/api/" + entity + "/:id", function(req, res) {
    var _id = req.params.id;
    db.collection(entity).findOne(ObjectId(_id), (err, result) => {
      if (err) {
        console.log(err);
        return res.status(503).json({ err });
      } else {
        console.log("Result", result);
        return res.status(200).json({ result });
      }
    });
  });

  //find By Query
  app.post("/api/query/" + entity, function(req, res) {
    const query = req.body.query ? req.body.query : {};
    db.collection(entity)
      .find(query)
      .toArray(function(err, result) {
        if (err) throw err;
        return res.status(200).json({ result });
      });
  });

  app.post("/api/" + entity, function(req, res) {
    console.log(req.body);

    let item = req.body.item;
    db.collection(entity).insertOne(item, function(err, result) {
      if (err) return res.status(505).json({ result: false });
      else return res.status(200).json({ result:result.insertedId });
    });
  });

  app.put("/api/" + entity + "/:id", function(req, res) {
    let item = req.body.item;
    var _id = req.params.id;
    console.log("Updating", _id, item);
    db.collection(entity).updateOne(
      { _id: ObjectId(_id) },
      { $set: { item } },
      function(err, result) {
        if (err) {
          return res.status(505).json({ result });
        } else return res.status(200).json({ result });
      }
    );
  });

  app.delete("/api/" + entity + "/:id", function(req, res) {
    var _id = req.params.id;
    console.log("Deleting", _id);
    db.collection(entity).deleteOne( {_id: ObjectId(_id)}, function(
      err,
      result
    ) {
      if (err) {
        return res.status(505).json({ result });
      } else return res.status(200).json({ result });
    });
  });
});
