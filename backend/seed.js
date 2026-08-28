/**
 * seed.js — creates demo data for testing
 * Run once:  node seed.js
 * Re-run:    node seed.js --fresh   (clears existing data first)
 */

require('dotenv').config();
const mongoose = require('mongoose');

const Student    = require('./models/Student');
const Course     = require('./models/Course');
const Unit       = require('./models/Unit');
const Lesson     = require('./models/Lesson');
const Quiz       = require('./models/Quiz');
const QuizAttempt = require('./models/QuizAttempt');

const FRESH = process.argv.includes('--fresh');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  if (FRESH) {
    console.log('🗑️  --fresh flag detected — clearing existing data…');
    await Promise.all([
      Student.deleteMany({}),
      Course.deleteMany({}),
      Unit.deleteMany({}),
      Lesson.deleteMany({}),
      Quiz.deleteMany({}),
      QuizAttempt.deleteMany({}),
    ]);
    console.log('   All collections cleared.\n');
  }

  // ── 1. Demo Student ─────────────────────────────────────────────────────────
  let student = await Student.findOne({ email: 'student@ezone.lk' });
  if (!student) {
    student = await Student.create({
      name:     'Demo Student',
      email:    'student@ezone.lk',
      password: 'password123',   // hashed by pre-save hook
      grade:    '12',
    });
    console.log('👤 Student created');
    console.log('   Email:    student@ezone.lk');
    console.log('   Password: password123');
    console.log(`   ID:       ${student._id}\n`);
  } else {
    console.log(`👤 Student already exists — skipping (ID: ${student._id})\n`);
  }

  // ── 2. Demo Course (Grade 12) ────────────────────────────────────────────────
  let course = await Course.findOne({ title: 'Engineering Technology — Grade 12' });
  if (!course) {
    course = await Course.create({
      grade:       '12',
      title:       'Engineering Technology — Grade 12',
      description: 'Complete A/L Engineering Technology course for Grade 12 students covering all theory, practical and drawing units.',
    });
    console.log(`📚 Course created: "${course.title}" (ID: ${course._id})\n`);
  } else {
    console.log(`📚 Course already exists — skipping (ID: ${course._id})\n`);
  }

  // ── 3. Demo Unit ────────────────────────────────────────────────────────────
  let unit = await Unit.findOne({ title: 'Unit 1: Engineering Materials', courseId: course._id });
  if (!unit) {
    unit = await Unit.create({
      title:    'Unit 1: Engineering Materials',
      courseId: course._id,
    });
    // Link unit into course
    await Course.findByIdAndUpdate(course._id, { $addToSet: { units: unit._id } });
    console.log(`📦 Unit created: "${unit.title}" (ID: ${unit._id})\n`);
  } else {
    console.log(`📦 Unit already exists — skipping (ID: ${unit._id})\n`);
  }

  // ── 4. Demo Lessons ─────────────────────────────────────────────────────────
  const lessonDefs = [
    { title: 'Properties of Metals',            type: 'theory'    },
    { title: 'Metal Cutting Practical',          type: 'practical' },
    { title: 'Engineering Drawing Basics',       type: 'drawing'   },
    { title: '2023 A/L Past Paper Discussion',   type: 'pastpaper' },
  ];

  const lessons = [];
  for (const def of lessonDefs) {
    let lesson = await Lesson.findOne({ title: def.title, unitId: unit._id });
    if (!lesson) {
      lesson = await Lesson.create({ title: def.title, type: def.type, unitId: unit._id });
      await Unit.findByIdAndUpdate(unit._id, { $addToSet: { lessons: lesson._id } });
      console.log(`   📄 Lesson created: "${lesson.title}" [${lesson.type}] (ID: ${lesson._id})`);
    } else {
      console.log(`   📄 Lesson already exists — skipping: "${lesson.title}"`);
    }
    lessons.push(lesson);
  }
  console.log();

  // ── 5. Demo Quiz (on the theory lesson) ────────────────────────────────────
  const theoryLesson = lessons[0];
  let quiz = await Quiz.findOne({ lessonId: theoryLesson._id });
  if (!quiz) {
    quiz = await Quiz.create({
      lessonId: theoryLesson._id,
      questions: [
        {
          question:      'Which of the following is a ferrous metal?',
          options:       ['Aluminium', 'Copper', 'Cast Iron', 'Brass'],
          correctAnswer: 'Cast Iron',
          explanation:   'Ferrous metals contain iron as their primary component. Cast iron is an iron-carbon alloy with more than 2% carbon.',
        },
        {
          question:      'What is the SI unit of stress?',
          options:       ['Newton', 'Pascal', 'Joule', 'Watt'],
          correctAnswer: 'Pascal',
          explanation:   'Stress = Force / Area. The SI unit is Pascal (Pa = N/m²).',
        },
        {
          question:      'Which property allows a metal to be drawn into wires?',
          options:       ['Malleability', 'Hardness', 'Ductility', 'Brittleness'],
          correctAnswer: 'Ductility',
          explanation:   'Ductility is the ability of a material to be stretched into a thin wire without breaking.',
        },
        {
          question:      'The carbon content of mild steel is approximately:',
          options:       ['0.1% – 0.3%', '0.6% – 1.4%', '2% – 4%', '5% – 7%'],
          correctAnswer: '0.1% – 0.3%',
          explanation:   'Mild steel (low carbon steel) contains 0.1%–0.3% carbon, making it ductile and easy to weld.',
        },
        {
          question:      'Which heat treatment process is used to reduce internal stresses in metal?',
          options:       ['Quenching', 'Annealing', 'Case hardening', 'Normalising'],
          correctAnswer: 'Annealing',
          explanation:   'Annealing involves heating the metal and then cooling it slowly to relieve internal stresses and improve ductility.',
        },
      ],
    });
    console.log(`❓ Quiz created for "${theoryLesson.title}"`);
    console.log(`   ${quiz.questions.length} questions`);
    console.log(`   Quiz ID: ${quiz._id}\n`);
  } else {
    console.log(`❓ Quiz already exists — skipping (ID: ${quiz._id})\n`);
  }

  // ── 6. Enrol the demo student in the course ─────────────────────────────────
  await Student.findByIdAndUpdate(student._id, {
    $addToSet: { enrolledCourses: course._id },
  });
  console.log('✅ Student enrolled in demo course\n');

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════');
  console.log('  SEED COMPLETE — copy these IDs for testing:');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Student ID   : ${student._id}`);
  console.log(`  Course ID    : ${course._id}`);
  console.log(`  Unit ID      : ${unit._id}`);
  console.log(`  Theory Lesson: ${theoryLesson._id}  ← use for /quiz/:lessonId`);
  console.log(`  Quiz ID      : ${quiz._id}`);
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('  Student login:');
  console.log('    Email:    student@ezone.lk');
  console.log('    Password: password123\n');

  console.log('  Admin secret (from .env):');
  console.log(`    ${process.env.ADMIN_SECRET}\n`);

  console.log('  Quick test URLs (dev server on port 3000):');
  console.log(`    Quiz page : http://localhost:3000/quiz/${theoryLesson._id}`);
  console.log(`    Course    : http://localhost:3000/courses/${course._id}`);
  console.log('    Admin     : http://localhost:3000/admin\n');

  await mongoose.disconnect();
  console.log('Disconnected. Done ✓');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
