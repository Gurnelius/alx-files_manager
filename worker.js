// worker.js
const Bull = require('bull');
const imageThumbnail = require('image-thumbnail');
const fs = require('fs');
const path = require('path');
const fileQueue = require('./queue');

// Configure the queue
fileQueue.process(async (job) => {
    const { fileId, userId } = job.data;

    if (!fileId) {
        throw new Error('Missing fileId');
    }
    if (!userId) {
        throw new Error('Missing userId');
    }

    // Fetch the file information from the database
    // Replace with your DB logic
    const file = await getFileFromDB(fileId, userId);
    if (!file) {
        throw new Error('File not found');
    }

    // Path to the original image
    const filePath = path.join('/tmp/files_manager', fileId);
    
    // Generate thumbnails
    const sizes = [500, 250, 100];
    for (const size of sizes) {
        const thumbnail = await imageThumbnail(filePath, { width: size });
        const thumbnailPath = `${filePath}_${size}`;
        fs.writeFileSync(thumbnailPath, thumbnail);
    }

    console.log('Thumbnails generated successfully');
});

// Placeholder for your DB fetching function
async function getFileFromDB(fileId, userId) {
    // Implement your DB logic here
}
