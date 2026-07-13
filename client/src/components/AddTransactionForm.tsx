import { useState, type FormEvent } from "react";

type TransactionType = "income" | "expense";

type AddTransactionFormProps = {
  onTransactionAdded: () => void;
};

export default function AddTransactionForm({ onTransactionAdded }: AddTransactionFormProps) {

    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [type, setType] = useState<TransactionType>("expense");

    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const numericAmount = Number(amount);

        if (
            !Number.isFinite(numericAmount) ||
            numericAmount <= 0 ||
            description.trim() === "" ||
            category.trim() === ""
        ) {
            setMessage("Please enter valid transaction information.");
            return;
        }

        try {
            setIsSubmitting(true);
            setMessage("");

            const response = await fetch(
                "http://localhost:3000/api/transactions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        amount: numericAmount,
                        description: description.trim(),
                        category: category.trim(),
                        type,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to create transaction.");
            }
            onTransactionAdded();

            setAmount("");
            setDescription("");
            setCategory("");
            setType("expense");
            setMessage("Transaction added successfully.");
        } catch (error) {
            console.error("Error creating transaction:", error);
            setMessage("Could not add the transaction.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
  <section>
    <h2 className="mb-5 text-xl font-semibold">Add Transaction</h2>

    <form
      onSubmit={handleSubmit}
      className="grid gap-4 md:grid-cols-2"
    >
      <div>
        <label
          htmlFor="amount"
          className="mb-1 block text-sm text-slate-300"
        >
          Amount
        </label>

        <input
          id="amount"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0.00"
          required
          className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1 block text-sm text-slate-300"
        >
          Description
        </label>

        <input
          id="description"
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Groceries"
          required
          className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="category"
          className="mb-1 block text-sm text-slate-300"
        >
          Category
        </label>

        <input
          id="category"
          type="text"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Food"
          required
          className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="type"
          className="mb-1 block text-sm text-slate-300"
        >
          Type
        </label>

        <select
          id="type"
          value={type}
          onChange={(event) =>
            setType(event.target.value as TransactionType)
          }
          className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-5 py-2 font-medium hover:bg-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? "Adding..." : "Add Transaction"}
        </button>
      </div>
    </form>

    {message && (
      <p className="mt-4 text-sm text-slate-300">
        {message}
      </p>
    )}
  </section>
);
}