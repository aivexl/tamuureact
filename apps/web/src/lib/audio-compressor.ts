import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

export class AudioCompressor {
    private ffmpeg: FFmpeg | null = null;
    private isLoaded = false;

    async load() {
        if (this.isLoaded) return;

        this.ffmpeg = new FFmpeg();

        await this.ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        this.isLoaded = true;
    }

    async compress(file: File): Promise<Blob> {
        if (!this.ffmpeg || !this.isLoaded) {
            await this.load();
        }

        const ffmpeg = this.ffmpeg!;
        const inputName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
        const outputName = 'output.m4a';

        // Write file to memory
        await ffmpeg.writeFile(inputName, await fetchFile(file));

        // Transcode to AAC @ 96kbps
        // We use -b:a 96k for the target bitrate
        await ffmpeg.exec(['-i', inputName, '-c:a', 'aac', '-b:a', '96k', outputName]);

        // Read result
        const data = await ffmpeg.readFile(outputName);

        // Cleanup memory
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);

        // FFmpeg.wasm might return a SharedArrayBuffer which cannot be directly put into a Blob in some TS versions
        // We cast to any and then to Uint8Array to satisfy the buffer requirements
        const uint8Data = new Uint8Array(data as any);
        return new Blob([uint8Data], { type: 'audio/mp4' });
    }
}

export const musicCompressor = new AudioCompressor();
