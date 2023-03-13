var jwt = require('jsonwebtoken');
const config = require('../config')
// const JWT_SECRET = 'lamthaboydeep@k'
const JWT_SECRET = process.env.JWT_SECRET


const fetchuser = (req, res, next) => {
    //Get the user from the jwt token and add Id to req object
    const token = req.header('auth-token')
    if (!token) {
        res.status(401).send({ error: "Please authenticate using a valid token" })
    }
    try {
        const data = jwt.verify(token, JWT_SECRET)     //here we will verify the req token with JWT_SECRET
        req.user = data.user                        // if it will verify then we will give the data to the req user
        next()
    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid token" })
    }
}

module.exports = fetchuser