const express = require('express');
const mongoose = require('mongoose');
const app = express();
const ShortURL = require('./models/shortURL');
const bcrypt = require('bcrypt');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/urlShortener');

app.set('view engine', 'ejs');
app.use("/public", express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: true}));

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

app.post('/api/user/register', async (req, res) =>{
    console.log(req.body);
    const {username, email, password} = req.body;
    if(password && username && email){
        const hash = bcrypt.hash(password);
    
        const user = new User({
            username,
            email,
            password: hash
        })
        try{
            const saveUser = await user.save();
            res.send(saveUser);
        }catch(err){
            res.status(400).send({"message": err.message});
        }
    }

})

app.listen(PORT, ()=>console.log(`listening on port ${PORT}`));