import { useAppStore } from '../lib/store';
import Toast from './Toast';

export default function ToastContainer(): JSX.Element {
  const toasts = useAppStore((s) => s.toasts);
  const removeToast = useAppStore((s) => s.removeToast);

  return (
    <>
      {toasts.map((t) => (
        <Toast key={t.id} message={t.text} onDismiss={() => removeToast(t.id)} />
      ))}
    </>
  );
}
