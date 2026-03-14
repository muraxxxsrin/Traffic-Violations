import { useEffect, useId, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import { cn } from "../../lib/utils";

function createSquares(count, areaWidth, areaHeight, cellWidth, cellHeight) {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    pos: [
      Math.floor((Math.random() * areaWidth) / cellWidth),
      Math.floor((Math.random() * areaHeight) / cellHeight),
    ],
  }));
}

export function AnimatedGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 50,
  className,
  maxOpacity = 0.5,
  duration = 4,
  repeatDelay = 0.5,
  ...props
}) {
  const id = useId();
  const containerRef = useRef(null);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const [squares, setSquares] = useState([]);

  const getPos = () => [
    Math.floor((Math.random() * dimensionsRef.current.width) / width),
    Math.floor((Math.random() * dimensionsRef.current.height) / height),
  ];

  const updateSquarePosition = (squareId) => {
    if (!dimensionsRef.current.width || !dimensionsRef.current.height) {
      return;
    }

    setSquares((currentSquares) =>
      currentSquares.map((square) =>
        square.id === squareId
          ? {
              ...square,
              pos: getPos(),
            }
          : square
      )
    );
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const nextWidth = entry.contentRect.width;
        const nextHeight = entry.contentRect.height;

        dimensionsRef.current = {
          width: nextWidth,
          height: nextHeight,
        };

        setSquares(createSquares(numSquares, nextWidth, nextHeight, width, height));
      }
    });

    const currentContainer = containerRef.current;

    if (currentContainer) {
      resizeObserver.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        resizeObserver.unobserve(currentContainer);
      }
    };
  }, [height, numSquares, width]);

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-emerald-500/10 stroke-emerald-500/20",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill={`url(#${id})`} />

      <svg x={x} y={y} className="overflow-visible">
        {squares.map(({ pos: [squareX, squareY], id: squareId }, index) => (
          <Motion.rect
            key={`${squareId}-${index}-${squareX}-${squareY}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: maxOpacity }}
            transition={{
              duration,
              repeat: 1,
              delay: index * 0.08,
              repeatDelay,
              repeatType: "reverse",
            }}
            onAnimationComplete={() => updateSquarePosition(squareId)}
            width={width - 1}
            height={height - 1}
            x={squareX * width + 1}
            y={squareY * height + 1}
            fill="currentColor"
            strokeWidth="0"
          />
        ))}
      </svg>
    </svg>
  );
}

export default AnimatedGridPattern;
