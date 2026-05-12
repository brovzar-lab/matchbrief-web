import { useAppStore } from '../lib/store';
import Toast from './Toast';

export default function ToastContainer(): JSX.Element {
  const toasts = useAppStore((s) => s.toasts);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <Toast key={t.id} id={t.id} text={t.text} />
      ))}
    </div>
  );
}
