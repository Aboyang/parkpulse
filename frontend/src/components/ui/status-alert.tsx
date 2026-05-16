interface StatusAlertProps {
  type: 'success' | 'error';
  message: string;
}

export function StatusAlert({ type, message }: StatusAlertProps) {
  const colors = type === 'success'
    ? 'bg-green-500/10 border-green-500/30 text-green-400'
    : 'bg-red-500/10 border-red-500/30 text-red-400';
  return (
    <div className={`${colors} border rounded-xl px-4 py-3 mb-4`}>
      <p className="text-sm">{message}</p>
    </div>
  );
}
