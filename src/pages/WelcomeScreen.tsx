import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ROUTES } from '@/constants';

const welcomeSlides = [
  {
    icon: '🍕',
    title: 'Fresh & Delicious Food',
    description: 'Explore our wide variety of dishes made with the freshest ingredients by expert chefs.',
  },
  {
    icon: '🚀',
    title: 'Fast & Reliable Service',
    description: 'Quick preparation and delivery to your table or doorstep with real-time order tracking.',
  },
  {
    icon: '🎉',
    title: 'Exclusive Rewards & Offers',
    description: 'Earn reward points, unlock special discounts, and enjoy members-only perks.',
  },
];

export default function WelcomeScreen() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < welcomeSlides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      navigate(ROUTES.AUTH.LOGIN);
    }
  };

  const handleSkip = () => {
    navigate(ROUTES.AUTH.LOGIN);
  };

  const slide = welcomeSlides[currentSlide];

  return (
    <div className="fixed inset-0 flex flex-col bg-white dark:bg-neutral-900">
      {/* Skip Button */}
      <div className="flex justify-end p-4">
        <button
          onClick={handleSkip}
          className="rounded-full px-4 py-2 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          Skip
        </button>
      </div>

      {/* Slide Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        <div className="animate-fade-in-up text-center" key={currentSlide}>
          <div className="mx-auto mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20">
            <span className="text-7xl">{slide.icon}</span>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-neutral-900 dark:text-white">
            {slide.title}
          </h1>
          <p className="mx-auto max-w-sm text-base leading-relaxed text-neutral-500">
            {slide.description}
          </p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-8">
        {/* Dots */}
        <div className="mb-8 flex justify-center gap-2">
          {welcomeSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-primary-500'
                  : 'w-2 bg-neutral-300 dark:bg-neutral-600'
              }`}
            />
          ))}
        </div>

        <Button fullWidth size="lg" onClick={handleNext}>
          {currentSlide === welcomeSlides.length - 1 ? 'Get Started' : 'Next'}
        </Button>

        {currentSlide === 0 && (
          <p className="mt-4 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <button
              onClick={() => navigate(ROUTES.AUTH.LOGIN)}
              className="font-medium text-primary-500 hover:text-primary-600"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

