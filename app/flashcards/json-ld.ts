// FAQ structured data for the public flashcards page. Exported separately so
// the server component (which owns metadata) and the client island can share
// it without pulling 'use client' into the metadata module.

export const flashcardsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Are these MDCAT flashcards free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — all flashcard decks are free to study with no signup. Progress is saved on your device; a free account syncs it across devices.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is spaced repetition and why does it work for MDCAT?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cards you find hard return sooner; cards you know well return later. Rating each card Again, Hard, Good or Easy schedules weak topics back into your sessions right before you would forget them — the most efficient way to retain the wide PMDC MDCAT syllabus.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which subjects do the flashcards cover?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Biology, Chemistry, Physics and English — every deck is written from the PMDC MDCAT syllabus, the same content as the master notes and exam-style MCQs.',
      },
    },
  ],
}
