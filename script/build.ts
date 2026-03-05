import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build Vite client
console.log('Building Vite client...');
try {
  // Run vite build with correct output
  execSync('npx vite build', {
    cwd: path.resolve(__dirname, '..', 'client'),
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_ROOT: path.resolve(__dirname, '..')
    }
  });
  console.log('✓ Client build completed!');
} catch (error) {
  console.error('✗ Vite build failed:', error.message);
  process.exit(1);
}
