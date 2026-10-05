'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MeritEstimatorPage() {
  const [examType, setExamType] = useState<'mdcat' | 'nust'>('mdcat');
  
  // MDCAT State
  const [mdcatMarks, setMdcatMarks] = useState(170);
  const [mdcatTotal, setMdcatTotal] = useState(200);
  const [fscMarks, setFscMarks] = useState(980);
  const [fscTotal, setFscTotal] = useState(1100);
  const [matricMarks, setMatricMarks] = useState(1050);
  const [matricTotal, setMatricTotal] = useState(1100);

  // NUST State
  const [netMarks, setNetMarks] = useState(135);
  const [netTotal, setNetTotal] = useState(200);

  // Calculations
  const mdcatPerc = (mdcatMarks / mdcatTotal) * 50; // 50% weight
  const fscPerc = (fscMarks / fscTotal) * 40;     // 40% weight
  const matricPerc = (matricMarks / matricTotal) * 10; // 10% weight
  const mdcatAggregate = (mdcatPerc + fscPerc + matricPerc).toFixed(2);

  const netPerc = (netMarks / netTotal) * 75;
  const fscNetPerc = (fscMarks / fscTotal) * 15;
  const matricNetPerc = (matricMarks / matricTotal) * 10;
  const netAggregate = (netPerc + fscNetPerc + matricNetPerc).toFixed(2);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 text-foreground">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">Apex Merit & Aggregate Estimator</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Calculate your precise admission aggregate for MDCAT/NUMS or NUST NET based on official PMDC & university formulas.
          </p>
        </div>
        <div className="flex bg-card border border-border p-1 rounded-xl">
          <button
            onClick={() => setExamType('mdcat')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              examType === 'mdcat' ? 'bg-accent text-accent-foreground shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            MDCAT / NUMS
          </button>
          <button
            onClick={() => setExamType('nust')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              examType === 'nust' ? 'bg-accent text-accent-foreground shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            NUST NET
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Inputs */}
        <div className="md:col-span-2 space-y-6 bg-card border border-border p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold">Enter Your Academic & Test Scores</h2>

          {examType === 'mdcat' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">MDCAT Test Marks (Out of 200)</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={mdcatMarks}
                    onChange={(e) => setMdcatMarks(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <span className="flex items-center text-xs text-muted-foreground font-semibold">/ 200</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">FSc / HSSC-I & II Marks</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={fscMarks}
                    onChange={(e) => setFscMarks(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <input
                    type="number"
                    value={fscTotal}
                    onChange={(e) => setFscTotal(Number(e.target.value))}
                    className="w-32 bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Matric / SSC Marks</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={matricMarks}
                    onChange={(e) => setMatricMarks(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <input
                    type="number"
                    value={matricTotal}
                    onChange={(e) => setMatricTotal(Number(e.target.value))}
                    className="w-32 bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">NUST NET Score (Out of 200)</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={netMarks}
                    onChange={(e) => setNetMarks(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <span className="flex items-center text-xs text-muted-foreground font-semibold">/ 200</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">FSc / HSSC Marks</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={fscMarks}
                    onChange={(e) => setFscMarks(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <input
                    type="number"
                    value={fscTotal}
                    onChange={(e) => setFscTotal(Number(e.target.value))}
                    className="w-32 bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Matric / SSC Marks</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={matricMarks}
                    onChange={(e) => setMatricMarks(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <input
                    type="number"
                    value={matricTotal}
                    onChange={(e) => setMatricTotal(Number(e.target.value))}
                    className="w-32 bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Result Card */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between text-center">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Estimated Aggregate</span>
            <div className="text-5xl font-extrabold text-accent mt-4">
              {examType === 'mdcat' ? `${mdcatAggregate}%` : `${netAggregate}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              {examType === 'mdcat' 
                ? 'Formula: 50% MDCAT + 40% FSc + 10% Matric'
                : 'Formula: 75% NET + 15% FSc + 10% Matric'}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-xs font-semibold text-foreground mb-1">Safe Merit Benchmark</div>
            <div className="text-sm font-bold text-emerald-400">
              {examType === 'mdcat' ? '90%+ for King Edward / AKU (Govt Seats)' : '75%+ for NUST SEECS (Top CS/SE)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
