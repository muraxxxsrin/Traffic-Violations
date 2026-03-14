'use client';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AnimatePresence, motion } from 'framer-motion';
import { Children, cloneElement, useId, useState } from 'react';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function AnimatedBackground({
  children,
  defaultValue,
  onValueChange,
  className,
  transition,
  enableHover = false,
}) {
  const [activeId, setActiveId] = useState(defaultValue ?? null);
  const uniqueId = useId();
  const MotionDiv = motion.div;

  const handleSetActiveId = (id) => {
    setActiveId(id);
    if (onValueChange) onValueChange(id);
  };

  return Children.map(children, (child, index) => {
    const id = child.props['data-id'];
    const childOnClick = child.props.onClick;
    const interactionProps = enableHover
      ? {
          onMouseEnter: () => handleSetActiveId(id),
          onMouseLeave: () => handleSetActiveId(null),
        }
      : {
          onClick: () => {
            handleSetActiveId(id);
            if (childOnClick) childOnClick();
          },
        };

    return cloneElement(
      child,
      {
        key: index,
        className: cn('relative inline-flex', child.props.className),
        'aria-selected': activeId === id,
        'data-checked': activeId === id ? 'true' : 'false',
        ...interactionProps,
      },
      <>
        <AnimatePresence initial={false}>
          {activeId === id && (
            <MotionDiv
              layoutId={`background-${uniqueId}`}
              className={cn('absolute inset-0', className)}
              transition={transition}
              initial={{ opacity: defaultValue ? 1 : 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
        <span className='z-10'>{child.props.children}</span>
      </>
    );
  });
}
