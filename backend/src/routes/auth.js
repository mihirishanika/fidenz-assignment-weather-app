import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();

// In-memory user store for demo (replace with DB in real app)
const users = new Map(); // email -> { id, email, passwordHash }
let idCounter = 1;

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/register', async (req, res) => {
  const parse = credentialsSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ message: 'Invalid input' });
  const { email, password } = parse.data;
  if (users.has(email)) return res.status(409).json({ message: 'User exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: idCounter++, email, passwordHash };
  users.set(email, user);
  const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, {
    expiresIn: '2h'
  });
  res.json({ token });
});

router.post('/login', async (req, res) => {
  const parse = credentialsSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ message: 'Invalid input' });
  const { email, password } = parse.data;
  const user = users.get(email);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, {
    expiresIn: '2h'
  });
  res.json({ token });
});

export default router;
