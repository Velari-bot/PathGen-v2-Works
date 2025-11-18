// generate_vtt.js
// Usage: node generate_vtt.js vMdcwibUpMw.txt

const fs = require('fs');
const path = require('path');

function secondsToVtt(ts) {
  const h = Math.floor(ts / 3600);
  const m = Math.floor((ts % 3600) / 60);
  const s = Math.floor(ts % 60);
  const ms = Math.floor((ts % 1) * 1000);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(3,'0')}`;
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node generate_vtt.js <transcript.txt>');
    process.exit(1);
  }
  const filePath = path.resolve(process.cwd(), arg);
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }
  const text = fs.readFileSync(filePath, 'utf8').trim();
  if (!text) {
    console.error('Empty transcript');
    process.exit(1);
  }

  // Estimate words per second (150 WPM = 2.5 WPS)
  const words = text.split(/\s+/);
  const WPS = 150 / 60; // 2.5 words per second
  const wordsPerChunk = Math.round(WPS * 12); // ~30 words per ~12s

  const chunks = [];
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    const chunkWords = words.slice(i, i + wordsPerChunk);
    chunks.push(chunkWords.join(' '));
  }

  let currentStart = 0;
  const cues = chunks.map((c) => {
    const start = currentStart;
    const estDur = Math.max(6, Math.round((c.split(/\s+/).length) / WPS)); // min 6s per cue
    const end = start + estDur;
    currentStart = end;
    return { start, end, text: c.trim() };
  });

  const vttLines = ['WEBVTT', ''];
  cues.forEach((cue, idx) => {
    vttLines.push(`${idx + 1}`);
    vttLines.push(`${secondsToVtt(cue.start)} --> ${secondsToVtt(cue.end)}`);
    vttLines.push(cue.text);
    vttLines.push('');
  });

  const outFile = path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath)) + '.vtt');
  fs.writeFileSync(outFile, vttLines.join('\n'), 'utf8');
  console.log('Wrote VTT ->', outFile);
  console.log('Approx video duration (s):', Math.ceil(currentStart));
}

main().catch(e => { console.error(e); process.exit(1); });

