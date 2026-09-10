// Military College Jhelum Master Concept Notes.
// Written from the Military College Jhelum entry-test syllabus - plain-language concept notes
// so a student understands the idea first, then practises. Same shape as
// lib/master-notes.ts so the shared renderer works for every college.

import type { NoteBlock, NoteSection } from './master-notes'

export const MCJ_PREAMBLE: NoteBlock[] = [
  {"type":"para","text":"MILITARY COLLEGE JHELUM (MCJ) — MASTER CONCEPT NOTES"},
  {"type":"para","text":"Easy-language notes for Class 8 entry-test preparation"},
  {"type":"para","text":"Based on the MCJ entry-test pattern: English, Mathematics, General Science, Urdu, Islamiat and General Knowledge, plus an Intelligence/analytical section."},
  {"type":"para","text":"Read each section, cover the examples, then explain the idea in your own words before solving questions. Concepts first, speed later."}
]

export const MCJ_SECTIONS: NoteSection[] = [
{"title":"1. ENGLISH","topics":[
      {"title":"Grammar","blocks":[
        {"type":"para","text":"MCJ English rewards solid, everyday grammar. Nail the basics and the traps."},
        {"type":"bullet","text":"Articles: \'a\' before consonant sounds, \'an\' before vowel sounds."},
        {"type":"bullet","text":"Verbs must agree with their subject and match the tense (time)."},
        {"type":"bullet","text":"Prepositions are best learnt in phrases, not in isolation."},
        {"type":"bullet","text":"Direct speech changes to indirect speech: shift the tense back one step."}
      ]},
      {"title":"Vocabulary and comprehension","blocks":[
        {"type":"bullet","text":"Synonyms and antonyms are regular question types."},
        {"type":"bullet","text":"Learn common one-word substitutions and spellings."},
        {"type":"bullet","text":"In comprehension, always answer from the passage, not memory."}
      ]}
    ]},
  {"title":"2. MATHEMATICS","topics":[
      {"title":"Arithmetic","blocks":[
        {"type":"para","text":"MCJ Maths tests concepts taught up to Class 7/8."},
        {"type":"bullet","text":"HCF and LCM questions need careful factors."},
        {"type":"bullet","text":"Fractions: simplify, make denominators equal for +/- , invert for division."},
        {"type":"bullet","text":"Averages: add all values and divide by how many there are."},
        {"type":"bullet","text":"Percentages: amount = (percent ÷ 100) × whole."}
      ]},
      {"title":"Algebra and geometry","blocks":[
        {"type":"bullet","text":"Solve equations by undoing operations on both sides."},
        {"type":"bullet","text":"Expand brackets by multiplying every term."},
        {"type":"bullet","text":"Angles in a triangle sum to 180°; area of rectangle = length × width."},
        {"type":"bullet","text":"Area of triangle = ½ × base × height."}
      ]}
    ]},
  {"title":"3. GENERAL SCIENCE","topics":[
      {"title":"Life science","blocks":[
        {"type":"para","text":"Know the basic facts about living things and the human body."},
        {"type":"bullet","text":"The cell is the basic unit of life; plants make food by photosynthesis."},
        {"type":"bullet","text":"The heart pumps blood; the adult skeleton has about 206 bones."},
        {"type":"bullet","text":"The skin is the largest organ of the body."}
      ]},
      {"title":"Physical science","blocks":[
        {"type":"bullet","text":"Force is measured in newtons (N); energy in joules (J)."},
        {"type":"bullet","text":"Work = force × distance."},
        {"type":"bullet","text":"Friction opposes motion; light travels in a vacuum."},
        {"type":"bullet","text":"Metals + acids → hydrogen gas; water is H2O."}
      ]}
    ]},
  {"title":"4. URDU","topics":[
      {"title":"Urdu grammar","blocks":[
        {"type":"para","text":"Urdu grammar basics commonly appear: nouns, pronouns, verbs and plurals."},
        {"type":"bullet","text":"A noun (اسم) names a person, place or thing."},
        {"type":"bullet","text":"Pronouns (ضمیر) replace nouns, such as وہ (he/she/it)."},
        {"type":"bullet","text":"A verb (فعل) shows the action in a sentence."},
        {"type":"bullet","text":"Learn singular/plural pairs, e.g. کتاب → کتب."}
      ]}
    ]},
  {"title":"5. ISLAMIAT","topics":[
      {"title":"Pillars of Islam","blocks":[
        {"type":"para","text":"The five pillars are foundational and frequently tested."},
        {"type":"bullet","text":"1) Shahadat (faith), 2) Salat (prayer), 3) Zakat (charity), 4) Sawm (fasting), 5) Hajj (pilgrimage)."},
        {"type":"bullet","text":"There are five daily obligatory prayers."},
        {"type":"bullet","text":"The Quran has 114 surahs, revealed to Prophet Muhammad (PBUH)."},
        {"type":"bullet","text":"The Battle of Badr was the first major battle of Islam."}
      ]}
    ]},
  {"title":"6. GENERAL KNOWLEDGE & INTELLIGENCE","topics":[
      {"title":"Pakistan and world","blocks":[
        {"type":"bullet","text":"Pakistan became independent on 14 August 1947."},
        {"type":"bullet","text":"K2 is the highest peak; the Indus is the longest river."},
        {"type":"bullet","text":"Islamabad is the capital; Urdu is the national language."},
        {"type":"bullet","text":"The Pacific is the largest ocean; Mars is the Red Planet."}
      ]},
      {"title":"Intelligence / analytical","blocks":[
        {"type":"para","text":"These test pattern-spotting and clear reasoning, not memorising."},
        {"type":"bullet","text":"Number series: find the difference or multiplier."},
        {"type":"bullet","text":"Analogies: spot the relationship, then apply it."},
        {"type":"bullet","text":"Odd-one-out: decide the category first."},
        {"type":"bullet","text":"Coding: work out the letter-shift rule."}
      ]}
    ]}
]

export const MCJ_META = { title: "Military College Jhelum (MCJ) — Master Concept Notes", subtitle: "Easy-language notes for Class 8 entry-test preparation", badge: "MCJ Jhelum · Syllabus-based pattern" } as const
