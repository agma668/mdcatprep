export interface NumsPsychQuestion {
  id: string;
  scenario: string;
  options: { id: string; text: string; score: number; rationale: string }[];
}

export const NUMS_PSYCH_BANK: NumsPsychQuestion[] = [
  {
    id: 'nums-psych-1',
    scenario: 'During your 2nd year of MBBS clinical rotations, a senior consultant reprimands you harshly in front of patients for a minor charting error you did not commit. How do you react?',
    options: [
      { id: 'a', text: 'Argue back immediately to defend your professional reputation.', score: 1, rationale: 'Impulsive and unprofessional in a clinical setting.' },
      { id: 'b', text: 'Remain calm, listen professionally, and clarify the fact politely in private afterward.', score: 5, rationale: 'Demonstrates emotional intelligence, respect for hierarchy, and professional maturity.' },
      { id: 'c', text: 'Walk away angrily and complain to the hospital administration.', score: 2, rationale: 'Escalates unnecessarily without internal conflict resolution.' },
      { id: 'd', text: 'Accept the blame silently and feel demotivated for the rest of the week.', score: 3, rationale: 'Shows lack of assertiveness.' },
    ],
  },
  {
    id: 'nums-psych-2',
    scenario: 'You notice a fellow cadet/medical student cheating during an internal professional examination. What is your immediate course of action?',
    options: [
      { id: 'a', text: 'Ignore it entirely to avoid ruining friendships.', score: 2, rationale: 'Compromises personal integrity and medical ethics.' },
      { id: 'b', text: 'Publicly shout at them during the exam.', score: 1, rationale: 'Creates unnecessary disruption.' },
      { id: 'c', text: 'Quietly advise them after the exam to rely on their own preparation, and focus on your own paper.', score: 5, rationale: 'Balances peer loyalty with ethical boundaries.' },
      { id: 'd', text: 'Immediately report them to the invigilator with absolute aggression.', score: 3, rationale: 'While ethical, lacks constructive peer mentorship.' },
    ],
  },
  {
    id: 'nums-psych-3',
    scenario: 'You are on 36-hour continuous emergency duty at Army Medical Corps Hospital, and you are physically exhausted when an acute trauma patient arrives needing immediate attention. What do you do?',
    options: [
      { id: 'a', text: 'Hand over the patient to a junior nurse and go sleep.', score: 1, rationale: 'Neglects professional duty and patient safety.' },
      { id: 'b', text: 'Revitalize yourself with coffee, muster your focus, and lead the resuscitation protocol.', score: 5, rationale: 'Embodies military medical resilience and dedication under fatigue.' },
      { id: 'c', text: 'Complain loudly about your shift duration to everyone in the ER.', score: 2, rationale: 'Unprofessional morale-lowering behavior.' },
    ],
  },
];
