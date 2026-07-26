import prisma from "../lib/prisma.js";

/**
 * Retrieves transactions belonging to the logged-in user.
 */
export async function getRecentTransactions(userId: number) {
  return prisma.transaction.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

type CreateTransactionData = {
  amount: number;
  description: string;
  category: string;
  type: string;
};

/**
 * Creates a transaction belonging to the logged-in user.
 */
export async function createTransaction(
  userId: number,
  data: CreateTransactionData
) {
  return prisma.transaction.create({
    data: {
      amount: data.amount,
      description: data.description,
      category: data.category,
      type: data.type,
      userId,
    },
  });
}

/**
 * Deletes a transaction only if it belongs to the logged-in user.
 */
export async function deleteTransaction(
  id: number,
  userId: number
) {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!transaction) {
    return null;
  }

  return prisma.transaction.delete({
    where: {
      id: transaction.id,
    },
  });
}

type UpdateTransactionData = {
  amount: number;
  description: string;
  category: string;
  type: string;
};

/**
 * Updates a transaction only if it belongs to the logged-in user.
 */
export async function updateTransaction(
  id: number,
  userId: number,
  data: UpdateTransactionData
) {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!transaction) {
    return null;
  }

  return prisma.transaction.update({
    where: {
      id: transaction.id,
    },
    data: {
      amount: data.amount,
      description: data.description,
      category: data.category,
      type: data.type,
    },
  });
}