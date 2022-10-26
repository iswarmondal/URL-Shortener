const express = require('express');
const mongoose = require('mongoose');
const app = express();
const ShortURL = require('./models/shortURL');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const auth = require('./middlewares/auth');
require('dotenv').config()

mongoose.connect('mongodb://localhost:27017/urlShortener');

app.set('view engine', 'ejs');
app.use("/public", express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: true}));
app.use(express.json())

const PORT = process.env.PORT || 4000;

app.get('/', async (req, res) => {
    const allShortURL = await ShortURL.find();
    res.render('index', {allShortURL});
})


app.post('/short-that-url', async (req, res) => {
    console.log(req.body);
    await ShortURL.create({ fullURL: req.body.fullURL });
    res.redirect('/');
})

app.get('/:shortURL', async (req, res)=>{
    const shortURL = await ShortURL.findOne({shortURL: req.params.shortURL});
    if (shortURL == null) return res.send("404 NOT FOUND!!!").status(404);

    shortURL.clicks++;
    shortURL.save();

    res.redirect(shortURL.fullURL);

})

app.get("/user/urls", auth, (req, res) => {
    res.status(200).json(req.user);
})

app.get('/user/register', (req, res) => {
    res.render('register')
})

app.post('/api/user/register', async (req, res) =>{
    const {username, password, email} = req.body;
    if(password && username ){
        const hash = await bcrypt.hash(`${password}`, 10); // converted password into a string

        const user = new User({
            username,
            email,
            password: hash
        })
        try{
            const saveUser = await user.save();
            res.status(200).send(saveUser);
        }catch(err){
            res.status(400).send({"message": err.message});
        }
    }

})

app.post("/api/user/check-username", async (req, res) => {
    const {username} = req.body;
    const isExsist = await User.findOne({username});
    
    if(isExsist === null || isExsist === undefined) {
        res.status(200).json({"success": true, "message":"Username is not been used by someone else"});
    }else{
        res.status(200).json({"success": false, "message":"Error: Username already exists"});
    }
})

app.get("/user/login", (req, res)=>{
    res.render("login")
})

app.post("/api/user/login", async (req, res)=>{
    const {username, password} = req.body;
    if(password != undefined && username){
        const user = await User.findOne({username});
        const isVarified = await bcrypt.compare(`${password}`, user.password);

        if(isVarified){
            const token = jwt.sign({ _id: user._id }, process.env.AUTH_TOKEN_SECTRET);
            res.status(200).json({authToken: token});
        }else{
            res.status(403).send("login failed");
        }

    }else{
        res.status(403).send("Login failed");
    }
})

app.listen(PORT, ()=>console.log(`listening on port ${PORT}`));