import React from 'react';

export const Heading = ({ children, level = 1, className = "" }: { children: React.ReactNode, level?: 1|2|3, className?: string }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const styles = {
    1: "text-3xl md:text-5xl font-black tracking-tighter text-slate-900",
    2: "text-xl md:text-3xl font-bold tracking-tight text-slate-900",
    3: "text-lg md:text-xl font-bold text-slate-800"
  };
  return <Tag className={`${styles[level as keyof typeof styles]} ${className}`}>{children}</Tag>;
};
