const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const figPath = path.resolve("../hireloop-resources/hireloop.fig");
const buf = fs.readFileSync(figPath);

let eocdOffset = -1;
for (let i = buf.length - 22; i >= 0; i--) {
  if (buf.readUInt32LE(i) === 0x06054b50) {
    eocdOffset = i;
    break;
  }
}
const totalEntries = buf.readUInt16LE(eocdOffset + 10);
const cdOffset = buf.readUInt32LE(eocdOffset + 16);

const outDir = path.resolve("C:/Users/mhbsa/.gemini/antigravity-cli/brain/69a30267-acd5-4a59-8ee6-3f88e6409de4/figma-images");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

let ptr = cdOffset;
for (let i = 0; i < totalEntries; i++) {
  const compSize = buf.readUInt32LE(ptr + 20);
  const uncompSize = buf.readUInt32LE(ptr + 24);
  const nameLen = buf.readUInt16LE(ptr + 28);
  const extraLen = buf.readUInt16LE(ptr + 30);
  const commentLen = buf.readUInt16LE(ptr + 32);
  const localHeaderOffset = buf.readUInt32LE(ptr + 42);
  const method = buf.readUInt16LE(ptr + 10);

  const name = buf.subarray(ptr + 46, ptr + 46 + nameLen).toString("utf8");
  if (name.startsWith("images/") && uncompSize > 0) {
    const localNameLen = buf.readUInt16LE(localHeaderOffset + 26);
    const localExtraLen = buf.readUInt16LE(localHeaderOffset + 28);
    const dataOffset = localHeaderOffset + 30 + localNameLen + localExtraLen;
    const rawData = buf.subarray(dataOffset, dataOffset + compSize);
    const data = method === 8 ? zlib.inflateRawSync(rawData) : rawData;

    // Detect format
    let ext = ".bin";
    if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47) ext = ".png";
    else if (data[0] === 0xff && data[1] === 0xd8) ext = ".jpg";
    else if (data[0] === 0x3c && data[1] === 0x73 && data[2] === 0x76 && data[3] === 0x67) ext = ".svg";

    const baseName = path.basename(name);
    const outPath = path.join(outDir, `${baseName}${ext}`);
    fs.writeFileSync(outPath, data);
    console.log(`Saved: ${baseName}${ext} (${data.length} bytes)`);
  }
  ptr += 46 + nameLen + extraLen + commentLen;
}
