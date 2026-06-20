import React from 'react';
import { cn } from '../lib/utils';

export function MobileContainer({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className="bg-gray-100 min-h-[100dvh] w-full flex sm:px-4 justify-center sm:items-center">
      <div className={cn("w-full max-w-[480px] h-[100dvh] bg-white sm:shadow-2xl sm:rounded-[40px] sm:h-[800px] sm:max-h-[90vh] sm:border border-gray-200 overflow-hidden relative flex flex-col", className)}>
        {children}
      </div>
    </div>
  )
}
