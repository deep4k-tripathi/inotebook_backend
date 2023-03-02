const express = require('express')
const router = express.Router()
var fetchuser = require('../middleware/fetchuser')
const Notes = require('../models/Notes');         //sir changed it to Note
const { body, validationResult } = require('express-validator');

//ROUTE 1:Fetch all notes using : GET "/api/notes/fetchallnotes". Login Required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id })
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

//ROUTE 2:Adding a new note using using : POST "/api/notes/addnote". Login Required
router.post('/addnotes', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 1 }),
    body('description', 'Description should atleast contain 5 letters').isLength({ min: 5 })
], async (req, res) => {

    try {
        const { title, description, tag } = req.body

        // If there are errors, return bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Notes({
            title, description, tag, user: req.user.id
        })

        const savedNote = await note.save()

        res.json(savedNote)

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

//ROUTE 3:Update an existing note using using : PUT "/api/notes/updatenote". Login Required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    try {
        const { title, description, tag } = req.body
        //create a newNote object
        const newNote = {};
        if (title) { newNote.title = title }
        if (description) { newNote.description = description }
        if (tag) { newNote.tag = tag }

        //Find the note to be updated and update it
        let note = await Notes.findById(req.params.id)
        if (!note) {     //checks weather the note even exists
            return res.status(404).send("Not Found")
        }

        //Allows update only if user owns the note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        }

        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

})

//ROUTE 4:Delete an existing note using using : DELETE "/api/notes/updatenote". Login Required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        //Find the note to be deleted and delete it
        let note = await Notes.findById(req.params.id)
        if (!note) {     //checks weather the note even exists
            return res.status(404).send("Not Found")
        }

        //Allow delete only if user owns this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        }

        note = await Notes.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note is deleted successfully", note: note })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

})
module.exports = router