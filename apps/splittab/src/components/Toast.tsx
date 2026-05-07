import { useEffect, useState } from 'react';

type ToastProps = { message: string; onDismiss: () => void };

export default function Toast({ message, onDismiss }: ToastProps): JSX.Element {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm rounded-full px-5 py-2.5 shadow-lg transition-opacity duration-300 z-50 whitespace-nowrap ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {message}
    </div>
  );
}
