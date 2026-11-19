const fs = require("fs");
const path = require("path");

const dir = "C:/Users/mhbsa/.gemini/antigravity-cli/brain/69a30267-acd5-4a59-8ee6-3f88e6409de4/figma-images";
const files = fs.readdirSync(dir);

for (const file of files) {
  const filePath = path.join(dir, file);
  const buf = fs.readFileSync(filePath);
  if (file.endsWith(".png")) {
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    console.log(`${file}: PNG ${width}x${height} (${buf.length} bytes)`);
  } else if (file.endsWith(".jpg")) {
    // simple JPEG dimension finder
    let i = 2;
    let w = 0, h = 0;
    while (i < buf.length) {
      if (buf[i] === 0xff && (buf[i+1] === 0xc0 || buf[i+1] === 0xc2)) {
        h = buf.readUInt16BE(i + 5);
        w = buf.readUInt16BE(i + 7);
        break;
      }
      i++;
    }
    console.log(`${file}: JPG ${w}x${h} (${buf.length} bytes)`);
  }
}
