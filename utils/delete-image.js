import fs from 'fs';
import path from 'path';

export const deleteImageIfExists = (imagePath) => {
    const fullPath = path.join(__dirname, '..', 'public', imagePath);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
};
