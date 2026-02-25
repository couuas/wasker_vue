import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.resolve(__dirname, '../src/content');

// Check if content directory exists and is not empty
function checkSubmodule() {
    if (!fs.existsSync(contentDir)) {
        console.error('❌ ERROR: Content directory does not exist!');
        console.error('   The src/content submodule has not been initialized.');
        console.error('');
        console.error('   Please run:');
        console.error('   git submodule update --init --recursive');
        console.error('');
        process.exit(1);
    }

    const files = fs.readdirSync(contentDir);
    // Filter out .git file which is created for submodules
    const contentFiles = files.filter(f => f !== '.git' && f !== '.github');
    
    if (contentFiles.length === 0) {
        console.error('❌ ERROR: Content directory is empty!');
        console.error('   The src/content submodule has not been initialized.');
        console.error('');
        console.error('   Please run:');
        console.error('   git submodule update --init --recursive');
        console.error('');
        process.exit(1);
    }

    console.log('✅ Content submodule is initialized');
}

checkSubmodule();
