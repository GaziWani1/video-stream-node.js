import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// ES MODULE
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/video', (req, res) => {
  const videoPath = path.join(__dirname, 'public/song.mp4');
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;
  if(range){
    const parts = range.replace(/bytes=/, '').split('-');
    console.log('parts',parts);
    const start = parseInt(parts[0], 10);
    console.log('start',start)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    console.log('end',end)
    const chunkSize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'inline', // Ensure inline playback
    };

    res.writeHead(206, headers);
    file.pipe(res);

  }else{
    const headers = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'inline',
    };
    res.writeHead(200, headers);
    fs.createReadStream(videoPath).pipe(res);
  }

});

app.listen(3000, () => {
  console.log(`server is running on 8000`);
});
