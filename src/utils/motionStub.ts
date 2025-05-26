import React, { ReactNode } from 'react';

// Simple motion stub to mimic Framer Motion's API without the dependency
// In a real app, you'd install framer-motion

interface MotionProps {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  initial?: Record<string, any>;
  animate?: Record<string, any>;
  exit?: Record<string, any>;
  transition?: Record<string, any>;
  whileHover?: Record<string, any>;
  whileTap?: Record<string, any>;
}

// Simple div that passes through props without the animation functionality
export const motion = {
  div: ({ children, className, style, ...props }: MotionProps) => {
    return React.createElement('div', { className, style }, children);
  },
  button: ({ children, className, style, ...props }: MotionProps) => {
    return React.createElement('button', { className, style }, children);
  }
};