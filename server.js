const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const path = require('path');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// HABIT & TRACKER API ROUTES
// ==========================================

// Get all habits and their logs
app.get('/api/habits', async (req, res) => {
  try {
    const habits = await prisma.habit.findMany({
      include: { logs: true }
    });
    res.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

// Create a new habit
app.post('/api/habits', async (req, res) => {
  try {
    const { name, description } = req.body;
    const newHabit = await prisma.habit.create({
      data: { name, description }
    });
    res.json(newHabit);
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

// Log completion for a specific habit (Only updates when clicked!)
app.post('/api/habits/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Check if a log already exists for today
    const existingLog = await prisma.habitLog.findFirst({
      where: {
        habitId: parseInt(id),
        date: today
      }
    });

    if (existingLog) {
      // If already logged today, remove it (toggle off)
      await prisma.habitLog.delete({
        where: { id: existingLog.id }
      });
      res.json({ success: true, status: 'uncompleted' });
    } else {
      // Otherwise, create today's completion log (toggle on)
      await prisma.habitLog.create({
        data: {
          habitId: parseInt(id),
          date: today,
          completed: true
        }
      });
      res.json({ success: true, status: 'completed' });
    }
  } catch (error) {
    console.error('Error toggling habit:', error);
    res.status(500).json({ error: 'Failed to update habit progress' });
  }
});

// ==========================================
// RESET PROGRESS ENDPOINT
// ==========================================
app.post('/api/habits/reset', async (req, res) => {
  try {
    // 1. Delete all completion history logs (keeps habit templates safe)
    await prisma.habitLog.deleteMany({});

    // 2. Reset any streak or status counters on habits if stored
    await prisma.habit.updateMany({
      data: {
        completed: false,
        streak: 0
      }
    });

    res.json({ success: true, message: 'All progress reset successfully!' });
  } catch (error) {
    console.error('Error resetting progress:', error);
    res.status(500).json({ success: false, error: 'Failed to reset progress' });
  }
});

// Start Server on Render's Assigned Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});