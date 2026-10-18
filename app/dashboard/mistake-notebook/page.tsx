'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, BookOpen, CheckCircle2, RefreshCw, ArrowLeft, Trash2 } from 'lucide-react';

interface MistakeItem {
  id: string;
  question: string;
  selectedOption: string;
  correctOption: string;
  explanation: string;
  subject: string;
  timestamp: string;
}

export default function MistakeNotebookPage() {
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load mistakes from localStorage or default mock data for demonstration
    const saved = localStorage.getItem('apex_mistakes');
    if (saved) {
      try {
        setMistakes(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default sample mistakes if none recorded yet
      const sample: MistakeItem[] = [
        {
          id: '1',
          question: 'Which of the following organelles is known as the powerhouse of the cell?',
          selectedOption: 'Golgi apparatus',
          correctOption: 'Mitochondria',
          explanation: 'Mitochondria generate most of the chemical energy needed to power the biochemical reactions of the cell.',
          subject: 'biology',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          question: 'What is the hybridization of carbon in ethyne (acetylene)?',
          selectedOption: 'sp3',
          correctOption: 'sp',
          explanation: 'Ethyne contains a triple bond between two carbon atoms, making each carbon sp hybridized with linear geometry.',
          subject: 'chemistry',
          timestamp: new Date().toISOString(),
        },
      ];
      setMistakes(sample);
      localStorage.setItem('apex_mistakes', JSON.stringify(sample));
    }
    setLoading(false);
  }, []);

  const clearMistakes = () => {
    localStorage.removeItem('apex_mistakes');
    setMistakes([]);
  };

  const filteredMistakes = selectedSubject === 'all' 
    ? mistakes 
    : mistakes.filter(m => m.subject.toLowerCase() === selectedSubject.toLowerCase());

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 text-foreground min-h-screen">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">Adaptive Mistake Notebook</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review every question you missed during practice sessions and mock tests. Spaced repetition for permanent error correction.
          </p>
        </div>

        {mistakes.length > 0 && (
          <button
            onClick={clearMistakes}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-all border border-red-500/20 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Notebook
          </button>
        )}
      </div>

      {/* Subject Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-card border border-border p-1.5 rounded-2xl">
        {['all', 'biology', 'chemistry', 'physics', 'english', 'quantitative'].map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              selectedSubject === sub
                ? 'bg-accent text-accent-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-muted-foreground text-sm">Loading your mistake notebook...</div>
      ) : filteredMistakes.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl">
            🎉
          </div>
          <h3 className="text-xl font-bold">No Mistakes Recorded in This Category!</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            You&apos;re doing exceptionally well. Any questions you miss during practice drills or mock tests will automatically be logged here for review.
          </p>
          <Link
            href="/dashboard/practice"
            className="inline-block px-6 py-3 rounded-xl bg-accent text-accent-foreground font-bold text-xs uppercase tracking-wider shadow"
          >
            Start a Practice Drill →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMistakes.map((m, index) => (
            <div key={m.id || index} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-secondary text-secondary-foreground">
                  {m.subject}
                </span>
                <span className="text-xs text-muted-foreground">
                  Logged: {new Date(m.timestamp).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-bold text-base text-foreground">
                {index + 1}. {m.question}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs">
                  <span className="font-bold text-red-400 block mb-1">Your Incorrect Answer:</span>
                  <span className="text-foreground font-medium">{m.selectedOption}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <span className="font-bold text-emerald-400 block mb-1">Correct Answer:</span>
                  <span className="text-foreground font-medium">{m.correctOption}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border text-xs text-muted-foreground leading-relaxed">
                <span className="font-bold text-foreground block mb-1">Explanation & Rationale:</span>
                {m.explanation}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
