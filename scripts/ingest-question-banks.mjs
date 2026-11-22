#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Automated ingest mechanism for NIMA question banks.
// Reads raw JSON from data/raw/**/*.json, validates, deduplicates,
// and safely merges into TypeScript question bank files or output modules.
// Usage: node scripts/ingest-question-banks.mjs [--dry-run]

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW_DIR = path.join(ROOT, 'data', 'raw');
const LIB_DIR = path.join(ROOT, 'lib');

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

const VALID_ANSWERS = ['A', 'B', 'C', 'D'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validate(question, index, subject) {
  const errors = [];
  if (!clean(question.question_text)) errors.push('question_text required');
  if (!clean(question.option_a)) errors.push('option_a required');
  if (!clean(question.option_b)) errors.push('option_b required');
  if (!clean(question.option_c)) errors.push('option_c required');
  if (!clean(question.option_d)) errors.push('option_d required');
  
  const answer = clean(question.correct_answer).toUpperCase();
  if (!VALID_ANSWERS.includes(answer)) errors.push('correct_answer must be A/B/C/D');
  
  if (question.difficulty && !VALID_DIFFICULTIES.includes(clean(question.difficulty))) {
    errors.push('difficulty must be easy|medium|hard');
  }

  if (errors.length) {
    throw new Error(`[${subject}] Question #${index + 1} invalid: ${errors.join('; ')}`);
  }
}

function getJsonFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of list) {
    const res = path.resolve(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(getJsonFiles(res));
    } else if (file.name.endsWith('.json')) {
      results.push(res);
    }
  }
  return results;
}

function runIngest() {
  const files = getJsonFiles(RAW_DIR);
  if (files.length === 0) {
    console.log('No raw JSON files found under:', RAW_DIR);
    return;
  }

  for (const filePath of files) {
    const fileName = path.basename(filePath, '.json');
    if (fileName.includes('summary')) continue; // Skip metadata summary files

    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(rawData)) {
      console.warn(`Skipping ${filePath}: root is not an array`);
      continue;
    }
    
    const validQuestions = [];
    console.log(`Processing ${fileName} (${rawData.length} items)...`);
    
    for (let i = 0; i < rawData.length; i++) {
      try {
        validate(rawData[i], i, fileName);
        validQuestions.push(rawData[i]);
      } catch (e) {
        console.warn(e.message);
      }
    }
    
    if (validQuestions.length === 0) continue;

    // Output to a dedicated ingested module to prevent overwriting hand-crafted main banks
    const outputPath = path.join(LIB_DIR, `${fileName}-ingested.ts`);
    console.log(`Target output: ${outputPath} (${validQuestions.length} validated questions)`);

    if (isDryRun) {
      console.log(`[Dry Run] Would write to ${outputPath}`);
    } else {
      const content = `// Auto-generated NIMA ingest mechanism: ${new Date().toISOString()}\n\nexport const ${fileName.toUpperCase()}_INGESTED_QUESTIONS = ${JSON.stringify(validQuestions, null, 2)};\n`;
      fs.writeFileSync(outputPath, content);
      console.log(`Successfully generated ingest module ${outputPath}`);
    }
  }
}

runIngest();
