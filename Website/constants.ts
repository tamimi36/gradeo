import { Scan, Brain, BarChart3, Cloud, Shield, Zap } from 'lucide-react';
import { Feature, PricingTier, FAQItem, NavLink } from './types';

export const NAV_LINKS: NavLink[] = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Support', href: '#faq' },
];

export const FEATURES: Feature[] = [
  {
    id: '1',
    title: 'Instant Scan',
    description: 'Scan dozens of papers in minutes using our advanced optical character recognition (OCR) technology.',
    icon: Scan,
  },
  {
    id: '2',
    title: 'AI Analytics',
    description: 'Get deep insights into class performance, identifying learning gaps and student strengths automatically.',
    icon: Brain,
  },
  {
    id: '3',
    title: 'Real-time Stats',
    description: 'Visualize grade distributions and question-level statistics instantly on your mobile or web dashboard.',
    icon: BarChart3,
  },
  {
    id: '4',
    title: 'Cloud Sync',
    description: 'Seamlessly sync data between your mobile device and the web dashboard. Access from anywhere.',
    icon: Cloud,
  },
  {
    id: '5',
    title: 'Secure & Private',
    description: 'Enterprise-grade encryption keeps student data safe, FERPA and GDPR compliant.',
    icon: Shield,
  },
  {
    id: '6',
    title: 'Smart Feedback',
    description: 'Automatically generate personalized feedback comments for students based on their answers.',
    icon: Zap,
  },
];

export const PRICING: PricingTier[] = [
  {
    id: 'free',
    name: 'Starter',
    price: '$0',
    description: 'Perfect for trying out Gradeo.',
    features: ['Up to 50 scans/month', 'Basic analytics', 'Mobile app access', 'Email support'],
    cta: 'Download Free',
  },
  {
    id: 'pro',
    name: 'Teacher Pro',
    price: '$12',
    period: '/month',
    description: 'For power users and large classes.',
    features: ['Unlimited scans', 'Advanced AI insights', 'Web dashboard access', 'Export to CSV/PDF', 'Priority support'],
    cta: 'Start Trial',
    popular: true,
  },
  {
    id: 'school',
    name: 'Institution',
    price: 'Custom',
    description: 'For schools and districts.',
    features: ['Admin dashboard', 'LMS Integration', 'SSO & Advanced Security', 'Dedicated account manager', 'Training sessions'],
    cta: 'Contact Sales',
  },
];

export const FAQS: FAQItem[] = [
  {
    question: 'How accurate is the scanning?',
    answer: 'Gradeo uses state-of-the-art computer vision models achieving over 99% accuracy on standard bubble sheets and handwritten short answers.',
  },
  {
    question: 'Can I access Gradeo on my laptop?',
    answer: 'Yes! Gradeo offers a comprehensive web dashboard for Pro users, allowing you to manage classes, view detailed analytics, and print exam sheets from your computer.',
  },
  {
    question: 'Is student data secure?',
    answer: 'Absolutely. We use end-to-end encryption and strictly adhere to student privacy laws including FERPA and GDPR. We never sell student data.',
  },
  {
    question: 'Does it work offline?',
    answer: 'The mobile app supports offline scanning. Data will automatically sync to the cloud once your device reconnects to the internet.',
  },
];