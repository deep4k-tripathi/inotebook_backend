const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { genSalt } = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser')

const JWT_SECRET = 'lamthaboydeep@k'

//ROUTE 1:Create a User using : POST "/api/auth/createuser". No Login Required
router.post('/createuser', [
    body('name', 'Name should atleast contain 3 letters').isLength({ min: 3 }),
    body('email', 'Invalid email').isEmail(),
    body('password', 'too short(min 5 char').isLength({ min: 5 })
], async (req, res) => {

    let success=false

    // If there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success,errors: errors.array() });
    }

    // Check whether the user with the same email exists
    try {

        let user = await User.findOne({ email: req.body.email })
        console.log(user) //it will show the user of which the email already exists
        if (user) {
            return res.status(404).json({success, error: "Sorry user with the same email already exist" })
        }

        //securing password using bcryptjs npm package
        const salt = await genSalt(10)
        const secPass = await bcrypt.hash(req.body.password, salt)

        // creates a new user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass //secured password
        })

        const data = {
            user: {
                id: user.id  //for unique and fast token generation since id is a unique element
            }
        }

        // Authorisation Token generation
        const authToken = jwt.sign(data, JWT_SECRET)

        // res.json(user)
        success=true
        res.json({success, authToken })


    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})

//ROUTE 2:Authenticate a User using : POST "/api/auth/createuser". No Login Required

router.post('/login', [
    body('email', 'Invalid email').isEmail(),
    body('password', 'Password cannot be empty').exists()
], async (req, res) => {

    let success=false

    // If there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success,errors: errors.array() });
    }

    const { email, password } = req.body
    try {
        let user = await User.findOne({ email }) //checking weather the email exists in the db or not
        if (!user) {
            return res.status(404).json({success, error: "Please login with correct credentials" })
        }

        const passwordCompare = await bcrypt.compare(password, user.password)
        if (!passwordCompare) {
            return res.status(404).json({ success,error: "Please login with correct credentials" })
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET)
        success=true
        res.json({success, authToken })

    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})

//ROUTE 3:Get logged in User's details using : POST "/api/auth/getuser". Login Required

router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id
        const user = await User.findById(userId).select("-password")
        res.send(user)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }

})


module.exports = router