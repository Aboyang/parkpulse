import { ArrowLeft, MessageSquare, User } from 'lucide-react';

interface Comment {
  userId: string;
  comment: string;
}

interface Props {
  comments: Comment[];
  isLoading: boolean;
  onBack: () => void;
}

export default function CarparkComments({ comments, isLoading, onBack }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg bg-slate-700/50 dark:bg-slate-200/50 hover:bg-slate-600/50 dark:hover:bg-slate-300/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-white dark:text-slate-800" />
        </button>
        <h2 className="text-sm font-semibold text-white dark:text-slate-900">Reviews</h2>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-slate-700/40 dark:bg-slate-100/60 p-3 space-y-2 animate-pulse">
              <div className="h-3 w-20 bg-slate-600/60 dark:bg-slate-300/60 rounded" />
              <div className="h-3 w-full bg-slate-600/40 dark:bg-slate-300/40 rounded" />
              <div className="h-3 w-3/4 bg-slate-600/40 dark:bg-slate-300/40 rounded" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && comments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400 dark:text-slate-500">
          <MessageSquare className="w-8 h-8" />
          <p className="text-sm">No reviews yet</p>
        </div>
      )}

      {!isLoading && comments.length > 0 && (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {comments.map((c, idx) => (
            <div key={idx} className="rounded-xl bg-slate-700/40 dark:bg-slate-100/60 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                <span className="text-xs font-medium text-slate-300 dark:text-slate-600">
                  User {c.userId.slice(-6)}
                </span>
              </div>
              <p className="text-sm text-slate-200 dark:text-slate-800 leading-snug">{c.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
