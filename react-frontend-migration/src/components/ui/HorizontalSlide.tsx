import { useState, useRef, useCallback, type ReactElement, type ReactNode, type MouseEvent } from 'react';

interface HorizontalSlideProps {
  children: ReactNode;
  className?: string;
}

function HorizontalSlide({ children, className = '' }: HorizontalSlideProps): ReactElement {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startXRef = useRef<number>(0);
  const scrollLeftRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>): void => {
    const container = containerRef.current;
    if (!container) return;

    setIsDragging(true);
    startXRef.current = e.pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;
  }, []);

  const handleMouseUp = useCallback((): void => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback((): void => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>): void => {
      if (!isDragging) return;

      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      const x = e.pageX - container.offsetLeft;
      const scroll = x - startXRef.current;
      container.scrollLeft = scrollLeftRef.current - scroll;
    },
    [isDragging]
  );

  return (
    <div
      ref={containerRef}
      className={`flex flex-nowrap overflow-x-auto scrollbar-hide ${className}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}
    >
      {children}
    </div>
  );
}

export default HorizontalSlide;
