import { Request, Response } from 'express';
import Skill from '../models/Skill.js';
import UserMastery from '../models/UserMastery.js';

export const getSkills = async (req: Request, res: Response) => {
  try {
    const skills = await Skill.find();
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSkillById = async (req: Request, res: Response) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    res.json(skill);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserMastery = async (req: any, res: Response) => {
  try {
    const mastery = await UserMastery.find({ userId: req.user.id });
    res.json(mastery);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateMasteryPoints = async (req: any, res: Response) => {
  try {
    const { skillId, points } = req.body;
    const userId = req.user.id;

    let mastery = await UserMastery.findOne({ userId, skillId });

    if (!mastery) {
      mastery = new UserMastery({ userId, skillId, currentPoints: points });
    } else {
      mastery.currentPoints += points;
      mastery.lastTrained = new Date();
    }

    // Logic to check for level up based on Skill model definitions
    const skill = await Skill.findOne({ name: skillId }); // Or by ID if skillId is ID
    if (skill) {
      const nextLevel = skill.masteryLevels.find(l => l.level === mastery.currentLevel + 1);
      if (nextLevel && mastery.currentPoints >= nextLevel.pointsRequired) {
        mastery.currentLevel += 1;
      }
    }

    await mastery.save();
    res.json(mastery);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
