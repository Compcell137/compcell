const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', '.next');

async function removeDir(dir) {
  if (!fs.existsSync(dir)) return;
  try {
    await fs.promises.rm(dir, { recursive: true, force: true });
    console.log('Removed:', dir);
  } catch (err) {
    console.error('Error removing', dir, err);
    process.exitCode = 1;
  }
}

(async () => {
  console.log('Cleaning build artifacts...');
  await removeDir(target);
  console.log('Done.');
})();
