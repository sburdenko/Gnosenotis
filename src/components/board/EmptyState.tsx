export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="border border-black/10 bg-kraft px-5 py-8 text-center font-hand text-[20px] text-hand">
      {children}
    </p>
  );
}
