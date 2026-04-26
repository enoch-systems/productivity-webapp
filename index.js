const fs = require('fs').promises
const path = require('path')

async function countWords(filePath) {
  const absolute = path.resolve(filePath)
  const content = await fs.readFile(absolute, 'utf8')
  const words = content.trim().split(/\s+/)

  console.log('File:', filePath)
console.log('Words:', words.length)
console.log('Lines:', content.split('\n').length)
console.log('Characters:', content.length)
}

const target = process.argv[2]

if (!target) {
  console.log('Usage: node index.js <filename>')
} else {
  countWords(target)
}