// Cadet College Kohat Master Concept Notes.
// Written from the Cadet College Kohat entry-test syllabus - plain-language concept notes
// so a student understands the idea first, then practises. Same shape as
// lib/master-notes.ts so the shared renderer works for every college.

import type { NoteBlock, NoteSection } from './master-notes'

export const KOHAT_PREAMBLE: NoteBlock[] = [
  {"type":"para","text":"CADET COLLEGE KOHAT (CCK) — MASTER CONCEPT NOTES"},
  {"type":"para","text":"Easy-language notes for Class 8 entry-test preparation"},
  {"type":"para","text":"Based on the Cadet College Kohat entry-test pattern: English, Mathematics, General Science, Urdu/Islamiat and General Knowledge."},
  {"type":"para","text":"Read a section, cover the examples, explain the idea aloud, then solve questions. Understanding first, speed second."}
]

export const KOHAT_SECTIONS: NoteSection[] = [
{"title":"1. MATHEMATICS","topics":[
      {"title":"Numbers and operations","blocks":[
        {"type":"para","text":"Kohat Maths builds on Class 7/8 concepts with a focus on clear working."},
        {"type":"bullet","text":"HCF: largest common factor; LCM: smallest common multiple."},
        {"type":"bullet","text":"Prime numbers have exactly two factors."},
        {"type":"bullet","text":"BODMAS: brackets, order (powers), division, multiplication, addition, subtraction."},
        {"type":"bullet","text":"Simplify fractions and decimals correctly."}
      ]},
      {"title":"Percentages, ratio and measurement","blocks":[
        {"type":"bullet","text":"Percent means out of a hundred; amount = (percent ÷ 100) × whole."},
        {"type":"bullet","text":"Ratio compares similar units; split totals by adding the parts."},
        {"type":"bullet","text":"Area of rectangle = length × width; area of triangle = ½ × base × height."},
        {"type":"bullet","text":"A simple interest = (principal × rate × time) ÷ 100."}
      ]}
    ]},
  {"title":"2. ENGLISH","topics":[
      {"title":"Grammar","blocks":[
        {"type":"para","text":"Everyday grammar is the core of the English paper."},
        {"type":"bullet","text":"Use \'a\' before consonant sounds and \'an\' before vowel sounds."},
        {"type":"bullet","text":"Match the verb to the subject and to the tense."},
        {"type":"bullet","text":"Learn prepositions in common phrases."},
        {"type":"bullet","text":"Change direct speech to indirect by shifting the tense back."}
      ]},
      {"title":"Vocabulary","blocks":[
        {"type":"bullet","text":"Synonyms and antonyms appear regularly."},
        {"type":"bullet","text":"Learn one-word substitutions and correct spellings."},
        {"type":"bullet","text":"In comprehension, answer from the passage."}
      ]}
    ]},
  {"title":"3. GENERAL SCIENCE","topics":[
      {"title":"Biology","blocks":[
        {"type":"bullet","text":"Cell = basic unit of life; photosynthesis = plants making food."},
        {"type":"bullet","text":"Heart pumps blood; about 206 bones in an adult."},
        {"type":"bullet","text":"Lungs exchange gases; kidneys filter waste."}
      ]},
      {"title":"Physics","blocks":[
        {"type":"bullet","text":"Force in newtons (N); energy in joules (J)."},
        {"type":"bullet","text":"Work = force × distance."},
        {"type":"bullet","text":"Friction opposes motion; light travels in a vacuum."}
      ]},
      {"title":"Chemistry","blocks":[
        {"type":"bullet","text":"Water = H2O; metals + acids → hydrogen gas."},
        {"type":"bullet","text":"Noble gases are unreactive; pure water pH 7."}
      ]}
    ]},
  {"title":"4. URDU / ISLAMIAT","topics":[
      {"title":"Urdu grammar","blocks":[
        {"type":"para","text":"Know the basics: nouns, pronouns, verbs and plurals."},
        {"type":"bullet","text":"اسم names a person, place or thing."},
        {"type":"bullet","text":"ضمیر replaces a noun (e.g. وہ)."},
        {"type":"bullet","text":"فعل shows the action."},
        {"type":"bullet","text":"Learn singular/plural pairs like کتاب → کتب."}
      ]},
      {"title":"Islamiat basics","blocks":[
        {"type":"bullet","text":"Five pillars: Shahadat, Salat, Zakat, Sawm, Hajj."},
        {"type":"bullet","text":"The Quran has 114 surahs, revealed to Prophet Muhammad (PBUH)."},
        {"type":"bullet","text":"Hijrah to Madinah took place in 622 CE."},
        {"type":"bullet","text":"Angel Jibraeel conveyed divine revelation."}
      ]}
    ]}
]

export const KOHAT_META = { title: "Cadet College Kohat (CCK) — Master Concept Notes", subtitle: "Easy-language notes for Class 8 entry-test preparation", badge: "Cadet College Kohat · Syllabus-based pattern" } as const
