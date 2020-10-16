const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require("fs-extra");
const fileUpload = require('express-fileupload');
const { ObjectId } = require('mongodb').ObjectID;
require('dotenv').config();

const port = 4800;

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('customer'));
// app.use(express.static("service"));
app.use(fileUpload());

const MongoClient = require('mongodb').MongoClient;

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.afd9x.mongodb.net:27017,cluster0-shard-00-01.afd9x.mongodb.net:27017,cluster0-shard-00-02.afd9x.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-vjl1yh-shard-0&authSource=admin&retryWrites=true&w=majority`;
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, client) {
  const customerCollection = client.db("creative-agency").collection("creative-customer");
  const reviewCollection = client.db("creative-agency").collection("customer-review");
  const adminCollection = client.db("creative-agency").collection("admin");
  const serviceCollection = client.db("creative-agency").collection("services");
  
  app.post("/addCustomer", (req, res) => {
      const newCustomer = {name: req.body.name, email: req.body.email, service: req.body.service, serviceId: req.body.serviceId, serviceDescription: req.body.serviceDescription, serviceImage : req.body.serviceImage, serviceImg: req.body.serviceImg, details: req.body.details, price: req.body.price};
      customerCollection.insertOne(newCustomer)
      .then( result => {
          res.send(result.insertedCount > 0)
      });
  });

  app.get("/orderedItems", (req, res) => {
      customerCollection.find({email: req.query.email})
      .toArray( (er, documents) => {
          res.send(documents);
      });
  });

  app.post("/addReview", (req, res) => {
      const newReview = req.body;
      reviewCollection.insertOne(newReview)
      .then( result => {
          res.send(result.insertedCount > 0);
      });
  });
  app.get("/customerReview", (req, res) => {
    reviewCollection.find({}).limit(6)
    .toArray( (er, documents) => {
        res.send(documents);
        });
    });

   app.get("/admin", (req, res) => {
       customerCollection.find({})
       .toArray( (er, documents) => {
           res.send(documents);
       });
    });

    app.post("/addService", (req, res) => {
        const file = req.files.file;
        // const filePath = `${__dirname}/service/${file.name}`;
        // file.mv(filePath, err => {
        //     if(err){
        //         console.log(err);
        //         res.status(500).send({msg: 'failed to upload'});
        //     }
            const newImg = file.data;
            const encImg = newImg.toString("base64");
            const image = {
                contentType : file.mimeType,
                size : file.size, 
                img : Buffer.from(encImg, "base64")
            };
            serviceCollection.insertOne({name: req.body.name, image: image, description: req.body.description})
            .then( result => {
                // fs.remove(filePath, ero => {
                //     if(ero){
                //         console.log(ero);
                //         res.status(500).send({msg: 'failed to upload'});
                //     }
                    res.send(result.insertedCount > 0)
                // });
            });
        // });
        
    });

    app.get("/serviceProvides", (req, res) => {
        serviceCollection.find({}).limit(6)
        .toArray( (errs, docs) => {
            res.send(docs)
        });
    });

    app.post("/addAdmin", (req, res) => {
        const newAdmin = req.body;
        adminCollection.insertOne(newAdmin)
        .then( result => {
            res.send(result.insertedCount > 0);
        });
    });

    app.post("/isAdmin", (req, res) => {
        adminCollection.find({email : req.body.email})
        .toArray((er, document) => {
            if(document.length  > 0){
                res.send(true);
            }
        });
    });

});

app.get('/', (req, res) => {
    res.send("Hello Creative Agency...");
})

app.listen(process.env.PORT || port);