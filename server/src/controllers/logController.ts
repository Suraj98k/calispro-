import { Response } from 'express';
import WorkoutLog from '../models/WorkoutLog.js';
import UserMastery from '../models/UserMastery.js';
import Skill from '../models/Skill.js';

const DAY_MS = 24 * 60 * 60 * 1000;

const toUtcDayStart = (input: Date) => {
  const date = new Date(input);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

export const logWorkout = async (req: any, res: Response) => {
  try {
    const {
      sessionType = 'workout',
      workoutId,
      skillId,
      exerciseId,
      sessionName,
      durationActual,
      notes,
      xpGained,
      exercises = []
    } = req.body;
    const userId = req.user.id;

    if (sessionType === 'workout' && !workoutId) {
      return res.status(400).json({ message: 'workoutId is required for workout sessions' });
    }
    if (sessionType === 'skill' && !skillId) {
      return res.status(400).json({ message: 'skillId is required for skill sessions' });
    }
    if (sessionType === 'exercise' && !exerciseId) {
      return res.status(400).json({ message: 'exerciseId is required for exercise sessions' });
    }

    const log = new WorkoutLog({
      userId,
      sessionType,
      workoutId,
      skillId,
      exerciseId,
      sessionName,
      durationActual,
      notes,
      xpGained,
      exercises
    });

    await log.save();

    if (sessionType === 'workout') {
      // Logic to distribute XP across skills for workout sessions.
      for (const exLog of exercises) {
        // Find the skill(s) that this exercise belongs to
        const relevantSkills = await Skill.find({
          'masteryLevels.unlockedExercises': exLog.exerciseId
        });

        for (const skill of relevantSkills) {
          let mastery = await UserMastery.findOne({ userId, skillId: skill.name });

          if (!mastery) {
            mastery = new UserMastery({
              userId,
              skillId: skill.name,
              currentPoints: 0,
              currentLevel: 0
            });
          }

          // Dynamic XP Calculation
          // 5 XP base per exercise + 2 XP per rep OR 0.1 XP per second
          const earnedXP = 5 + (exLog.repsCompleted || 0) * 2 + (exLog.durationCompleted || 0) * 0.1;

          mastery.currentPoints += Math.round(earnedXP);
          mastery.lastTrained = new Date();

          // Check for level up
          const nextLevel = skill.masteryLevels.find(l => l.level === mastery.currentLevel + 1);
          if (nextLevel && mastery.currentPoints >= nextLevel.pointsRequired) {
            mastery.currentLevel += 1;
          }

          await mastery.save();
        }
      }
    }

    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getHistory = async (req: any, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    const history = await WorkoutLog.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(Number(limit));
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStreakStats = async (req: any, res: Response) => {
  try {
    const logs = await WorkoutLog.find({ userId: req.user.id })
      .select('date')
      .sort({ date: 1 });

    const uniqueDayStarts = Array.from(
      new Set(logs.map((entry) => toUtcDayStart(new Date(entry.date))))
    ).sort((a, b) => a - b);

    if (!uniqueDayStarts.length) {
      return res.json({
        currentStreak: 0,
        longestStreak: 0,
        totalActiveDays: 0,
        hasTrainedToday: false,
        lastActiveDate: null,
      });
    }

    let longestStreak = 1;
    let rolling = 1;
    for (let i = 1; i < uniqueDayStarts.length; i += 1) {
      if (uniqueDayStarts[i] - uniqueDayStarts[i - 1] === DAY_MS) {
        rolling += 1;
      } else {
        rolling = 1;
      }
      if (rolling > longestStreak) longestStreak = rolling;
    }

    const todayStart = toUtcDayStart(new Date());
    const yesterdayStart = todayStart - DAY_MS;
    const lastDayStart = uniqueDayStarts[uniqueDayStarts.length - 1];
    const hasTrainedToday = lastDayStart === todayStart;

    let currentStreak = 0;
    if (lastDayStart === todayStart || lastDayStart === yesterdayStart) {
      currentStreak = 1;
      for (let i = uniqueDayStarts.length - 1; i > 0; i -= 1) {
        if (uniqueDayStarts[i] - uniqueDayStarts[i - 1] === DAY_MS) {
          currentStreak += 1;
        } else {
          break;
        }
      }
    }

    res.json({
      currentStreak,
      longestStreak,
      totalActiveDays: uniqueDayStarts.length,
      hasTrainedToday,
      lastActiveDate: new Date(lastDayStart).toISOString(),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteHistoryEntry = async (req: any, res: Response) => {
  try {
    const deleted = await WorkoutLog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'History entry not found' });
    }

    res.json({ message: 'History entry deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAllHistory = async (req: any, res: Response) => {
  try {
    const result = await WorkoutLog.deleteMany({ userId: req.user.id });
    res.json({
      message: 'History cleared',
      deletedCount: result.deletedCount || 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
