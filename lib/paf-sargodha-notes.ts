// PAF College Sargodha Master Concept Notes.
// Written from the PAF College Sargodha entry-test syllabus - plain-language concept notes
// so a student understands the idea first, then practises. Same shape as
// lib/master-notes.ts so the shared renderer works for every college.

import type { NoteBlock, NoteSection } from './master-notes'

export const PAF_PREAMBLE: NoteBlock[] = [
  {"type":"para","text":"PAF COLLEGE SARGODHA — MASTER CONCEPT NOTES"},
  {"type":"para","text":"Easy-language notes for Class 8 entry-test preparation"},
  {"type":"para","text":"Based on the PAF College entry-test pattern: Mathematics, English, General Science, General Knowledge and an Analytical Reasoning (Intelligence) section."},
  {"type":"para","text":"These notes explain the idea behind each topic, then show how it appears in the test. Best way to use them: read a section, cover the examples, explain it aloud in your own words, then solve 3–5 questions without looking."}
]

export const PAF_SECTIONS: NoteSection[] = [
{"title":"1. MATHEMATICS","topics":[
      {"title":"Numbers and operations","blocks":[
        {"type":"para","text":"Most PAF Maths questions punish careless arithmetic. Train speed and accuracy together."},
        {"type":"bullet","text":"Place value shows what each digit is worth."},
        {"type":"bullet","text":"Factors divide a number exactly; multiples are products of a number with whole numbers."},
        {"type":"bullet","text":"HCF is the largest factor two numbers share; LCM is the smallest common multiple."},
        {"type":"bullet","text":"A prime number has exactly two factors: 1 and itself."},
        {"type":"para","text":"Think like this: for 12 and 18, the HCF is 6 because 6 is the biggest number dividing both exactly. The LCM is 36, the smallest number divisible by both."}
      ]},
      {"title":"Fractions and decimals","blocks":[
        {"type":"para","text":"A fraction is a division written compactly. The denominator tells the equal parts in one whole; the numerator tells how many parts you have."},
        {"type":"bullet","text":"Simplify by dividing top and bottom by the same factor."},
        {"type":"bullet","text":"For addition/subtraction, make denominators equal first."},
        {"type":"bullet","text":"For multiplication, multiply tops and bottoms separately; for division, invert and multiply."},
        {"type":"bullet","text":"A decimal is just a fraction with denominator 10, 100, 1000, and so on."}
      ]},
      {"title":"Percentages and ratio","blocks":[
        {"type":"para","text":"Per cent means \'out of a hundred\'. Convert easily: amount = (percent ÷ 100) × whole."},
        {"type":"bullet","text":"Discount = percent of marked price; then subtract from the price."},
        {"type":"bullet","text":"A ratio compares two quantities with the same units."},
        {"type":"bullet","text":"To split a total in a ratio, add the parts to find each fraction of the total."},
        {"type":"para","text":"Think like this: to split 60 in the ratio 2 : 3, add 2 + 3 = 5; each part is 60 ÷ 5 = 12; so the pieces are 24 and 36."}
      ]},
      {"title":"Algebra","blocks":[
        {"type":"para","text":"Algebra uses letters as placeholders for unknown numbers. Collect like terms and keep both sides balanced."},
        {"type":"bullet","text":"To solve for a variable, undo operations step by step, doing the same to both sides."},
        {"type":"bullet","text":"Expand brackets by multiplying every term inside."},
        {"type":"bullet","text":"Simplify by collecting like terms before solving."}
      ]},
      {"title":"Measurement and area","blocks":[
        {"type":"para","text":"Learn the standard units and the simple area/perimeter formulas, and which to apply."},
        {"type":"bullet","text":"Area of a rectangle = length × width."},
        {"type":"bullet","text":"Perimeter is the total distance around a shape."},
        {"type":"bullet","text":"Area of a triangle = ½ × base × height."},
        {"type":"bullet","text":"Know the basic geometry: angles in a triangle sum to 180°."}
      ]}
    ]},
  {"title":"2. ENGLISH","topics":[
      {"title":"Grammar basics","blocks":[
        {"type":"para","text":"The English paper checks your grasp of everyday grammar. Master the core rules and the common traps."},
        {"type":"bullet","text":"Articles: use \'a\' before consonant sounds and \'an\' before vowel sounds."},
        {"type":"bullet","text":"Tenses must match the time of the action (past, present, future)."},
        {"type":"bullet","text":"Prepositions are such small words that students mix them up; learn them in phrases (afraid of, good at)."},
        {"type":"bullet","text":"Subject and verb must agree in number: \'each boy is\', not \'each boy are\'."}
      ]},
      {"title":"Vocabulary","blocks":[
        {"type":"para","text":"Building a wide vocabulary is the fastest way to lift your English marks."},
        {"type":"bullet","text":"Synonyms are words with the same or similar meaning."},
        {"type":"bullet","text":"Antonyms are words with opposite meaning."},
        {"type":"bullet","text":"Learn one-word substitutes for common phrases."},
        {"type":"bullet","text":"Spelling rules matter: \'i before e except after c\'."}
      ]},
      {"title":"Reading and comprehension","blocks":[
        {"type":"para","text":"Comprehension passages test whether you read carefully and find evidence in the text."},
        {"type":"bullet","text":"Read the questions before the passage so you know what to look for."},
        {"type":"bullet","text":"Underline keywords and recheck each answer in the text."},
        {"type":"bullet","text":"Do not answer from your own knowledge when the question asks for the passage."}
      ]}
    ]},
  {"title":"3. GENERAL SCIENCE","topics":[
      {"title":"Biology","blocks":[
        {"type":"para","text":"Learn the basic life processes and key human body facts."},
        {"type":"bullet","text":"The cell is the basic unit of life."},
        {"type":"bullet","text":"Phototsynthesis lets plants make their own food using sunlight."},
        {"type":"bullet","text":"The heart pumps blood; lungs exchange gases; kidneys filter waste."},
        {"type":"bullet","text":"An adult human has about 206 bones."}
      ]},
      {"title":"Physics","blocks":[
        {"type":"para","text":"Focus on simple ideas about matter, energy, forces and motion."},
        {"type":"bullet","text":"Force is measured in newtons (N)."},
        {"type":"bullet","text":"Work = force × distance; energy is measured in joules (J)."},
        {"type":"bullet","text":"Friction opposes motion between surfaces."},
        {"type":"bullet","text":"Light travels in a vacuum; sound needs a medium and is a longitudinal wave."}
      ]},
      {"title":"Chemistry","blocks":[
        {"type":"para","text":"Know basic elements, compounds and everyday reactions."},
        {"type":"bullet","text":"Water is H2O; a blend of hydrogen and oxygen."},
        {"type":"bullet","text":"Metals + acids produce hydrogen gas."},
        {"type":"bullet","text":"Noble gases (helium, neon) are unreactive."},
        {"type":"bullet","text":"Pure water is neutral: pH 7."}
      ]}
    ]},
  {"title":"4. GENERAL KNOWLEDGE","topics":[
      {"title":"Pakistan","blocks":[
        {"type":"para","text":"PAF tests your knowledge of Pakistan and the wider world."},
        {"type":"bullet","text":"Pakistan became independent on 14 August 1947."},
        {"type":"bullet","text":"The highest peak is K2; the longest river is the Indus."},
        {"type":"bullet","text":"Islamabad is the capital; Urdu is the national language."},
        {"type":"bullet","text":"The national animal is the Markhor; the national flower is jasmine."}
      ]},
      {"title":"World","blocks":[
        {"type":"bullet","text":"There are seven continents; the Pacific is the largest ocean."},
        {"type":"bullet","text":"Mars is the Red Planet; Mercury is closest to the Sun."},
        {"type":"bullet","text":"Nitrogen makes up most of the Earth\'s atmosphere."},
        {"type":"bullet","text":"The mantle is the thickest layer of the Earth."}
      ]}
    ]},
  {"title":"5. ANALYTICAL REASONING (INTELLIGENCE)","topics":[
      {"title":"Number and letter series","blocks":[
        {"type":"para","text":"Intelligence questions reward pattern-spotting. Look for how each term changes."},
        {"type":"bullet","text":"Find the difference or the multiplier between terms."},
        {"type":"bullet","text":"Some series use addition and subtraction at once."},
        {"type":"bullet","text":"Alternate terms may form their own series."}
      ]},
      {"title":"Analogies","blocks":[
        {"type":"para","text":"An analogy is a relationship between two things; find the same relationship for the second pair."},
        {"type":"bullet","text":"Identify the relationship: purpose, category, opposite, part-to-whole."},
        {"type":"bullet","text":"Apply the same relationship to the new item."}
      ]},
      {"title":"Odd one out and coding","blocks":[
        {"type":"para","text":"\'Odd one out\' asks which item does not fit the category."},
        {"type":"bullet","text":"Coding questions turn words into a code by shifting letters."},
        {"type":"bullet","text":"Work out the shift rule, then apply it."}
      ]},
      {"title":"Logical and direct reasoning","blocks":[
        {"type":"para","text":"These test clear, step-by-step thinking."},
        {"type":"bullet","text":"Direction questions: track the turns carefully."},
        {"type":"bullet","text":"Blood-relation questions: keep the family tree small and clear."},
        {"type":"bullet","text":"Work through the choices with reasoning; eliminate wrong ones."}
      ]}
    ]}
]

export const PAF_META = { title: "PAF College Sargodha — Master Concept Notes", subtitle: "Easy-language notes for Class 8 entry-test preparation", badge: "PAF College Sargodha · Official syllabus-based pattern" } as const
