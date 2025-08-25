export default function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-black/10 border-t-blue-600 ${className}`}
      style={{ width: 16, height: 16 }}
    />
  );
}
