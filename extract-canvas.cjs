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
let canvasData = null;
for (let i = 0; i < totalEntries; i++) {
  const compSize = buf.readUInt32LE(ptr + 20);
  const nameLen = buf.readUInt16LE(ptr + 28);
  const extraLen = buf.readUInt16LE(ptr + 30);
  const commentLen = buf.readUInt16LE(ptr + 32);
  const localHeaderOffset = buf.readUInt32LE(ptr + 42);
  const method = buf.readUInt16LE(ptr + 10);

  const name = buf.subarray(ptr + 46, ptr + 46 + nameLen).toString("utf8");
  if (name === "canvas.fig") {
    const localNameLen = buf.readUInt16LE(localHeaderOffset + 26);
    const localExtraLen = buf.readUInt16LE(localHeaderOffset + 28);
    const dataOffset = localHeaderOffset + 30 + localNameLen + localExtraLen;
    const rawData = buf.subarray(dataOffset, dataOffset + compSize);
    canvasData = method === 8 ? zlib.inflateRawSync(rawData) : rawData;
    break;
  }
  ptr += 46 + nameLen + extraLen + commentLen;
}

console.log("Canvas length:", canvasData.length);
console.log("First 32 bytes hex:", canvasData.subarray(0, 32).toString("hex"));

// In fig-kiwi format:
// Byte 0-7: "fig-kiwi"
// Byte 8-11: uint32 version
// Byte 12-15: uint32 length of schema?
const version = canvasData.readUInt32LE(8);
console.log("Version:", version);
const len1 = canvasData.readUInt32LE(12);
console.log("Len 1:", len1);

// Let's check chunks
// Figma format structure:
// header (8 bytes 'fig-kiwi')
// version (4 bytes)
// uint32 schema_length
// schema bytes (compressed with deflate/inflateRaw or raw?)
let offset = 12;
while (offset < canvasData.length) {
  const chunkLen = canvasData.readUInt32LE(offset);
  console.log(`Offset ${offset}: chunkLen ${chunkLen}`);
  offset += 4;
  const chunk = canvasData.subarray(offset, offset + chunkLen);
  try {
    const inflated = zlib.inflateRawSync(chunk);
    console.log(`  -> Inflated raw size: ${inflated.length}`);
    // Check if it has strings
    const str = inflated.toString("utf8");
    if (str.includes("Job") || str.includes("job")) {
      console.log("  -> Chunk contains 'Job'!");
    }
  } catch (e) {
    try {
      const inflated = zlib.inflateSync(chunk);
      console.log(`  -> Inflated zlib size: ${inflated.length}`);
    } catch (e2) {
      console.log(`  -> Failed to inflate: ${e.message}`);
    }
  }
  offset += chunkLen;
  if (offset > 10000000) break;
}
