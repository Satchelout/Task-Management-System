import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getTasks = async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '10', status, search } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = { userId: req.userId! };
  if (status) where.status = status;
  if (search) where.title = { contains: search as string };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.task.count({ where }),
  ]);

  return res.json({
    tasks,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
};

export const getTask = async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id);
  const task = await prisma.task.findFirst({
    where: { id, userId: req.userId! },
  });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  return res.json(task);
};

export const createTask = async (req: AuthRequest, res: Response) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });

  const task = await prisma.task.create({
    data: { title, userId: req.userId! },
  });
  return res.status(201).json(task);
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id);
  const task = await prisma.task.findFirst({
    where: { id, userId: req.userId! },
  });
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const updated = await prisma.task.update({
    where: { id },
    data: { title: req.body.title ?? task.title },
  });
  return res.json(updated);
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id);
  const task = await prisma.task.findFirst({
    where: { id, userId: req.userId! },
  });
  if (!task) return res.status(404).json({ message: 'Task not found' });

  await prisma.task.delete({ where: { id } });
  return res.json({ message: 'Task deleted successfully' });
};

export const toggleTask = async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id);
  const task = await prisma.task.findFirst({
    where: { id, userId: req.userId! },
  });
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const updated = await prisma.task.update({
    where: { id },
    data: {
      status: task.status === 'PENDING' ? 'COMPLETED' : 'PENDING',
    },
  });
  return res.json(updated);
};