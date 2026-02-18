import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Skill from '../models/Skill.js';
import Exercise from '../models/Exercise.js';
import Workout from '../models/Workout.js';

// Comprehensive exercise and skill library for seeding

const mockExercises = [
  // PULL CATEGORY
  {
    name: 'Pull Up',
    description: 'Standard vertical pull for building back and bicep strength.',
    category: 'Pull',
    level: 'Beginner',
    instructions: [
      'Hang from the bar with an overhand grip, slightly wider than shoulder width.',
      'Engage your lats and pull your chest toward the bar.',
      'Ensure your chin clears the bar at the top.',
      'Lower yourself back down with full control until arms are straight.'
    ],
    primaryMuscles: ['Lats', 'Biceps'],
    secondaryMuscles: ['Rhomboids', 'Forearms'],
    formTips: ['Keep your core tight to prevent swinging.', 'Depress your scapula before starting the pull.'],
    commonMistakes: ['Using momentum/kipping.', 'Not going through full range of motion.'],
    progressions: { easier: ['Australian Pull Up'], harder: ['Archer Pull Up', 'Muscle Up'] }
  },
  {
    name: 'Australian Pull Up',
    description: 'Horizontal pull performed on a low bar, excellent for building foundational strength.',
    category: 'Pull',
    level: 'Beginner',
    instructions: [
      'Find a low bar and hang underneath it with heels on the ground.',
      'Pull your chest to the bar while keeping your body in a straight line.',
      'Lower back down slowly.'
    ],
    primaryMuscles: ['Rhomboids', 'Biceps'],
    secondaryMuscles: ['Lats', 'Core'],
    formTips: ['Keep your body stiff like a plank.', 'Squeeze your shoulder blades at the top.'],
    commonMistakes: ['Sagging hips.', 'Hiking the shoulders.'],
    progressions: { easier: [], harder: ['Pull Up'] }
  },
  {
    name: 'Muscle Up',
    description: 'The ultimate explosive pulling and pushing combination.',
    category: 'Pull',
    level: 'Advanced',
    instructions: [
      'Initiate with an explosive pull-up, aiming to get the bar to your lower chest.',
      'Lean forward over the bar to transition your weight.',
      'Push up until your arms are fully locked out (the dip phase).'
    ],
    primaryMuscles: ['Lats', 'Triceps', 'Chest'],
    secondaryMuscles: ['Rear Delts', 'Core', 'Forearms'],
    formTips: ['Use a slightly explosive "C" curve path.', 'Think about pulling the bar down to your waist.'],
    commonMistakes: ['Chicken-winging (one arm at a time).', 'Lack of explosive power from the start.'],
    progressions: { easier: ['Pull Up', 'Explosive Pull Up'], harder: [] }
  },
  // PUSH CATEGORY
  {
    name: 'Push Up',
    description: 'The foundational horizontal pushing exercise.',
    category: 'Push',
    level: 'Beginner',
    instructions: [
      'Start in a high plank position with hands slightly wider than shoulders.',
      'Lower your chest until it nearly touches the floor.',
      'Keep your elbows tucked at a 45-degree angle.',
      'Push back up to the starting position.'
    ],
    primaryMuscles: ['Chest', 'Triceps'],
    secondaryMuscles: ['Front Delts', 'Core'],
    formTips: ['Engage your glutes and core to maintain a straight line.', 'Don\'t let your lower back sag.'],
    commonMistakes: ['Elbows flaring too wide.', 'Partial reps.'],
    progressions: { easier: ['Incline Push Up'], harder: ['Diamond Push Up', 'Pseudo Planche Push Up'] }
  },
  {
    name: 'Dip',
    description: 'Powerful vertical pushing exercise for triceps and chest power.',
    category: 'Push',
    level: 'Beginner',
    instructions: [
      'Grip the parallel bars and lift yourself to full lockout.',
      'Lean slightly forward and lower until your elbows are at 90 degrees.',
      'Push back up to the starting position.'
    ],
    primaryMuscles: ['Triceps', 'Chest'],
    secondaryMuscles: ['Front Delts', 'Shoulder Stabilizers'],
    formTips: ['Maintain a slight forward lean to engage the chest more.', 'Lock out your elbows at the top for full credit.'],
    commonMistakes: ['Not going deep enough.', 'Internal rotation of the shoulders.'],
    progressions: { easier: ['Bench Dip'], harder: ['Weighted Dip', 'Muscle Up'] }
  },
  // CORE CATEGORY
  {
    name: 'L-Sit',
    description: 'A benchmark static core and active compression exercise.',
    category: 'Core',
    level: 'Intermediate',
    instructions: [
      'Sit on the floor or parallettes with hands by your hips.',
      'Push down to lift your entire body and legs off the ground.',
      'Keep your legs perfectly straight and locked at a 90-degree angle.'
    ],
    primaryMuscles: ['Abs', 'Hip Flexors'],
    secondaryMuscles: ['Triceps', 'Shoulder Depressors'],
    formTips: ['Point your toes and lock your knees.', 'Focus on pushing the ground away from you.'],
    commonMistakes: ['Bent knees.', 'Letting the hips sink between the arms.'],
    progressions: { easier: ['Tuck L-Sit'], harder: ['V-Sit'] }
  },
  {
    name: 'Hanging Leg Raise',
    description: 'Dynamic core exercise focusing on compression and anti-extension.',
    category: 'Core',
    level: 'Intermediate',
    instructions: [
      'Hang from a bar with a shoulder-width grip.',
      'Without using momentum, lift your legs until they touch the bar.',
      'Lower them back down with control.'
    ],
    primaryMuscles: ['Abs', 'Lower Back'],
    secondaryMuscles: ['Hip Flexors', 'Grip'],
    formTips: ['Avoid swinging by engaging your lats.', 'Exhale as you lift your legs.'],
    commonMistakes: ['Using a huge swing.', 'Not reaching the bar.'],
    progressions: { easier: ['Knee Raise'], harder: ['Strict Toes to Bar'] }
  },
  // STATIC / BALANCE
  {
    name: 'Handstand Hold (Wall)',
    description: 'Essential drill for developing overhead stability and balance.',
    category: 'Balance',
    level: 'Beginner',
    instructions: [
      'Kick up into a handstand against a wall.',
      'Push through your palms and extend your shoulders.',
      'Keep your body in a straight line from wrists to ankles.'
    ],
    primaryMuscles: ['Shoulders', 'Triceps'],
    secondaryMuscles: ['Core', 'Wrist Stabilizers'],
    formTips: ['Look at a spot between your hands.', 'Imagine you are pushing the ceiling away.'],
    commonMistakes: ['Banana back (over-arching).', 'Bent arms.'],
    progressions: { easier: ['Pike Push Up'], harder: ['Free Handstand'] }
  },
  {
    name: 'Planche Lean',
    description: 'The foundation for the planche, building straight-arm pushing strength.',
    category: 'Static',
    level: 'Beginner',
    instructions: [
      'Get into a push-up position.',
      'Lean your weight forward as far as possible.',
      'Keep your arms completely straight and shoulders protracted.'
    ],
    primaryMuscles: ['Front Delts', 'Biceps'],
    secondaryMuscles: ['Core', 'Wrist Stabilizers'],
    formTips: ['Think about "rounding" your upper back.', 'Keep your core and glutes tight.'],
    commonMistakes: ['Bent elbows.', 'Hips too high.'],
    progressions: { easier: [], harder: ['Tuck Planche'] }
  },
  // LEGS
  {
    name: 'Squat',
    description: 'The fundamental lower body movement.',
    category: 'Legs',
    level: 'Beginner',
    instructions: [
      'Stand with feet shoulder-width apart.',
      'Lower your hips back and down as if sitting in a chair.',
      'Keep your chest up and weight on your heels.',
      'Push back up to the start.'
    ],
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Lower Back'],
    formTips: ['Keep your spine neutral.', 'Don\'t let your knees cave inward.'],
    commonMistakes: ['Heels lifting off the ground.', 'Rounding the back.'],
    progressions: { easier: ['Box Squat'], harder: ['Assisted Pistol Squat'] }
  },
  {
    name: 'Lunges',
    description: 'Single-leg strength and stability builder.',
    category: 'Legs',
    level: 'Beginner',
    instructions: [
      'Step forward with one leg and lower your hips.',
      'Both knees should reach about 90 degrees.',
      'Keep your front knee aligned with your ankle.',
      'Push back to the starting position.'
    ],
    primaryMuscles: ['Quads', 'Hamstrings'],
    secondaryMuscles: ['Glutes', 'Calves'],
    formTips: ['Maintain an upright torso.', 'Step far enough forward to protect your knee.'],
    commonMistakes: ['Front knee going past toes.', 'Loss of balance.'],
    progressions: { easier: [], harder: ['Bulgarian Split Squat'] }
  },
  {
    name: 'Pistol Squat (Assisted)',
    description: 'Advanced single-leg squat with assistance for balance and strength.',
    category: 'Legs',
    level: 'Intermediate',
    instructions: [
      'Hold onto a pole or TRX for balance.',
      'Lift one leg off the ground in front of you.',
      'Squat down on the other leg as deep as possible.',
      'Push back up.'
    ],
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Core', 'Ankle Stabilizers'],
    formTips: ['Keep the elevated leg straight.', 'Focus on pushing through the heel.'],
    commonMistakes: ['Rushing the negative.', 'Letting the heel lift.'],
    progressions: { easier: ['Squat'], harder: ['Pistol Squat (Full)'] }
  },
  // MORE PUSH/PULL/STATIC
  {
    name: 'Diamond Push Up',
    description: 'Push-up variation focusing on triceps and inner chest.',
    category: 'Push',
    level: 'Intermediate',
    instructions: [
      'Place your hands together forming a diamond with index fingers and thumbs.',
      'Perform a push-up while keeping elbows close to the body.'
    ],
    primaryMuscles: ['Triceps', 'Chest'],
    secondaryMuscles: ['Front Delts', 'Core'],
    formTips: ['Don\'t flare your elbows out.', 'Maintain a rigid core.'],
    commonMistakes: ['Arching the back.', 'Narrow hand placement causing wrist pain.'],
    progressions: { easier: ['Push Up'], harder: ['Pseudo Planche Push Up'] }
  },
  {
    name: 'Chin Up',
    description: 'Underhand vertical pull focusing on biceps.',
    category: 'Pull',
    level: 'Beginner',
    instructions: [
      'Grip the bar with palms facing you.',
      'Pull your chin over the bar.',
      'Lower with control.'
    ],
    primaryMuscles: ['Biceps', 'Lats'],
    secondaryMuscles: ['Forearms', 'Rear Delts'],
    formTips: ['Squeeze your biceps at the top.', 'Don\'t swing.'],
    commonMistakes: ['Partial reps.', 'Using momentum.'],
    progressions: { easier: ['Australian Chin Up'], harder: ['Pull Up'] }
  },
  {
    name: 'Pseudo Planche Push Up',
    description: 'Push-up variation mimicking planche mechanics.',
    category: 'Push',
    level: 'Intermediate',
    instructions: [
      'Lean forward in a push-up position so hands are by your waist.',
      'Perform push-ups while maintaining the forward lean.'
    ],
    primaryMuscles: ['Front Delts', 'Chest'],
    secondaryMuscles: ['Triceps', 'Core'],
    formTips: ['The further you lean, the harder it is.', 'Keep shoulders protracted at the top.'],
    commonMistakes: ['Losing the lean during the rep.', 'Bent knees.'],
    progressions: { easier: ['Diamond Push Up'], harder: ['Tuck Planche Push Up'] }
  },
  {
    name: 'Hollow Body Hold',
    description: 'The most important core position in gymnastics/calisthenics.',
    category: 'Core',
    level: 'Beginner',
    instructions: [
      'Lay on your back with arms overhead.',
      'Lift your legs and shoulders off the ground.',
      'Press your lower back firmly into the floor.'
    ],
    primaryMuscles: ['Abs', 'Obliques'],
    secondaryMuscles: ['Hip Flexors'],
    formTips: ['Ensure there is no gap between your back and the floor.', 'Point your toes.'],
    commonMistakes: ['Arching the lower back.', 'Letting feet touch the ground.'],
    progressions: { easier: ['Knee Tuck Hold'], harder: ['V-Up'] }
  },
  {
    name: 'Plank',
    description: 'Standard isometric core stability builder.',
    category: 'Core',
    level: 'Beginner',
    instructions: [
      'Hold a push-up position on your forearms.',
      'Keep your body in a straight line.'
    ],
    primaryMuscles: ['Core', 'Shoulder Stabilizers'],
    secondaryMuscles: ['Glutes'],
    formTips: ['Don\'t let your hips sag or hike.', 'Breath steadily.'],
    commonMistakes: ['Looking up (strain on neck).', 'Lack of glute engagement.'],
    progressions: { easier: ['Knee Plank'], harder: ['Side Plank'] }
  },
  {
    name: 'Side Plank',
    description: 'Oblique focus isometric hold.',
    category: 'Core',
    level: 'Beginner',
    instructions: [
      'Support your weight on one forearm and the side of your foot.',
      'Keep your body straight from head to toe.'
    ],
    primaryMuscles: ['Obliques'],
    secondaryMuscles: ['Shoulders', 'Glute Medius'],
    formTips: ['Push your hips up toward the ceiling.', 'Keep your core braced.'],
    commonMistakes: ['Hips dropping.', 'Upper body rotating forward.'],
    progressions: { easier: ['Knee Side Plank'], harder: ['Star Plank'] }
  },
  {
    name: 'Tuck Planche',
    description: 'First static milestone of the planche progression.',
    category: 'Static',
    level: 'Intermediate',
    instructions: [
      'From a planche lean, lift your knees to your chest.',
      'Balance on your weighted hands with straight arms.'
    ],
    primaryMuscles: ['Front Delts', 'Shoulder Depressors'],
    secondaryMuscles: ['Core', 'Forearms'],
    formTips: ['Push the ground away as hard as possible.', 'Lean forward until feet lift naturally.'],
    commonMistakes: ['Bent elbows.', 'Hips too low.'],
    progressions: { easier: ['Planche Lean'], harder: ['Adv. Tuck Planche'] }
  },
  {
    name: 'Front Lever (Tuck)',
    description: 'Foundational static pull for horizontal pulling strength.',
    category: 'Static',
    level: 'Intermediate',
    instructions: [
      'Hang from a bar and pull yourself into a tuck position.',
      'Hold your body horizontal with the floor, knees to chest.'
    ],
    primaryMuscles: ['Lats', 'Core'],
    secondaryMuscles: ['Rear Delts', 'Grip'],
    formTips: ['Pull the bar down toward your hips.', 'Keep your arms straight.'],
    commonMistakes: ['Sagging hips.', 'Bent arms.'],
    progressions: { easier: ['Dragon Flag (Negatives)'], harder: ['Adv. Tuck Front Lever'] }
  },
  {
    name: 'Back Lever (Tuck)',
    description: 'Static hold with knees tucked, focusing on shoulder extension.',
    category: 'Static',
    level: 'Intermediate',
    instructions: [
      'Grip the bar and rotate into an upside-down position.',
      'Lower your hips until your back is parallel to the ground, knees tucked.'
    ],
    primaryMuscles: ['Rear Delts', 'Lower Back'],
    secondaryMuscles: ['Chest', 'Biceps (Stretched)'],
    formTips: ['Squeeze your shoulder blades together.', 'Enter with control.'],
    commonMistakes: ['Biceps strain.', 'Looking at the ground.'],
    progressions: { easier: ['Skin the Cat'], harder: ['Adv. Tuck Back Lever'] }
  },
  {
    name: 'Crow Pose',
    description: 'Entry level arm balance.',
    category: 'Balance',
    level: 'Beginner',
    instructions: [
      'Place hands on floor, knees against triceps.',
      'Lean forward until feet lift off the ground.'
    ],
    primaryMuscles: ['Shoulder Stabilizers', 'Wrist Strength'],
    secondaryMuscles: ['Core', 'Triceps'],
    formTips: ['Look slightly forward, not at your feet.', 'Grip the floor with your fingers.'],
    commonMistakes: ['Not leaning enough.', 'Feet jumping up instead of lifting.'],
    progressions: { easier: [], harder: ['Handstand'] }
  },
  {
    name: 'Adv. Tuck Planche',
    description: 'Intermediate planche variation with hips extended further back.',
    category: 'Static',
    level: 'Advanced',
    instructions: [
      'From a tuck planche, extend your hips back until your back is flat.',
      'Maintain straight arms and protracted shoulders.'
    ],
    primaryMuscles: ['Front Delts', 'Shoulder Depressors'],
    secondaryMuscles: ['Core', 'Forearms'],
    formTips: ['Keep your back parallel to the ground.', 'Lean further forward than the tuck version.'],
    commonMistakes: ['Bending elbows to compensate for lack of strength.', 'Hips too high.'],
    progressions: { easier: ['Tuck Planche'], harder: ['Straddle Planche'] }
  },
  {
    name: 'Adv. Tuck Front Lever',
    description: 'Front lever variation with a flat back and knees slightly away from chest.',
    category: 'Static',
    level: 'Advanced',
    instructions: [
      'From a tuck front lever, push your knees away from your chest.',
      'Keep your back flat and parallel to the floor.',
      'Arms must remain perfectly straight.'
    ],
    primaryMuscles: ['Lats', 'Core'],
    secondaryMuscles: ['Rear Delts', 'Grip'],
    formTips: ['Focus on pulling the bar to your waist.', 'Keep your core braced.'],
    commonMistakes: ['Lower back arching.', 'Bent arms.'],
    progressions: { easier: ['Tuck Front Lever'], harder: ['Straddle Front Lever'] }
  },
  {
    name: 'Bulgarian Split Squat',
    description: 'Elite single leg builder focusing on quads and stability.',
    category: 'Legs',
    level: 'Intermediate',
    instructions: [
      'Place one foot behind you on a bench or elevated surface.',
      'Squat down with the front leg until the back knee nearly touches the floor.',
      'Push back up.'
    ],
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core'],
    formTips: ['Keep your front foot far enough forward.', 'Maintain a vertical torso.'],
    commonMistakes: ['Leaning too far forward.', 'Unstable back foot.'],
    progressions: { easier: ['Lunges'], harder: ['Pistol Squat'] }
  },
  {
    name: 'Nordic Curl',
    description: 'The horizontal gold standard for hamstring strength.',
    category: 'Legs',
    level: 'Advanced',
    instructions: [
      'Secure your ankles and kneel on a pad.',
      'Slowly lower your torso toward the ground using only your hamstrings.',
      'Catch yourself with your hands and push back up.'
    ],
    primaryMuscles: ['Hamstrings'],
    secondaryMuscles: ['Glutes', 'Calves'],
    formTips: ['Focus on the eccentric (lowering) phase.', 'Keep your hips extended.'],
    commonMistakes: ['Breaking at the hips.', 'Not using hands to safely catch the fall.'],
    progressions: { easier: ['Glute Bridge'], harder: ['Strict Nordic Curl'] }
  }
];

const supplementalExercises = [
  {
    name: 'Explosive Pull Up',
    description: 'Pull-up variation that builds bar speed and transition power.',
    category: 'Pull',
    level: 'Intermediate',
    instructions: ['Pull as high as possible with controlled explosiveness.'],
    primaryMuscles: ['Lats', 'Biceps'],
    secondaryMuscles: ['Forearms', 'Core'],
    formTips: ['Drive elbows down fast.', 'Keep torso stable.'],
    commonMistakes: ['Swinging excessively.'],
    progressions: { easier: ['Pull Up'], harder: ['Muscle Up'] },
  },
  {
    name: 'Muscle Up Negatives',
    description: 'Controlled eccentric practice for the muscle-up transition.',
    category: 'Pull',
    level: 'Advanced',
    instructions: ['Start above the bar and lower through the transition slowly.'],
    primaryMuscles: ['Lats', 'Triceps'],
    secondaryMuscles: ['Core', 'Forearms'],
    formTips: ['Control each segment of the descent.'],
    commonMistakes: ['Dropping too fast.'],
    progressions: { easier: ['Explosive Pull Up'], harder: ['Strict Muscle Up'] },
  },
  {
    name: 'Strict Muscle Up',
    description: 'Bar muscle-up with minimal kip and strict control.',
    category: 'Pull',
    level: 'Advanced',
    instructions: ['Pull explosively and transition smoothly into dip lockout.'],
    primaryMuscles: ['Lats', 'Chest', 'Triceps'],
    secondaryMuscles: ['Core', 'Forearms'],
    formTips: ['Stay close to the bar during transition.'],
    commonMistakes: ['Chicken wing transition.'],
    progressions: { easier: ['Muscle Up Negatives'], harder: [] },
  },
  {
    name: 'Handstand Kick-ups',
    description: 'Controlled kick-ups to develop entry consistency.',
    category: 'Balance',
    level: 'Beginner',
    instructions: ['Kick up with control and practice stacking hips over shoulders.'],
    primaryMuscles: ['Shoulders', 'Core'],
    secondaryMuscles: ['Wrist Stabilizers'],
    formTips: ['Use small controlled kicks.'],
    commonMistakes: ['Over-kicking.'],
    progressions: { easier: ['Handstand Hold (Wall)'], harder: ['Free Handstand'] },
  },
  {
    name: 'Free Handstand',
    description: 'Freestanding handstand hold.',
    category: 'Balance',
    level: 'Intermediate',
    instructions: ['Hold a stacked free handstand with active shoulders.'],
    primaryMuscles: ['Shoulders', 'Core'],
    secondaryMuscles: ['Triceps', 'Wrist Stabilizers'],
    formTips: ['Grip the floor with fingertips for balance.'],
    commonMistakes: ['Soft shoulders and bent arms.'],
    progressions: { easier: ['Handstand Kick-ups'], harder: ['Press Handstand'] },
  },
  {
    name: 'Press Handstand',
    description: 'Strength-based press into handstand.',
    category: 'Balance',
    level: 'Advanced',
    instructions: ['Press from pike/straddle to handstand with control.'],
    primaryMuscles: ['Shoulders', 'Core'],
    secondaryMuscles: ['Hip Flexors', 'Triceps'],
    formTips: ['Shift weight forward before pressing up.'],
    commonMistakes: ['Jumping instead of pressing.'],
    progressions: { easier: ['Free Handstand'], harder: [] },
  },
  {
    name: 'Full Planche',
    description: 'Full straight-body planche hold.',
    category: 'Static',
    level: 'Advanced',
    instructions: ['Hold body parallel to floor with straight arms.'],
    primaryMuscles: ['Front Delts', 'Core'],
    secondaryMuscles: ['Chest', 'Forearms'],
    formTips: ['Strong protraction and posterior pelvic tilt.'],
    commonMistakes: ['Bent elbows and sagging hips.'],
    progressions: { easier: ['Adv. Tuck Planche'], harder: [] },
  },
  {
    name: 'Scapula Pull Up',
    description: 'Scapular depression and retraction drill on the bar.',
    category: 'Pull',
    level: 'Beginner',
    instructions: ['From a dead hang, pull shoulder blades down and together.'],
    primaryMuscles: ['Lats', 'Lower Traps'],
    secondaryMuscles: ['Forearms'],
    formTips: ['Arms stay straight throughout.'],
    commonMistakes: ['Bending elbows.'],
    progressions: { easier: ['Australian Pull Up'], harder: ['Front Lever (Tuck)'] },
  },
  {
    name: 'Full Front Lever',
    description: 'Straight-body front lever hold.',
    category: 'Static',
    level: 'Advanced',
    instructions: ['Hold body horizontal with straight arms and legs.'],
    primaryMuscles: ['Lats', 'Core'],
    secondaryMuscles: ['Rear Delts', 'Grip'],
    formTips: ['Keep hips level with shoulders.'],
    commonMistakes: ['Piking hips or bending arms.'],
    progressions: { easier: ['Adv. Tuck Front Lever'], harder: [] },
  },
  {
    name: 'Calf Raises',
    description: 'Simple calf-strength movement for lower leg development.',
    category: 'Legs',
    level: 'Beginner',
    instructions: ['Raise heels up onto toes and lower with control.'],
    primaryMuscles: ['Calves'],
    secondaryMuscles: ['Foot Stabilizers'],
    formTips: ['Pause briefly at the top.'],
    commonMistakes: ['Bouncing through reps.'],
    progressions: { easier: [], harder: ['Single-Leg Calf Raise'] },
  },
];

const mockSkills = [
  {
    name: 'Muscle Up',
    description: 'Transition from a pull-up to a dip atop the bar.',
    category: 'Pull',
    icon: 'Zap',
    prerequisites: [],
    masteryLevels: [
      { level: 0, label: 'Candidate', pointsRequired: 0, unlockedExercises: ['Pull Up', 'Dip'] },
      { level: 1, label: 'Apprentice', pointsRequired: 100, unlockedExercises: ['Explosive Pull Up'] },
      { level: 2, label: 'Expert', pointsRequired: 300, unlockedExercises: ['Muscle Up Negatives'] },
      { level: 3, label: 'Master', pointsRequired: 600, unlockedExercises: ['Strict Muscle Up'] },
    ]
  },
  {
    name: 'Handstand',
    description: 'Mastery of overhead balance and static control.',
    category: 'Balance',
    icon: 'Star',
    prerequisites: [],
    masteryLevels: [
      { level: 0, label: 'Wall Support', pointsRequired: 0, unlockedExercises: ['Handstand Hold (Wall)'] },
      { level: 1, label: 'Kick-up Control', pointsRequired: 150, unlockedExercises: ['Handstand Kick-ups'] },
      { level: 2, label: 'Free Standing', pointsRequired: 400, unlockedExercises: ['Free Handstand'] },
      { level: 3, label: 'Press to Handstand', pointsRequired: 800, unlockedExercises: ['Press Handstand'] },
    ]
  },
  {
    name: 'Planche',
    description: 'The pinnacle of horizontal pushing strength.',
    category: 'Static',
    icon: 'Anchor',
    prerequisites: ['Handstand'],
    masteryLevels: [
      { level: 0, label: 'Lean Base', pointsRequired: 0, unlockedExercises: ['Planche Lean'] },
      { level: 1, label: 'Tuck', pointsRequired: 250, unlockedExercises: ['Tuck Planche'] },
      { level: 2, label: 'Adv. Tuck', pointsRequired: 600, unlockedExercises: ['Adv. Tuck Planche'] },
      { level: 3, label: 'Full', pointsRequired: 1200, unlockedExercises: ['Full Planche'] },
    ]
  },
  {
    name: 'Front Lever',
    description: 'Static horizontal pull mastery.',
    category: 'Static',
    icon: 'Waves',
    prerequisites: [],
    masteryLevels: [
      { level: 0, label: 'Scapula Power', pointsRequired: 0, unlockedExercises: ['Scapula Pull Up'] },
      { level: 1, label: 'Tuck Hold', pointsRequired: 200, unlockedExercises: ['Front Lever (Tuck)'] },
      { level: 2, label: 'Adv. Tuck', pointsRequired: 500, unlockedExercises: ['Adv. Tuck Front Lever'] },
      { level: 3, label: 'Full Lay', pointsRequired: 1000, unlockedExercises: ['Full Front Lever'] },
    ]
  }
];

const mockWorkouts = [
  {
    name: 'The Foundational Routine',
    description: 'Perfect for building initial strength with basic movements.',
    imageUrl: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?q=80&w=1200&auto=format&fit=crop',
    level: 'Beginner',
    exercises: [
      { exerciseId: 'pull up', sets: 3, reps: 8 },
      { exerciseId: 'push up', sets: 4, reps: 12 },
      { exerciseId: 'dip', sets: 3, reps: 10 },
      { exerciseId: 'squat', sets: 4, reps: 20 }
    ],
    durationEstimate: 45,
    isGlobal: true
  },
  {
    name: 'Upper Body Blast',
    description: 'Focused intensity on pull and push movements.',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
    level: 'Intermediate',
    exercises: [
      { exerciseId: 'pull up', sets: 5, reps: 10 },
      { exerciseId: 'dip', sets: 5, reps: 12 },
      { exerciseId: 'australian pull up', sets: 3, reps: 15 },
      { exerciseId: 'diamond push up', sets: 4, reps: 15 }
    ],
    durationEstimate: 50,
    isGlobal: true
  },
  {
    name: 'Static Power Protocol',
    description: 'Focused on isometric holds and straight-arm strength.',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
    level: 'Advanced',
    exercises: [
      { exerciseId: 'planche lean', sets: 4, duration: 20 },
      { exerciseId: 'tuck planche', sets: 4, duration: 15 },
      { exerciseId: 'front lever (tuck)', sets: 4, duration: 15 },
      { exerciseId: 'handstand hold (wall)', sets: 3, duration: 45 }
    ],
    durationEstimate: 40,
    isGlobal: true
  },
  {
    name: 'Leg Day Excellence',
    description: 'Building explosive and stable lower body power.',
    imageUrl: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?q=80&w=1200&auto=format&fit=crop',
    level: 'Intermediate',
    exercises: [
      { exerciseId: 'bulgarian split squat', sets: 3, reps: 10 },
      { exerciseId: 'pistol squat (assisted)', sets: 3, reps: 8 },
      { exerciseId: 'lunges', sets: 4, reps: 12 },
      { exerciseId: 'calf raises', sets: 4, reps: 20 }
    ],
    durationEstimate: 35,
    isGlobal: true
  }
];

const normalizeText = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

const exerciseMediaByName: Record<string, { imageUrl: string; videoUrl?: string }> = {
  'Pull Up': {
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-a3776f9a90e2?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
  },
  'Australian Pull Up': {
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',
  },
  'Muscle Up': {
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=2x2t2-JVnAQ',
  },
  'Push Up': {
    imageUrl: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
  },
  'Dip': {
    imageUrl: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?q=80&w=1200&auto=format&fit=crop',
  },
  'L-Sit': {
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&auto=format&fit=crop',
  },
  'Hanging Leg Raise': {
    imageUrl: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=1200&auto=format&fit=crop',
  },
  'Handstand Hold (Wall)': {
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=tA6x8QWQ9dU',
  },
  'Planche Lean': {
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop',
  },
  Squat: {
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-a3776f9a90e2?q=80&w=1200&auto=format&fit=crop',
  },
  Lunges: {
    imageUrl: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?q=80&w=1200&auto=format&fit=crop',
  },
  'Pistol Squat (Assisted)': {
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop',
  },
  'Diamond Push Up': {
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-a3776f9a90e2?q=80&w=1200&auto=format&fit=crop',
  },
  'Chin Up': {
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',
  },
  'Pseudo Planche Push Up': {
    imageUrl: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?q=80&w=1200&auto=format&fit=crop',
  },
  'Hollow Body Hold': {
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop',
  },
  Plank: {
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop',
  },
  'Side Plank': {
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop',
  },
  'Tuck Planche': {
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop',
  },
  'Front Lever (Tuck)': {
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
  },
  'Back Lever (Tuck)': {
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
  },
  'Crow Pose': {
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
  },
  'Adv. Tuck Planche': {
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop',
  },
  'Adv. Tuck Front Lever': {
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
  },
  'Bulgarian Split Squat': {
    imageUrl: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?q=80&w=1200&auto=format&fit=crop',
  },
  'Nordic Curl': {
    imageUrl: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?q=80&w=1200&auto=format&fit=crop',
  },
};

const categoryFallbackMedia: Record<string, { imageUrl: string }> = {
  Push: { imageUrl: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?q=80&w=1200&auto=format&fit=crop' },
  Pull: { imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop' },
  Core: { imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop' },
  Legs: { imageUrl: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?q=80&w=1200&auto=format&fit=crop' },
  Balance: { imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop' },
  Static: { imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop' },
  'Full Body': { imageUrl: 'https://images.unsplash.com/photo-1598971639058-a3776f9a90e2?q=80&w=1200&auto=format&fit=crop' },
};

const enrichExerciseMedia = <T extends { name: string; category: string; imageUrl?: string; videoUrl?: string }>(exercise: T) => {
  const matched =
    exerciseMediaByName[exercise.name] ||
    Object.entries(exerciseMediaByName).find(([key]) => normalizeText(key) === normalizeText(exercise.name))?.[1];

  return {
    ...exercise,
    imageUrl: exercise.imageUrl || matched?.imageUrl || categoryFallbackMedia[exercise.category]?.imageUrl,
    videoUrl: exercise.videoUrl || matched?.videoUrl,
  };
};

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/calispro');
    console.log('Connected to MongoDB for seeding...');

    await Skill.deleteMany({});
    await Exercise.deleteMany({});
    await Workout.deleteMany({});

    console.log('Inserting Exercises...');
    const allExercisesForSeed = [...mockExercises, ...supplementalExercises];
    const enrichedExercises = allExercisesForSeed.map(enrichExerciseMedia);
    const insertedExercises = await Exercise.insertMany(enrichedExercises);
    console.log(`Inserted ${insertedExercises.length} Exercises.`);
    
    const exerciseIdByName = new Map<string, string>();
    insertedExercises.forEach((entry) => {
      exerciseIdByName.set(normalizeText(entry.name), String(entry._id));
    });

    // Map human names to generated IDs for the workouts
    const workoutData = mockWorkouts.map(w => ({
      ...w,
      exercises: w.exercises.map(we => {
        const normalizedRef = normalizeText(we.exerciseId);
        let resolvedId = exerciseIdByName.get(normalizedRef);

        if (!resolvedId) {
          const fuzzy = insertedExercises.find((entry) => normalizeText(entry.name).includes(normalizedRef));
          resolvedId = fuzzy ? String(fuzzy._id) : undefined;
        }

        if (!resolvedId) console.warn(`Exercise not found in library: ${we.exerciseId}`);
        return {
          ...we,
          exerciseId: resolvedId || we.exerciseId
        };
      })
    }));

    console.log('Inserting Skills...');
    await Skill.insertMany(mockSkills);
    console.log('Inserting Workouts...');
    await Workout.insertMany(workoutData);

    console.log('Database Seeded Successfully with Comprehensive Content');
    process.exit();
  } catch (err) {
    console.error('Seeding error details:', err);
    process.exit(1);
  }
};

seedDB();
