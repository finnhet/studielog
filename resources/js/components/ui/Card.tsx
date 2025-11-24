import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-xl p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl ${className}`}>
      {title && <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>}
      {children}
    </div>
  );
}
