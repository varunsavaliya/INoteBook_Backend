import { Router } from "express";
import { body, validationResult } from "express-validator";
import { ErrorMessages } from "../const/error.messages.constants.js";
import { Routes } from "../const/route.constants.js";
import isLoggedIn from "../middlewares/isLoggedIn.js";
import Note from "../models/Notes.js";

const noteRouter = Router();

// fetch all notes of logged in user
noteRouter.get(
  `/${Routes.NOTES.FETCH_ALL_NOTES}`,
  isLoggedIn,
  async (req, res) => {
    try {
      const notes = await Note.find({ user: req.id }).select("-user");
      res.status(200).json({ data: notes });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// add new note
noteRouter.post(
  `/${Routes.NOTES.ADD_NOTE}`,
  isLoggedIn,
  [
    body("title", ErrorMessages.NOTE.TITLE_LENGTH).isLength({ min: 3 }),
    body("description", ErrorMessages.NOTE.DESCRIPTION_LENGTH).isLength({
      min: 10,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, description, tag } = req.body;
    try {
      const note = await Note.create({
        user: req.id,
        title,
        description,
        tag,
      });
      res.status(200).json({ data: note });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// update note
noteRouter.put(
  `/${Routes.NOTES.UPDATE_NOTE}/:id`,
  isLoggedIn,
  async (req, res) => {
    const userId = req.id;
    try {
      let note = await Note.findById(req.params.id);
      if (!note) {
        res.status(404).json({ error: ErrorMessages.NOTE.NOT_FOUND });
      }
      if (note.user.toString() !== userId) {
        res.status(401).json({ error: ErrorMessages.USER_NOT_AUTHORIZED });
      }

      const { title, description, tag } = req.body;
      let updatedNote = {};
      if (title) updatedNote.title = title;
      if (description) updatedNote.description = description;
      if (tag) updatedNote.tag = tag;
      note = await Note.findByIdAndUpdate(
        req.params.id,
        { $set: updatedNote },
        { new: true }
      );
      res.status(200).json({ data: note });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// delete note
noteRouter.delete(
  `/${Routes.NOTES.DELETE_NOTE}/:id`,
  isLoggedIn,
  async (req, res) => {
    const userId = req.id;
    try {
      let note = await Note.findById(req.params.id);
      if (!note) {
        res.status(404).json({ error: ErrorMessages.NOTE.NOT_FOUND });
      }
      if (note.user.toString() !== userId) {
        res.status(401).json({ error: ErrorMessages.USER_NOT_AUTHORIZED });
      }

      note = await Note.findByIdAndDelete(req.params.id);
      res.status(200).json({ data: note });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default noteRouter;
