import prisma from "../lib/prisma.js";

type BudgetData = {
  category: string;
  amount: number;
  month: Date;
};

function getNextMonth(month: Date) {
  return new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1));
}

export async function getBudgets(userId: number, month: Date) {
  const nextMonth = getNextMonth(month);
  const [budgets, expenses] = await prisma.$transaction([
    prisma.budget.findMany({
      where: { userId, month },
      orderBy: { category: "asc" },
    }),
    prisma.transaction.groupBy({
      by: ["category"],
      where: {
        userId,
        type: "expense",
        transactionDate: { gte: month, lt: nextMonth },
      },
      _sum: { amount: true },
    }),
  ]);

  const spendingByCategory = new Map(
    expenses.map((expense) => [
      expense.category.trim().toLowerCase(),
      expense._sum.amount ?? 0,
    ])
  );

  return budgets.map((budget) => {
    const spent = spendingByCategory.get(budget.category.toLowerCase()) ?? 0;
    const remaining = budget.amount - spent;

    return {
      ...budget,
      spent,
      remaining,
      percentUsed: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
      status:
        spent > budget.amount
          ? "over"
          : spent >= budget.amount * 0.8
            ? "warning"
            : "on-track",
    };
  });
}

export async function createBudget(userId: number, data: BudgetData) {
  return prisma.budget.create({ data: { ...data, userId } });
}

export async function updateBudget(
  id: number,
  userId: number,
  data: BudgetData
) {
  const existing = await prisma.budget.findFirst({ where: { id, userId } });
  if (!existing) return null;

  return prisma.budget.update({ where: { id }, data });
}

export async function deleteBudget(id: number, userId: number) {
  const existing = await prisma.budget.findFirst({ where: { id, userId } });
  if (!existing) return null;

  return prisma.budget.delete({ where: { id } });
}