const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '.next');
const statsFile = path.join(buildDir, 'build-manifest.json');

if (fs.existsSync(statsFile)) {
  const stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
  console.log('Build Analysis:', JSON.stringify(stats, null, 2));
} else {
  console.log('No build stats found. Run npm run build first.');
}
