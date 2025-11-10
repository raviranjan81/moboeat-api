import { spawn } from "child_process";
import fs from "fs";

export const removeImageBackground = (inputPath) => {
    const outputPath = inputPath;
    return new Promise((resolve, reject) => {
        const python = spawn("python", ["scripts/remove_bg.py", inputPath, outputPath]);

        python.on("close", (code) => {
            const hasOutput = fs.existsSync(outputPath);
            const hasInput = fs.existsSync(inputPath);
            if (code === 0 && hasOutput) {
                return resolve(outputPath);
            }
            if (hasInput) {
                return resolve(inputPath);
            }
            reject(new Error("Background removal failed and no usable file found."));
        });

        python.on("error", (err) => reject(err));
    });
};
