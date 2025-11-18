#!/usr/bin/env node
/**
 * Video Verification Script
 * Checks if all videos are properly digested and accessible
 */

const fs = require('fs');
const path = require('path');

const VIDEOS_DIR = __dirname;
const INDEX_FILE = path.join(VIDEOS_DIR, 'index.json');

console.log('🔍 Checking Video Setup...\n');

// Read index
let index = [];
try {
  const indexContent = fs.readFileSync(INDEX_FILE, 'utf8');
  index = JSON.parse(indexContent);
  console.log(`✅ Index file loaded: ${index.length} videos\n`);
} catch (error) {
  console.error('❌ Failed to read index.json:', error.message);
  process.exit(1);
}

// Get all .txt files
const files = fs.readdirSync(VIDEOS_DIR)
  .filter(f => f.endsWith('.txt') && f !== 'index.json' && f !== 'generate_vtt.js' && f !== 'check-videos.js');

const videoIds = index.map(v => v.id.replace('vid-', ''));
const txtFiles = files.map(f => f.replace('.txt', ''));

// Check for missing files
const missing = videoIds.filter(id => !txtFiles.includes(id));
const empty = files.filter(f => {
  const content = fs.readFileSync(path.join(VIDEOS_DIR, f), 'utf8').trim();
  return !content || content.length < 50;
});
const extra = txtFiles.filter(id => !videoIds.includes(id));

// Check transcript references
const transcriptIssues = [];
index.forEach(v => {
  const videoId = v.id.replace('vid-', '');
  const transcriptRef = v.transcript || '';
  const expectedFile = videoId + '.txt';
  
  if (!fs.existsSync(path.join(VIDEOS_DIR, expectedFile))) {
    transcriptIssues.push(`Missing file for ${videoId}: ${transcriptRef}`);
  }
  
  // Check if transcript reference matches
  if (transcriptRef && !transcriptRef.includes(videoId)) {
    transcriptIssues.push(`Transcript ref mismatch for ${videoId}: ${transcriptRef}`);
  }
});

// Report
console.log('📊 VERIFICATION RESULTS\n');
console.log(`Total videos in index: ${videoIds.length}`);
console.log(`Total .txt files: ${txtFiles.length}`);
console.log(`Missing .txt files: ${missing.length}${missing.length > 0 ? ' ❌' : ' ✅'}`);
console.log(`Empty/placeholder files: ${empty.length}${empty.length > 0 ? ' ❌' : ' ✅'}`);
console.log(`Extra .txt files: ${extra.length}${extra.length > 0 ? ' ⚠️' : ' ✅'}`);
console.log(`Transcript reference issues: ${transcriptIssues.length}${transcriptIssues.length > 0 ? ' ❌' : ' ✅'}`);

if (missing.length > 0) {
  console.log('\n❌ Missing files:');
  missing.slice(0, 10).forEach(id => {
    const video = index.find(v => v.id === `vid-${id}`);
    console.log(`   - ${id}${video ? ` (${video.title})` : ''}`);
  });
  if (missing.length > 10) {
    console.log(`   ... and ${missing.length - 10} more`);
  }
}

if (empty.length > 0) {
  console.log('\n❌ Empty/placeholder files:');
  empty.slice(0, 10).forEach(f => {
    console.log(`   - ${f.replace('.txt', '')}`);
  });
}

if (transcriptIssues.length > 0) {
  console.log('\n❌ Transcript reference issues:');
  transcriptIssues.slice(0, 5).forEach(issue => console.log(`   - ${issue}`));
}

// Sample file check
console.log('\n📄 Sample file check:');
const samples = files.slice(0, 5).map(f => {
  const content = fs.readFileSync(path.join(VIDEOS_DIR, f), 'utf8');
  return {
    id: f.replace('.txt', ''),
    size: content.length,
    lines: content.split('\n').length
  };
});
samples.forEach(s => {
  console.log(`   ${s.id}: ${s.size.toLocaleString()} chars, ${s.lines} lines`);
});

// Final status
console.log('\n' + '='.repeat(50));
if (missing.length === 0 && empty.length === 0 && transcriptIssues.length === 0) {
  console.log('✅ ALL VIDEOS ARE PROPERLY SET UP!');
  console.log('✅ Ready for AI assistant to use');
} else {
  console.log('⚠️  Some issues found - see above for details');
}
console.log('='.repeat(50));

