import { useEffect } from 'react';
import { useAppStore } from '../lib/store';

type Props = {
  id: string;
  text: string;
};

export default function Toast({ id, text }: Props): JSX.Element {
  const removeToast = useAppStore((s) => s.removeToast);

  useEffect(() => {
    const timer = setTimeout(() => removeToast(id), 3000);
    return () => clearTimeout(timer);
  }, [id, removeToast]);

  return (
    <div className="bg-gray-900 text-white text-sm rounded-xl px-4 py-3 shadow-lg max-w-xs animate-fade-in">
      {text}
    </div>
  );
}
