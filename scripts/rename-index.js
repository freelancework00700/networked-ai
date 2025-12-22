const fs = require('fs');
const path = require('path');

const browserDist = path.join(__dirname, '../dist/browser');

const csrIndex = path.join(browserDist, 'index.csr.html');
const finalIndex = path.join(browserDist, 'index.html');

if (fs.existsSync(csrIndex)) {
  fs.renameSync(csrIndex, finalIndex);
  console.log('✅ index.csr.html renamed to index.html');
}
