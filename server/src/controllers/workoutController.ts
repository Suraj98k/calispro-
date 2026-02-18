import { Request, Response } from 'express';
import Workout from '../models/Workout.js';

export const getWorkouts = async (req: any, res: Response) => {
  try {
    const workouts = await Workout.find({
      $or: [
        { isGlobal: true },
        { creatorId: req.user.id },
      ],
    });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getWorkoutById = async (req: any, res: Response) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    if (!workout.isGlobal && String(workout.creatorId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'You do not have access to this workout' });
    }
    res.json(workout);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createWorkout = async (req: any, res: Response) => {
  try {
    const { name, description, imageUrl, level, exercises, durationEstimate } = req.body;
    
    // Freemium limit check
    if (req.user.plan === 'free') {
      const customWorkoutCount = await Workout.countDocuments({ 
        creatorId: req.user.id,
        isGlobal: false 
      });
      
      if (customWorkoutCount >= 3) {
        return res.status(403).json({ 
          message: 'Personal limit reached: Free users can only create up to 3 custom workouts. Upgrade to Pro for unlimited training protocols.' 
        });
      }
    }

    const workout = new Workout({
      name,
      description,
      imageUrl,
      level,
      exercises,
      durationEstimate,
      creatorId: req.user.id,
      isGlobal: false
    });

    await workout.save();
    res.status(201).json(workout);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
