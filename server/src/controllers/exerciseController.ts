import { Request, Response } from 'express';
import Exercise from '../models/Exercise.js';

export const getExercises = async (req: Request, res: Response) => {
  try {
    const exercises = await Exercise.find();
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getExerciseById = async (req: Request, res: Response) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    res.json(exercise);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
