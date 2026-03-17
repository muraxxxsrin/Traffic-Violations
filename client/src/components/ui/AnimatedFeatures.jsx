import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

export function AnimatedFeatures({
  testimonials,
  autoplay = false,
  className,
}) {
  const [active, setActive] = useState(0);

  const handleNext = useCallback(() => {
    setActive((previous) => (previous + 1) % testimonials.length);
  }, [testimonials.length]);

  const handlePrev = () => {
    setActive((previous) => (previous - 1 + testimonials.length) % testimonials.length);
  };

  const isActive = (index) => index === active;

  useEffect(() => {
    if (!autoplay) {
      return undefined;
    }

    const interval = window.setInterval(handleNext, 5000);
    return () => window.clearInterval(interval);
  }, [autoplay, handleNext]);

  const getRotate = (index) => ((index * 7) % 21) - 10;

  if (!testimonials?.length) {
    return null;
  }

  return (
    <div className={cn("features-slider", className)}>
      <div className="features-slider__grid">
        <div>
          <div className="features-slider__visual">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <Motion.div
                  key={testimonial.name}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: getRotate(index),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.68,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : getRotate(index),
                    zIndex: isActive(index) ? 20 : testimonials.length + 2 - index,
                    y: isActive(index) ? [0, -16, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: getRotate(index),
                  }}
                  transition={{
                    duration: 0.45,
                    ease: "easeInOut",
                  }}
                  className="features-slider__card"
                >
                  <img
                    src={testimonial.src}
                    alt={testimonial.name}
                    draggable={false}
                    className="features-slider__image"
                  />
                </Motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="features-slider__content">
          <Motion.div
            key={active}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <h3 className="features-slider__title">{testimonials[active].name}</h3>
            <p className="features-slider__subtitle">{testimonials[active].designation}</p>
            <Motion.p className="features-slider__quote">
              {testimonials[active].quote.split(" ").map((word, index) => (
                <Motion.span
                  key={`${word}-${index}`}
                  initial={{
                    filter: "blur(10px)",
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    filter: "blur(0px)",
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                    delay: 0.02 * index,
                  }}
                  className="features-slider__word"
                >
                  {word}&nbsp;
                </Motion.span>
              ))}
            </Motion.p>
          </Motion.div>

          <div className="features-slider__actions">
            <button
              type="button"
              onClick={handlePrev}
              className="features-slider__arrow"
              aria-label="Previous feature"
            >
              <ChevronLeft className="features-slider__arrow-icon" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="features-slider__arrow"
              aria-label="Next feature"
            >
              <ChevronRight className="features-slider__arrow-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimatedFeatures;
