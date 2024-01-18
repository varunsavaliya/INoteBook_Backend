import { Router } from "express";
import { body, validationResult } from "express-validator";
import { Messages } from "../const/messages.constants.js";
import { Routes } from "../const/route.constants.js";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";
import Note from "../models/Notes.js";
import AppError from "../utils/error.util.js";

const noteRouter = Router();

// fetch all notes of logged in user
noteRouter.get(
  `/${Routes.NOTES.FETCH_ALL_NOTES}`,
  isLoggedIn,
  async (req, res, next) => {
    try {
      const notes = await Note.find({ user: req.id }).select("-user");
      res.status(200).json({
        success: true,
        message: Messages.SUCCESS.NOTES_FETCHED,
        data: notes,
      });
    } catch (error) {
      return next(new AppError(error.message, 400));
    }
  }
);

// add new note
noteRouter.post(
  `/${Routes.NOTES.ADD_NOTE}`,
  isLoggedIn,
  [
    body("title", Messages.ERRORS.NOTE.TITLE_LENGTH).isLength({ min: 3 }),
    body("description", Messages.ERRORS.NOTE.DESCRIPTION_LENGTH).isLength({
      min: 10,
    }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { title, description, tag } = req.body;
    try {
      const note = await Note.create({
        user: req.id,
        title,
        description,
        tag,
      });
      res.status(200).json({
        success: true,
        message: Messages.SUCCESS.NOTE_ADDED,
        data: note,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// update note
noteRouter.put(
  `/${Routes.NOTES.UPDATE_NOTE}/:id`,
  isLoggedIn,
  async (req, res, next) => {
    const userId = req.id;
    try {
      let note = await Note.findById(req.params.id);
      if (!note) {
        return next(new AppError(Messages.ERRORS.NOTE.NOT_FOUND, 404));
      }
      if (note.user.toString() !== userId) {
        return next(new AppError(Messages.ERRORS.USER_NOT_AUTHORIZED, 401));
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
      res.status(200).json({
        success: true,
        message: Messages.SUCCESS.NOTE_UPDATED,
        data: note,
      });
    } catch (error) {
      return next(new AppError(error.message, 400));
    }
  }
);

// delete note
noteRouter.delete(
  `/${Routes.NOTES.DELETE_NOTE}/:id`,
  isLoggedIn,
  async (req, res, next) => {
    const userId = req.id;
    try {
      let note = await Note.findById(req.params.id);
      if (!note) {
        return next(new AppError(Messages.ERRORS.NOTE.NOT_FOUND, 404));
      }
      if (note.user.toString() !== userId) {
        return next(new AppError(Messages.ERRORS.USER_NOT_AUTHORIZED, 401));
      }

      note = await Note.findByIdAndDelete(req.params.id);
      return res.status(200).json({
        success: true,
        message: Messages.SUCCESS.NOTE_DELETED,
      });
    } catch (error) {
      return next(new AppError(error.message, 400));
    }
  }
);

// get note by id
noteRouter.get(
  `/${Routes.NOTES.GET_NOTE_BY_ID}/:id`,
  isLoggedIn,
  async (req, res, next) => {
    const userId = req.id;
    try {
      let note = await Note.findById(req.params.id);
      if (!note) {
        return next(new AppError(Messages.ERRORS.NOTE.NOT_FOUND, 404));
      }
      if (note.user.toString() !== userId) {
        return next(new AppError(Messages.ERRORS.USER_NOT_AUTHORIZED, 401));
      }

      return res.status(200).json({ data: note });
    } catch (error) {
      return next(new AppError(error.message, 400));
    }
  }
);

export default noteRouter;
