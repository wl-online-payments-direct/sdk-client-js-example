const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
    console.error('Destination path is not provided');

    return;
}

const sourceDir = path.resolve(__dirname, './../shared/design/images');
const destinationDir = path.resolve(process.cwd(), process.argv[2]);
console.log(`copying from ${sourceDir} to ${destinationDir}`);

fs.rmSync(destinationDir, { recursive: true, force: true });
fs.cpSync(sourceDir, destinationDir, { recursive: true });

console.log('Copied the design files.');
