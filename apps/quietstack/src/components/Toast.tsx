import { useEffect } from 'react';

type Props = {
  message: string;
  onDismiss: () => void;
};

export default function Toast({ message, onDismiss }: Props): JSX.Element {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg max-w-xs text-center animate-fade-in">
      {message}
    </div>
  );
}
