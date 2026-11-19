const fs = require("fs");
const path = require("path");

const figPath = path.resolve("../hireloop-resources/hireloop.fig");
const buf = fs.readFileSync(figPath);

// Locate End of Central Directory Record (EOCD)
// Signature: 0x06054b50
let eocdOffset = -1;
for (let i = buf.length - 22; i >= 0; i--) {
  if (buf.readUInt32LE(i) === 0x06054b50) {
    eocdOffset = i;
    break;
  }
}

if (eocdOffset === -1) {
  console.log("EOCD not found");
  process.exit(1);
}

const totalEntries = buf.readUInt16LE(eocdOffset + 10);
const cdSize = buf.readUInt32LE(eocdOffset + 12);
const cdOffset = buf.readUInt32LE(eocdOffset + 16);

console.log(`Found ${totalEntries} entries in Central Directory`);

let ptr = cdOffset;
const entries = [];
for (let i = 0; i < totalEntries; i++) {
  if (buf.readUInt32LE(ptr) !== 0x02014b50) {
    console.log("Invalid Central Directory header at", ptr);
    break;
  }
  const method = buf.readUInt16LE(ptr + 10);
  const compSize = buf.readUInt32LE(ptr + 20);
  const uncompSize = buf.readUInt32LE(ptr + 24);
  const nameLen = buf.readUInt16LE(ptr + 28);
  const extraLen = buf.readUInt16LE(ptr + 30);
  const commentLen = buf.readUInt16LE(ptr + 32);
  const localHeaderOffset = buf.readUInt32LE(ptr + 42);

  const name = buf.subarray(ptr + 46, ptr + 46 + nameLen).toString("utf8");
  entries.push({ name, compSize, uncompSize, localHeaderOffset, method });

  ptr += 46 + nameLen + extraLen + commentLen;
}

entries.forEach(e => console.log(e.name, e.uncompSize));
