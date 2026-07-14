import { useEffect, useState } from "react";
import { formatCurrency } from "../utils/formatCurrency";
import SummaryCard from "../components/SummaryCard";
import RecentTransactions from "../components/RecentTransactions";
import AddTransactionForm from "../components/AddTransactionForm";
import api from "../services/api";

type DashboardSummary = {
  balance: number;
  income: number;
  expenses: number;
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchSummary() {
      const response = await api.get("/dashboard/summary");
      setSummary(response.data);
    }

    fetchSummary();
  }, [refreshKey]);

  if (!summary) {
    return <p className="px-8 py-10 text-slate-400">Loading dashboard...</p>;
  }

  return (
    <section className="mx-auto max-w-6xl px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="mt-2 text-slate-400">
          Track your income, expenses, and monthly progress.
        </p>
      </div>

      <div className="mb-8 rounded-xl bg-slate-800 p-6">
        <AddTransactionForm onTransactionAdded={handleTransactionChanged} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <SummaryCard title="Balance" amount={formatCurrency(summary.balance)} />
        <SummaryCard title="Income" amount={formatCurrency(summary.income)} />
        <SummaryCard title="Expenses" amount={formatCurrency(summary.expenses)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <RecentTransactions
          refreshKey={refreshKey}
          onTransactionChanged={handleTransactionChanged}
        />
      </div>
    </section>
  );

  function handleTransactionChanged(){
    setRefreshKey((currentKey) => currentKey + 1);
  }
}