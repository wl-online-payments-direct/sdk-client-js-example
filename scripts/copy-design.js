/*
 * Do not remove or alter the notices in this preamble.
 *
 * This software is owned by Worldline and may not be be altered, copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way, without the prior written consent of Worldline.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */
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
