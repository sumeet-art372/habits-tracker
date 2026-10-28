const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Status Route
app.get('/api/status', (req, res) => {
  res.json({ message: "Habit Tracker & Certification API is running!" });
});

// ==================== USER ROUTES ====================
app.post('/api/users', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email, password, name } });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== HABIT ROUTES ====================
app.get('/api/habits/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const habits = await prisma.habit.findMany({ where: { userId: parseInt(userId) } });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/habits', async (req, res) => {
  try {
    const { title, icon, category, userId } = req.body;
    const habit = await prisma.habit.create({
      data: { 
        title, 
        icon: icon || '⚡', 
        category: category || 'General', 
        userId: parseInt(userId) 
      }
    });
    res.json(habit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/habits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, streak } = req.body;
    const updatedHabit = await prisma.habit.update({
      where: { id: parseInt(id) },
      data: { completed, streak }
    });
    res.json(updatedHabit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/habits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.habit.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Habit deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CERTIFICATION ROUTES ====================
app.get('/api/certifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const certifications = await prisma.certification.findMany({ where: { userId: parseInt(userId) } });
    res.json(certifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/certifications', async (req, res) => {
  try {
    const { title, status, progress, modules, provider, target, userId } = req.body;
    const certification = await prisma.certification.create({
      data: { 
        title, 
        status: status || 'In Progress', 
        progress: progress !== undefined ? parseInt(progress) : 0, 
        modules: modules || 'Core Modules', 
        provider: provider || 'Online Platform', 
        target: target || 'Q4 2026', 
        userId: parseInt(userId) 
      }
    });
    res.json(certification);
  } catch (error) {
    console.error("Error creating certification:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/certifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.certification.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Certification deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});