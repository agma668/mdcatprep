# Master-notes authoring spec (internal, for the Notes/ build)

You are writing ONE section of an MDCAT 2026 revision note. The deliverable is a list of short
fact lines such that **every MCQ that appeared anywhere in the corpus is answered by exactly one
line**. No explanations, no worked solutions, no filler. Length is expected; completeness is the
contract.

## Input format

Your source is a line range of `Analysis/notes_src_<SUBJECT>.txt`. Each line is one **bucket**
(a distinct fact, with near-duplicate questions collapsed):

```
CHE-B1234 | u16 Alcohols & Phenols | n=6 | fam=2 | era=official+recent | key=B | <question stem> | <options A/B/C/D>
```

- `n=` how many corpus questions collapse into this bucket. **`n ≥ 2` must be marked `×n`** at the
 end of the fact line. `n=1` gets no marker.
- `key=` is an official answer key letter when one was extracted. Trust it over your own reading
 when the options are legible; if the options are garbled, answer from knowledge and say nothing
 about the letter.
- `era=` tells you nothing you need to write. Ignore it.
- Some lines are OCR debris (a page header, a table of contents, a merged fragment of two
 questions, an English/LR sentence). Do not invent a fact from those — collect them and list them
 in one closing line saying they are unusable debris.

## Output format

```markdown
## u16 — Alcohols and Phenols

**Alcohols — oxidation and reduction**
- **Secondary alcohols oxidise to ketones**; primary go aldehyde then acid. ×4
- **LiAlH₄ reduces a carboxylic acid to a primary alcohol**.

**Bled in from other units (same buckets)**
- **Phenol + bromine water → 2,4,6-tribromophenol** (white ppt). →u16
```

Rules:
1. One bullet per bucket. Never merge two buckets into one line, never split one bucket across
 lines. The count of your bullets + debris lines must equal the number of source lines.
2. The bullet states **the answer as a fact**, in the fewest words that still identify it. Prefer
 the pattern `**<the thing>** = <what it is>` or `<X> gives **<answer>**`.
3. Group bullets under 3–8 bold sub-headings by sub-topic, biggest buckets first inside each
 group. A group named `**Bled in from other units (same buckets)**` collects every bucket whose
 real home is a different unit, each tagged `→uN`.
4. Bold only the term the exam asks for. No italics, no tables, no links.
5. Physics/Chemistry/Biology only. If a source line is an English or Logical-Reasoning question
 that leaked into the corpus, put it in the debris line — do not answer it.
6. Do not add a preamble, a summary, or "these notes cover…". Start at the `##` heading.
7. Write the file with the Write tool. Do not print the section to chat; reply with only the
 bucket count, bullet count and debris count so the assembly step can verify coverage.
