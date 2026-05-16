export default function DemoModeBadge() {
  return (
    <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-indigo-50 border-b border-indigo-100">
      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
      <span className="text-xs font-semibold text-accent tracking-wide">Demo Mode</span>
    </div>
  );
}
