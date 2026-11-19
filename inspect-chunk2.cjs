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

const chunk2 = canvasData.subarray(30779 + 4);
console.log("Chunk 2 total len:", chunk2.length);
console.log("Chunk 2 first 32 bytes hex:", chunk2.subarray(0, 32).toString("hex"));

// In modern figma files, chunk 2 is often series of chunks or zlib or snappy or brotli or raw kiwi.
// Or maybe zlib standard (with 78 xx header)?
try {
  const d = zlib.inflateSync(chunk2);
  console.log("Inflated zlib:", d.length);
} catch (e) {
  console.log("zlib error:", e.message);
}

// Or maybe inflateRaw?
try {
  const d = zlib.inflateRawSync(chunk2);
  console.log("Inflated raw:", d.length);
} catch (e) {
  console.log("raw error:", e.message);
}

// Or maybe brotli?
try {
  const d = zlib.brotliDecompressSync(chunk2);
  console.log("Brotli:", d.length);
} catch (e) {
  console.log("brotli error:", e.message);
}
