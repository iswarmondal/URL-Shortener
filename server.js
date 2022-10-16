const express = require('express');
const mongoose = require('mongoose');
const app = express();
const Schema = require('./models/shortURL');

mongoose.connect('mongodb://localhost:27017/urlShortener');

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

const PORT = process.env.PORT || 4000;

app.get('/', async (req, res) => {
    const allShortURL = await Schema.find();
    res.render('index', {allShortURL});
})


app.post('/short-that-url', async (req, res) => {
    console.log(req.body);
    await Schema.create({ fullURL: req.body.fullURL });
    res.redirect('/');
})

app.get('/:shortURL', async (req, res)=>{
    const shortURL = await Schema.findOne({shortURL: req.params.shortURL});
    if (shortURL == null) return res.send("404 NOT FOUND!!!").status(404);

    shortURL.clicks++;
    shortURL.save();

    res.redirect(shortURL.fullURL);

})

app.listen(PORT, ()=>console.log(`listening on port ${PORT}`));