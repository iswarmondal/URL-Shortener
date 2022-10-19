const jwt = require('jsonwebtoken');
require('dotenv').config()

module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorization.split(" ")[1];
        if(!token){
            res.status(200).json({success: false, message: "Error: Token not provided."});
        }
        const decodedToken = jwt.verify(token, process.env.AUTH_TOKEN_SECTRET);
        if (decodedToken) {
            next();
        }else{
            res.status(200).json({success: false, message: "Error: Token not varified."});
        }
    }catch(err){
        res.status(400).json({success: false, message: err.message});
    }
}