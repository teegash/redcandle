interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="glass-panel-soft rounded-[1.5rem] border border-dashed border-slate-400/20 p-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">{description}</p>
    </div>
  );
}
