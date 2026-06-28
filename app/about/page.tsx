import Link from 'next/link';
import { BookOpen, Brain, Zap, Target, Heart, GraduationCap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-neutral-900">Study Buddy</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-neutral-600 hover:text-neutral-900 font-medium">Home</Link>
            <Link href="/login" className="text-neutral-600 hover:text-neutral-900 font-medium">Login</Link>
            <Link href="/register" className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-display font-bold text-neutral-900 mb-4">About Study Buddy</h1>
        <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
          An AI-powered academic companion designed to help college students organize their studies, 
          manage deadlines, and learn smarter — not harder.
        </p>
      </section>

      {/* What is Study Buddy */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
          <h2 className="text-3xl font-display font-bold text-neutral-900 mb-4">What is Study Buddy?</h2>
          <p className="text-neutral-600 text-lg leading-relaxed mb-4">
            Study Buddy is an intelligent study management platform built for college students. 
            It combines the power of AI with practical study tools to help you stay on top of your academics. 
            Whether you need to organize your courses, generate flashcards from your notes, 
            take AI-generated quizzes, or build a personalized study schedule — Study Buddy has you covered.
          </p>
          <p className="text-neutral-600 text-lg leading-relaxed">
            The platform adapts to your class schedule, respects your rest days, and generates 
            study plans that work around your life — not against it.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Brain, title: 'AI-Powered Learning', desc: 'Generate flashcards, quizzes, and study summaries from your uploaded documents using advanced AI.' },
            { icon: Target, title: 'Smart Study Planner', desc: 'Get a personalized study schedule that works around your class hours and respects your rest days.' },
            { icon: Zap, title: 'Interactive Quizzes', desc: 'Test your knowledge with AI-generated multiple choice questions from your study materials.' },
            { icon: Heart, title: 'Review Sessions', desc: 'Study with Pomodoro timer, spaced repetition, or free review — your choice, your pace.' },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 flex gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <f.icon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-display font-bold text-neutral-900 mb-1">{f.title}</h3>
                <p className="text-neutral-600 text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Creator */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-2">Meet the Creator</h2>
          <h3 className="text-2xl font-bold mb-1">Robert Pahiculay</h3>
          <p className="text-primary-200 text-lg mb-4">Developer</p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-primary-200" />
            <p className="text-primary-100">Batangas State University</p>
          </div>
          <p className="text-primary-100 max-w-xl mx-auto leading-relaxed">
            Study Buddy was built with the goal of making academic life easier for every college student. 
            By combining modern web technologies with AI, this platform aims to be the ultimate 
            study companion for students everywhere.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-neutral-500">
          <p>© 2026 Study Buddy — Robert Pahiculay · Batangas State University</p>
        </div>
      </section>
    </div>
  );
}
