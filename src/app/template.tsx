'use client';

export default function Template({ children }: { children: React.ReactNode }) {
  // We rely on Next.js template remounting behavior for the animation on route change

  return (
    <>
      <div
        className="fixed inset-0 z-[100] pointer-events-none animate-smoke-clearing flex items-center justify-center"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-royal-amethyst/10 backdrop-blur-sm" />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(107,33,168,0.2) 0%, transparent 70%)',
          }}
        />
      </div>
      <div className="page-transition-enter">
        {children}
      </div>
    </>
  );
}
