import { AlertTriangle, RotateCcw } from "lucide-react";

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex min-h-[520px] items-center justify-center px-6 py-10">
      <div
        role="alert"
        className="animate-fade-up w-full max-w-md overflow-hidden rounded-2xl border border-danger/30 bg-surface p-8 text-center shadow-e2"
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl border border-danger/30 bg-danger-bg text-danger">
          <AlertTriangle size={24} strokeWidth={1.8} />
        </div>
        <h2 className="mt-5 text-h1 text-foreground">Couldn't plan that trip</h2>
        <p className="mx-auto mt-2 max-w-xs text-body text-muted-foreground">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface-2 px-3.5 text-[13px] font-medium text-foreground transition-all hover:border-border-strong active:scale-[0.97]"
          >
            <RotateCcw size={14} />
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
