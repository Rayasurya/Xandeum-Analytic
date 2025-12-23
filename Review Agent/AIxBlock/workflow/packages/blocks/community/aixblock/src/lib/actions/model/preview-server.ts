import express from 'express';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export function startPreviewServer(htmlContent: string): Promise<number> {
    return new Promise((resolve) => {
        // Write HTML to temp file
        const tempDir = os.tmpdir();
        const tempFile = path.join(tempDir, 'aixblock-monitoring.html');
        fs.writeFileSync(tempFile, htmlContent);

        // Start local server
        const app = express();
        app.get('/', (req: Request, res: Response) => {
            res.sendFile(tempFile);
        });

        const server = app.listen(0, () => {
            const port = (server.address() as any).port;
            console.log(`Preview server running on port ${port}`);
            resolve(port);
        });
    });
}
