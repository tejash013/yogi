import { useState, useEffect } from 'react';
import { Button, Card, Textarea } from '@/components/ui';
import { Rating } from '@/components/customer';
import { useAuthStore, useToastStore } from '@/store';

export default function Feedback() {
  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.showToast);
  const [step, setStep] = useState<'form' | 'thanks'>('form');
  const [overallRating, setOverallRating] = useState(5);
  const [foodRating, setFoodRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [subject, setSubject] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [name, setName] = useState('');
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (user?.firstName) {
      setName(`${user.firstName} ${user.lastName || ''}`.trim());
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImages((prev) => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Feedback submitted successfully! Thank you.', 'success');
    setStep('thanks');
  };

  if (step === 'thanks') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
          <svg className="h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-white">Thank You! 🙏</h2>
        <p className="mb-6 text-center text-sm text-neutral-500 max-w-sm">
          Your feedback is invaluable to us. It helps us improve and serve you better. We appreciate your time!
        </p>
        <Button onClick={() => setStep('form')}>Submit Another Feedback</Button>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <Card className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <span className="mb-3 inline-block text-4xl">💬</span>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">We Value Your Feedback</h1>
          <p className="mt-1 text-sm text-neutral-500">Help us improve your dining experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Overall Experience
            </label>
            <Rating value={overallRating} onChange={setOverallRating} size="lg" />
          </div>

          {/* Food Rating */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Food Quality
            </label>
            <Rating value={foodRating} onChange={setFoodRating} size="lg" />
          </div>

          {/* Service Rating */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Service Quality
            </label>
            <Rating value={serviceRating} onChange={setServiceRating} size="lg" />
          </div>

          {/* Subject */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Summarize your feedback"
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800"
            />
          </div>

          {/* Review Text */}
          <Textarea
            label="Your Feedback"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Tell us about your experience in detail..."
            rows={5}
          />

          {/* Image Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Upload Images (Optional)
            </label>
            <div className="flex flex-wrap gap-3">
              {images.map((img, index) => (
                <div key={index} className="relative h-20 w-20 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-600">
                  <img src={img} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
              {images.length < 4 && (
                <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 transition-colors hover:border-primary-500 hover:bg-primary-50 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:border-primary-500">
                  <svg className="h-6 w-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
            <p className="mt-1 text-xs text-neutral-400">Upload up to 4 images (JPEG, PNG)</p>
          </div>

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800"
            />
          </div>

          <Button type="submit" fullWidth size="lg">
            Submit Feedback
          </Button>
        </form>
      </Card>
    </div>
  );
}

