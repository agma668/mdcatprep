'use client';

import { EXAMS_CONFIG, ExamCategory } from '@/lib/exams-config';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ExamPortalSwitcher({ currentExam = 'mdcat' }: { currentExam?: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentExam);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelected(val);
    if (val === 'mdcat') {
      router.push('/dashboard');
    } else {
      router.push(`/portal/${val}`);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl shadow-sm">
      <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Active Portal:</span>
      <select
        value={selected}
        onChange={handleChange}
        className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
      >
        <option value="mdcat" className="bg-card text-foreground">MDCAT & NUMS Prep</option>
        <option value="pma" className="bg-card text-foreground">PMA Long Course & ISSB</option>
        <option value="nust" className="bg-card text-foreground">NUST / GIKI / LUMS (NET)</option>
        <option value="usat" className="bg-card text-foreground">HEC USAT (M / E / CS)</option>
        <option value="mbbs" className="bg-card text-foreground">MBBS Clinical Notes</option>
      </select>
    </div>
  );
}
