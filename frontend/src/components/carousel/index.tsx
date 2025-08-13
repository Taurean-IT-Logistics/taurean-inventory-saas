import React, { useRef, useEffect, useState } from 'react';
import { Button, Badge } from 'components/ui';
import {  } from '';
import {
  faChevronLeft,
  faChevronRight,
  faPlay,
  faPause
} from 'lucide-react';

type CarouselProps = {
  orientation?: 'horizontal' | 'vertical';
  children: React.ReactNode;
  className?: string;
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showCounter?: boolean;
};

const Carousel: React.FC<CarouselProps> = ({
  orientation = 'horizontal',
  children,
  className = '',
  autoPlay = false,
  interval = 5000,
  showDots = true,
  showCounter = true
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const childrenArray = React.Children.toArray(children);
  const totalSlides = childrenArray.length;

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide(prev => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentSlide(prev => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && !isHovered) {
      autoPlayRef.current = setInterval(goToNext, interval);
    } else if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isPlaying, isHovered, interval, currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        goToNext();
      } else if (event.key === ' ') {
        event.preventDefault();
        toggleAutoPlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  const slideTransform =
    orientation === 'horizontal'
      ? `translateX(-${currentSlide * 100}%)`
      : `translateY(-${currentSlide * 100}%)`;

  return (
    <div
      ref={containerRef}
      className={`position-relative overflow-hidden rounded-4 bg-white shadow-lg ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ borderRadius: '1.5rem' }}
    >
      {/* Main carousel container */}
      <div
        className={`d-flex transition-all ${
          orientation === 'vertical' ? 'flex-column' : ''
        }`}
        style={{
          transform: slideTransform,
          transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {childrenArray.map((child, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-100"
            style={{
              width: orientation === 'horizontal' ? '100%' : undefined,
              height: orientation === 'vertical' ? '100%' : undefined
            }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      {totalSlides > 1 && (
        <>
          <Button
            onClick={goToPrevious}
            variant="light"
            className={`position-absolute rounded-circle d-flex align-items-center justify-content-center border-0 shadow-sm ${
              orientation === 'horizontal'
                ? 'start-0 top-50 translate-middle-y ms-3'
                : 'top-0 start-50 translate-middle-x mt-3'
            }`}
            style={{
              width: '3rem',
              height: '3rem',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
              opacity: isHovered ? 1 : 0.8,
              transform: `${
                orientation === 'horizontal'
                  ? 'translateY(-50%)'
                  : 'translateX(-50%)'
              } scale(${isHovered ? 1.1 : 1})`,
              zIndex: 10
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
              e.currentTarget.style.boxShadow =
                '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor =
                'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.boxShadow =
                '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)';
            }}
            aria-label="Previous slide"
          >
            <
              icon={faChevronLeft}
              className={`text-dark ${
                orientation === 'vertical' ? 'rotate-90' : ''
              }`}
              style={{ fontSize: '1rem' }}
            />
          </Button>

          <Button
            onClick={goToNext}
            variant="light"
            className={`position-absolute rounded-circle d-flex align-items-center justify-content-center border-0 shadow-sm ${
              orientation === 'horizontal'
                ? 'end-0 top-50 translate-middle-y me-3'
                : 'bottom-0 start-50 translate-middle-x mb-3'
            }`}
            style={{
              width: '3rem',
              height: '3rem',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
              opacity: isHovered ? 1 : 0.8,
              transform: `${
                orientation === 'horizontal'
                  ? 'translateY(-50%)'
                  : 'translateX(-50%)'
              } scale(${isHovered ? 1.1 : 1})`,
              zIndex: 10
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
              e.currentTarget.style.boxShadow =
                '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor =
                'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.boxShadow =
                '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)';
            }}
            aria-label="Next slide"
          >
            <
              icon={faChevronRight}
              className={`text-dark ${
                orientation === 'vertical' ? 'rotate-90' : ''
              }`}
              style={{ fontSize: '1rem' }}
            />
          </Button>
        </>
      )}

      {/* Auto-play control */}
      {autoPlay && (
        <Button
          onClick={toggleAutoPlay}
          variant="dark"
          size="sm"
          className="position-absolute rounded-circle d-flex align-items-center justify-content-center border-0"
          style={{
            width: '2.5rem',
            height: '2.5rem',
            top: '1rem',
            left: '1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            zIndex: 10
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
        >
          <
            icon={isPlaying ? faPause : faPlay}
            className="text-white"
            style={{ fontSize: '0.75rem' }}
          />
        </Button>
      )}

      {/* Dot indicators */}
      {showDots && totalSlides > 1 && (
        <div
          className={`position-absolute d-flex gap-2 ${
            orientation === 'horizontal'
              ? 'bottom-0 start-50 translate-middle-x mb-4'
              : 'end-0 top-50 translate-middle-y me-4 flex-column'
          }`}
          style={{ zIndex: 10 }}
        >
          {childrenArray.map((_, index) => (
            <Button
              key={index}
              onClick={() => goToSlide(index)}
              variant="link"
              className="p-0 border-0"
              style={{
                width: index === currentSlide ? '2rem' : '0.5rem',
                height: '0.5rem',
                backgroundColor:
                  index === currentSlide
                    ? 'rgba(255, 255, 255, 1)'
                    : 'rgba(255, 255, 255, 0.6)',
                borderRadius: '0.25rem',
                transition: 'all 0.3s ease',
                boxShadow:
                  index === currentSlide
                    ? '0 0.125rem 0.25rem rgba(0, 0, 0, 0.2)'
                    : 'none'
              }}
              onMouseEnter={e => {
                if (index !== currentSlide) {
                  e.currentTarget.style.backgroundColor =
                    'rgba(255, 255, 255, 0.8)';
                }
              }}
              onMouseLeave={e => {
                if (index !== currentSlide) {
                  e.currentTarget.style.backgroundColor =
                    'rgba(255, 255, 255, 0.6)';
                }
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide counter */}
      {showCounter && (
        <Badge
          bg="dark"
          className="position-absolute rounded-pill px-3 py-2"
          style={{
            top: '1rem',
            right: '1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            fontSize: '0.875rem',
            fontWeight: '500',
            zIndex: 10
          }}
        >
          {currentSlide + 1} / {totalSlides}
        </Badge>
      )}
    </div>
  );
};

export default Carousel;
