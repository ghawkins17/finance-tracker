type SummaryCardProps = {
  title: string;
  amount: string;
};

export default function SummaryCard({
  title,
  amount,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl bg-slate-800 p-6 shadow-lg">
      <p className="text-sm text-slate-400">{title}</p>

      <h2 className="mt-2 text-3xl font-bold">
        {amount}
      </h2>
    </div>
  );
}