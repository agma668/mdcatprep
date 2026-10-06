'use client';

import { useState } from 'react';
import { EXAMS_CONFIG } from '@/lib/exams-config';
import Link from 'next/link';

export function ApexGlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const allExams = Object.values(EXAMS_CONFIG);
  const filteredSubjects = allExams.flatMap(exam => 
    exam.subjects.map(sub => ({ ...sub, examId: exam.id, examName: exam.name, examRoute: exam.route }))
  ).filter(sub => sub.name.toLowerCase().includes(query.toLowerCase()) || sub.examName.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="relative w-full max-w-md mx-auto my-4">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search subjects, exams, or topics (e.g. Biology, USAT, Physics)..."
          className="w-full px-4 py-3 pl-10 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:border-accent transition-colors shadow-sm"
        />
        <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
          {filteredSubjects.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No matching subjects or exams found. Try searching &quot;Biology&quot;, &quot;Quantitative&quot;, or &quot;PMA&quot;.
            </div>
          ) : (
            <div className="py-2">
              <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Matching Exam Modules ({filteredSubjects.length})
              </div>
              {filteredSubjects.map((item, idx) => (
                <Link
                  key={idx}
                  href={`/portal/${item.examId}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors text-xs"
                >
                  <div>
                    <div className="font-semibold text-foreground">{item.name}</div>
                    <div className="text-[10px] text-muted-foreground">{item.examName} • practice set</div>
                  </div>
                  <span className="text-accent font-medium">Open →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
