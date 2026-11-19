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
  if (name === "thumbnail.png") {
    const localNameLen = buf.readUInt16LE(localHeaderOffset + 26);
    const localExtraLen = buf.readUInt16LE(localHeaderOffset + 28);
    const dataOffset = localHeaderOffset + 30 + localNameLen + localExtraLen;
    const rawData = buf.subarray(dataOffset, dataOffset + compSize);
    const data = method === 8 ? zlib.inflateRawSync(rawData) : rawData;
    const outPath = "C:/Users/mhbsa/.gemini/antigravity-cli/brain/69a30267-acd5-4a59-8ee6-3f88e6409de4/thumbnail.png";
    fs.writeFileSync(outPath, data);
    console.log("Saved thumbnail.png", data.length);
  }
  ptr += 46 + nameLen + extraLen + commentLen;
}
