const jwt = require('jsonwebtoken');
require('dotenv').config()

module.exports = (req, res, next) => {
    try{
        req.headers.authorization ? token = req.headers.authorization.split(" ")[1] : token = undefined;

        if(token === undefined || token === null){
            return res.status(200).json({success: false, message: "Error: Token not provided (01)."});
        }
        jwt.verify(token, process.env.AUTH_TOKEN_SECTRET, function (err, data) {
            if (err) {
                return res.status(500).json({ success: false, message: "Error: Token not varified." });
            }
            req.user = data;
            next();
        });
    }catch(err){
        res.status(400).json({success: false, message: err.message});
    }
}