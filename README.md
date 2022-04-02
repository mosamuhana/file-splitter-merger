# file-split-merge

File Splitter Merger

## how to use
`npm install file-splitter-merger --save` 

# Usage:
import:
```javascript
const FileSpliterMerger = require('file-splitter-merger');
```
OR
```typescript
import FileSpliterMerger from 'file-splitter-merger';
```

# Split
```javascript
const fileSpliterMerger = new FileSpliterMerger();
const filePart = 1024 * 1024; // split file for 1 MB = 1024 * 1024
const format = '{file}.{index}'; // optional format default to "{file}.{index}"
const files = fileSpliterMerger.split('/path/file.zip', filePart, format);
// return files splitted
```

# Merge
```javascript
const fileSpliterMerger = new FileSpliterMerger();
const filePath = '/path/file.zip'; // file to search parts for
const format = '{file}.{index}'; // optional format default to "{file}.{index}"
const files = await fileSpliterMerger.findParts(filePath, format);
const destination = '/path/new-file.zip';
fileSpliterMerger.merge(files, destination);
```

# defaultFormat
you can set default Format default to `"{file}.{index}"`
```javascript
FileSpliterMerger.defaultFormat = '{file}_{index}';
```

## Test
clone the repository and use test.ts
