import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data', 'grammar');
const sourceFile = join(__dirname, '..', 'src', 'data', 'fakeGrammarData.json');

mkdirSync(dataDir, { recursive: true });

const data = JSON.parse(readFileSync(sourceFile, 'utf-8'));

data.lessons.forEach((lesson) => {
  const lessonNum = String(lesson.lessonNumber).padStart(2, '0');
  const fileName = `lesson-${lessonNum}.json`;
  const filePath = join(dataDir, fileName);
  
  writeFileSync(filePath, JSON.stringify(lesson, null, 2) + '\n');
  console.log(`Created: ${fileName}`);
});

// Create index file that aggregates all lessons
const indexContent = data.lessons.map((lesson) => {
  const lessonNum = String(lesson.lessonNumber).padStart(2, '0');
  return `  lesson${lessonNum}: () => import('./lesson-${lessonNum}.json')`;
}).join(',\n');

const barrelFile = `// Auto-generated barrel file for grammar lessons
export const grammarLessons = {
${indexContent}
} as const;

export const categories = ${JSON.stringify(data.categories, null, 2)};

export const levels = ${JSON.stringify(data.levels, null, 2)};
`;

writeFileSync(join(dataDir, 'index.ts'), barrelFile);
console.log('Created: index.ts');
console.log('Done!');