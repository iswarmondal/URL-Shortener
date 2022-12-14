const functions = require("firebase-functions");
const db  = require("./firestore");
const express = require("express");
const app = express();
const ShortURL = require("../models/shortURL");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
require("dotenv").config();
const cors = require("cors");
const shortid = require("shortid");
const {FieldValue} = require("firebase-admin/firestore")

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// === ROOT ROUTE ===
app.get("/", (req, res) => {
  res.json({ msg: "working" });
});

// === ADD NEW USER ===
app.post("/register", async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  if (password && email && confirmPassword && (password === confirmPassword)) {

    const hash = await bcrypt.hash(`${password}`, 10); // converted password into a string
    
    const user = {
      "email": email.toString(),
      "password": hash
    };
    try {
      // IF THE EMAIL ALREADY USED
      const snapshot = await db.collection("users").where('email', '==', user.email).get();
      if (!(snapshot.empty)) {
        res.json({ success: false, message: "Email id is already in use" });
        return;
      }

      // IF EMAIL IS NOT USED, THEN REGISTER NEW USER
      const result = await db.collection("users").add(user);
      res.status(200).json({ success: true, message: "New user added", id: result.id })
    } catch (err) {
      res.status(400).send({ "message": err.message });
    }
  }else{

    // ANY PROBLEM WITH REQUEST BODY
    res.json({success: false, message: "Problem with email or password"});
  }
});

// === LOGIN USER ===
app.post("/login", async (req, res)=>{
  const {email, password} = req.body;
  if(email && password){
    const userInTheDatabase = await db.collection("users").where("email", "==", email).get();

    // IF THE USER DON'T EXIST
    if (userInTheDatabase.empty) {
      res.json({ success: false, message: "User not found, please register" });
      return;
    }

    userInTheDatabase.forEach(doc => {
      data = doc.data();
      id = doc.id;
    });
    const databasePassword = data.password;
    const userId = id;

    // VERIFY THE PASSWORD
    const isVerified = await bcrypt.compare(`${password}`, databasePassword);

    if (isVerified) {
      const token = jwt.sign({ _id:  userId}, process.env.AUTH_TOKEN_SECRET);
      res.status(200).json({ success: true, authToken: `Barer ${token}` });
    } else {
      // IF NOT VERIFIED
      res.status(403).json({ success: false, message: "Unable to login the user" });
    }
  }else{

    // ANY PROBLEM WITH REQUEST BODY
    res.json({ success: false, message: "Invalid email or password" });
  }
})

// === SHORT A URL ===
app.post('/short-that-url', auth, async (req, res) => {
  const owner = req.user._id;
  
  if (req.body.fullURL !== undefined && req.body.fullURL !== null) {

    // IF THE USER DOES NOT EXIST
    let document = await db.collection("users").doc(`${owner}`).get();
    if (!(document.exists)) {
      res.json({ success: false, message: "The user not found" });
      return;
    }

    const urlString = `${req.body.fullURL}`;
    
    const data = {
      fullURL: urlString,
      shortURL: shortid.generate(),
      owner,
      dateOfCreation: new Date().getTime(),
      analytics:{
        totalClicks: 0
      }
    };
    try {
      const result = await db.collection("urls").add(data);
      res.status(200).json({ success: true, message: "New url added", id: result.id, owner })
    } catch (err) {
      res.status(400).send({ "message": err.message });
    }
  } else {
    // ANY PROBLEM WITH REQUEST BODY
    res.json({ success: false, message: "Problem with your URL" });
  }
})

// === FORWARDING ===
app.get("/go/:shortURL", async (req, res)=>{
  const shortURL = req.params.shortURL;
  const snapshot = await db.collection("urls").where("shortURL", "==", shortURL).get();
  if(snapshot.empty){
    res.status(404).json({success: false, message: "No URL found"});
    return;
  }else{
    var data;
    snapshot.forEach(doc=>{
      data = doc.data();
      data.id = doc.id;
    })
    let fullURL = data.fullURL;
    let analytics = data.analytics;
    
    await db.collection("urls").doc(data.id).update({
      "analytics.totalClicks": FieldValue.increment(1)
    })
    res.redirect(fullURL);
  }
})

exports.api = functions.https.onRequest(app);