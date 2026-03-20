#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const DIRECTORIES = ['src', 'tests', 'scripts'];
const EXTENSIONS = new Set(['.js', '.json']);

function walk(currentPath, results = []) {
  if (!fs.existsSync(currentPath)) {
    return results;
  }

  const stat = fs.statSync(currentPath);
  if (stat.isFile()) {
    if (EXTENSIONS.has(path.extname(currentPath))) {
      results.push(currentPath);
    }
    return results;
  }

  for (const entry of fs.readdirSync(currentPath)) {
    walk(path.join(currentPath, entry), results);
  }

  return results;
}

function checkJavaScript(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  new vm.Script(source, { filename: filePath });
}

function checkJson(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  JSON.parse(source);
}

const files = DIRECTORIES.flatMap((directory) => walk(path.join(ROOT, directory)));

for (const filePath of files) {
  if (path.extname(filePath) === '.js') {
    checkJavaScript(filePath);
  } else if (path.extname(filePath) === '.json') {
    checkJson(filePath);
  }
}

console.log(`Lint checks passed for ${files.length} files.`);
