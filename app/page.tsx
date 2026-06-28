'use client';

import Link from 'next/link';
import { BookOpen, Zap, Brain, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-neutral-900">
              Study Buddy
            </span>
          </div>
          <div className="flex items-center gap-4">
<Link
  href="/about"
  className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
>
  About
</Link>
            <Link
              href="/login"
              className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="button button-primary"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-8 font-medium text-sm">
            <Sparkles className="w-4 h-4" />
            AI-Powered Academic Excellence
          </div>

          <h1 className="text-5xl md:text-6xl font-display font-bold text-neutral-900 mb-6 text-balance">
            Your Personal Semester Coach
          </h1>

          <p className="text-xl text-neutral-600 mb-12 max-w-2xl mx-auto text-balance">
            Upload course materials, track assignments, generate study resources, and receive personalized recommendations. Everything you need to master your semester in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="button button-primary button-lg group"
            >
              Start Studying Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="button button-outline button-lg"
            >
              See Features
            </Link>
          </div>
        </div>

        {/* Placeholder for dashboard image */}
        <div className="mt-16 rounded-2xl overflow-hidden shadow-2xl bg-white border border-neutral-200 h-96 flex items-center justify-center">
          <div className="text-center">
            <Brain className="w-16 h-16 text-primary-300 mx-auto mb-4" />
            <p className="text-neutral-500">Dashboard Preview</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section bg-white/50 py-24">
        <h2 className="text-4xl font-display font-bold text-center mb-16 text-neutral-900">
          Everything Students Need
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: BookOpen,
              title: 'Smart Document Upload',
              description:
                'Upload PDFs, slides, and notes. AI automatically extracts and organizes content by course.',
            },
            {
              icon: Brain,
              title: 'AI-Generated Flashcards',
              description:
                'Convert study materials into interactive flashcards with difficulty levels for spaced repetition.',
            },
            {
              icon: Zap,
              title: 'Intelligent Quizzes',
              description:
                'Generate multiple-choice, true/false, and short-answer questions to test your knowledge.',
            },
            {
              icon: TrendingUp,
              title: 'Progress Tracking',
              description:
                'Monitor quiz scores, study sessions, and assignment completion with detailed analytics.',
            },
            {
              icon: Sparkles,
              title: 'Personalized Study Plans',
              description:
                'AI creates customized daily schedules based on your exams, deadlines, and availability.',
            },
            {
              icon: Brain,
              title: 'Academic Insights',
              description:
                'Ask your AI coach about weak areas, exam preparation, and personalized study strategies.',
            },
          ].map((feature, idx) => (
            <div key={idx} className="card-interactive group">
              <feature.icon className="w-8 h-8 text-primary-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-display font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="section py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: '10M+', label: 'Study Sessions' },
            { number: '500K+', label: 'Students' },
            { number: '2M+', label: 'Flashcards Generated' },
            { number: '95%', label: 'Grade Improvement' },
          ].map((stat, idx) => (
            <div key={idx}>
              <div className="text-4xl font-display font-bold text-primary-600 mb-2">
                {stat.number}
              </div>
              <p className="text-neutral-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section py-24 bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-display font-bold mb-6">
            Ready to Master Your Semester?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of students who are already improving their grades with AI Study Buddy.
          </p>
          <Link
            href="/register"
            className="button bg-white text-primary-600 hover:bg-neutral-100 button-lg group"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-white">Study Buddy</span>
            </div>
            <p className="text-center md:text-right">
              © 2024 AI Study Buddy. Built to help students succeed.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}