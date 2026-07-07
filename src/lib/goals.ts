import { db } from "./db";

export async function createGoal(input: {
  name: string;
  targetAmount: number;
  targetDate?: string;
}) {
  return db.goals.add({
    name: input.name,
    targetAmount: input.targetAmount,
    targetDate: input.targetDate,
    savedAmount: 0,
    createdAt: Date.now(),
  });
}

export async function addToGoal(id: number, amount: number) {
  const goal = await db.goals.get(id);
  if (!goal) return;
  await db.goals.update(id, { savedAmount: Math.max(0, goal.savedAmount + amount) });
}

export async function deleteGoal(id: number) {
  return db.goals.delete(id);
}
