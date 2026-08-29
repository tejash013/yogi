import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button, Card, Textarea } from '@/components/ui';
import { Rating } from '@/components/customer';
export default function Feedback() {
    const [step, setStep] = useState('form');
    const [overallRating, setOverallRating] = useState(0);
    const [foodRating, setFoodRating] = useState(0);
    const [serviceRating, setServiceRating] = useState(0);
    const [subject, setSubject] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [name, setName] = useState('');
    const [images, setImages] = useState([]);
    const handleImageUpload = (e) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        setImages((prev) => [...prev, event.target.result]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };
    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        setStep('thanks');
    };
    if (step === 'thanks') {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center py-16", children: [_jsx("div", { className: "mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20", children: _jsx("svg", { className: "h-12 w-12 text-green-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), _jsx("h2", { className: "mb-2 text-2xl font-bold text-neutral-900 dark:text-white", children: "Thank You! \uD83D\uDE4F" }), _jsx("p", { className: "mb-6 text-center text-sm text-neutral-500 max-w-sm", children: "Your feedback is invaluable to us. It helps us improve and serve you better. We appreciate your time!" }), _jsx(Button, { onClick: () => setStep('form'), children: "Submit Another Feedback" })] }));
    }
    return (_jsx("div", { className: "pb-8", children: _jsxs(Card, { className: "mx-auto max-w-2xl", children: [_jsxs("div", { className: "mb-6 text-center", children: [_jsx("span", { className: "mb-3 inline-block text-4xl", children: "\uD83D\uDCAC" }), _jsx("h1", { className: "text-2xl font-bold text-neutral-900 dark:text-white", children: "We Value Your Feedback" }), _jsx("p", { className: "mt-1 text-sm text-neutral-500", children: "Help us improve your dining experience" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300", children: "Overall Experience" }), _jsx(Rating, { value: overallRating, onChange: setOverallRating, size: "lg" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300", children: "Food Quality" }), _jsx(Rating, { value: foodRating, onChange: setFoodRating, size: "lg" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300", children: "Service Quality" }), _jsx(Rating, { value: serviceRating, onChange: setServiceRating, size: "lg" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300", children: "Subject" }), _jsx("input", { type: "text", value: subject, onChange: (e) => setSubject(e.target.value), placeholder: "Summarize your feedback", className: "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800" })] }), _jsx(Textarea, { label: "Your Feedback", value: reviewText, onChange: (e) => setReviewText(e.target.value), placeholder: "Tell us about your experience in detail...", rows: 5 }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300", children: "Upload Images (Optional)" }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [images.map((img, index) => (_jsxs("div", { className: "relative h-20 w-20 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-600", children: [_jsx("img", { src: img, alt: `Upload ${index + 1}`, className: "h-full w-full object-cover" }), _jsx("button", { type: "button", onClick: () => removeImage(index), className: "absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white", children: "\u00D7" })] }, index))), images.length < 4 && (_jsxs("label", { className: "flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 transition-colors hover:border-primary-500 hover:bg-primary-50 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:border-primary-500", children: [_jsx("svg", { className: "h-6 w-6 text-neutral-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }), _jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: handleImageUpload })] }))] }), _jsx("p", { className: "mt-1 text-xs text-neutral-400", children: "Upload up to 4 images (JPEG, PNG)" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300", children: "Your Name" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "Your name (optional)", className: "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800" })] }), _jsx(Button, { type: "submit", fullWidth: true, size: "lg", children: "Submit Feedback" })] })] }) }));
}
