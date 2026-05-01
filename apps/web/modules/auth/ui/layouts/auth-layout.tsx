export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex min-h-screen min-w-full flex-col items-center justify-center overflow-hidden bg-[var(--hero-bg)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.08] via-transparent to-transparent"
      />
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
};
