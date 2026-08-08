import prisma from "../lib/prisma.js";
import type { Prisma } from "@prisma/client";

export type TransactionFilters = {
  page: number;
  pageSize: number;
  search?: string | undefined;
  category?: string | undefined;
  type?: "income" | "expense" | undefined;
  from?: Date | undefined;
  to?: Date | undefined;
  sortBy: "transactionDate" | "amount";
  sortOrder: "asc" | "desc";
};

export async function getTransactions(
  userId: number,
  filters: TransactionFilters
) {
  const where: Prisma.TransactionWhereInput = {
    userId,
    ...(filters.search && {
      description: { contains: filters.search, mode: "insensitive" },
    }),
    ...(filters.category && { category: filters.category }),
    ...(filters.type && { type: filters.type }),
    ...((filters.from || filters.to) && {
      transactionDate: {
        ...(filters.from && { gte: filters.from }),
        ...(filters.to && { lte: filters.to }),
      },
    }),
  };

  const [transactions, total, income, expenses, categoryRows] =
    await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        orderBy: { [filters.sortBy]: filters.sortOrder },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.transaction.count({ where }),
      prisma.transaction.aggregate({
        where: { AND: [where, { type: "income" }] },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { AND: [where, { type: "expense" }] },
        _sum: { amount: true },
      }),
      prisma.transaction.findMany({
        where: { userId },
        distinct: ["category"],
        select: { category: true },
        orderBy: { category: "asc" },
      }),
    ]);

  return {
    transactions,
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    },
    totals: {
      income: income._sum.amount ?? 0,
      expenses: expenses._sum.amount ?? 0,
    },
    categories: categoryRows.map(({ category }) => category),
  };
}

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
  transactionDate: Date;
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
      transactionDate: data.transactionDate,
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
  transactionDate: Date;
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
      transactionDate: data.transactionDate,
    },
  });
}