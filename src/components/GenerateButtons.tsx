export default function GenerateButtons() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 my-6">
      <button className="w-full sm:w-auto h-10 px-8 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary-dim)] transition-all duration-200 shadow-lg shadow-[var(--accent-primary-glow)]">
        生成5集 50币
      </button>
      <button className="w-full sm:w-auto h-10 px-8 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary-dim)] transition-all duration-200 shadow-lg shadow-[var(--accent-primary-glow)]">
        生成1集 10币
      </button>
    </div>
  );
}
