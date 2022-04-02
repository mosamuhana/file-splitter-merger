"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _SpliterMerger_defaultFormat;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpliterMerger = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const promises_2 = require("stream/promises");
const promises_3 = require("fs/promises");
const DEFAULT_FORMAT = "{file}.{index}";
class SpliterMerger {
    constructor() {
        _SpliterMerger_defaultFormat.set(this, DEFAULT_FORMAT);
    }
    get defaultFormat() {
        return __classPrivateFieldGet(this, _SpliterMerger_defaultFormat, "f");
    }
    set defaultFormat(format) {
        if (format == null)
            throw new Error("format is required");
        if (format.indexOf("{index}") < 0)
            throw new Error("format must contain {index}");
        if (format.indexOf("{file}") < 0)
            throw new Error("format must contain {file}");
        __classPrivateFieldSet(this, _SpliterMerger_defaultFormat, format, "f");
    }
    /**
     * Split a big file to small pieces
     * @param {string} filePath the absolute file path.
     * @param {number} partSize the file size of one piece.
     * @param {string?} format - optional format to use for the file name
     */
    split(filePath, partSize, format) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileSize = (yield (0, promises_1.lstat)(filePath)).size;
            if (fileSize < partSize)
                throw new Error("File too small");
            const { base, dir } = (0, path_1.parse)(filePath);
            format !== null && format !== void 0 ? format : (format = __classPrivateFieldGet(this, _SpliterMerger_defaultFormat, "f"));
            format = format.replace("{file}", base);
            const parts = _rangeSplit(fileSize, partSize).map(({ index, start, end }) => ({
                start,
                end,
                file: (0, path_1.join)(dir, format.replace("{index}", `${index}`)),
            }));
            return yield Promise.all(parts.map(({ start, end, file }) => __awaiter(this, void 0, void 0, function* () {
                yield _writePart(filePath, file, start, end);
                return file;
            })));
        });
    }
    /**
     * merge small pieces to a new file
     * @param {array} files - an array of file absolute path
     * @param {string} destination - path for the new file
     */
    merge(files, destination) {
        return __awaiter(this, void 0, void 0, function* () {
            const writer = (0, fs_1.createWriteStream)(destination, { encoding: "ascii", autoClose: false });
            for (const file of files) {
                const reader = (0, fs_1.createReadStream)(file);
                reader.pipe(writer, { end: false });
                yield (0, promises_2.finished)(reader);
            }
        });
    }
    /**
     * find file parts
     * @param {string} filePath - base file path to search for
     * @param {string?} format - optional format to use for the file name
     */
    findParts(filePath, format) {
        return __awaiter(this, void 0, void 0, function* () {
            const { dir, base } = (0, path_1.parse)(filePath);
            format !== null && format !== void 0 ? format : (format = __classPrivateFieldGet(this, _SpliterMerger_defaultFormat, "f"));
            format = format.replace("{file}", base);
            const files = yield (0, promises_3.readdir)(dir);
            const count = files.length;
            const indexFiles = [];
            for (let i = 0; i < count; i++) {
                const file = format.replace("{index}", `${i}`).toLowerCase();
                const found = files.find(x => x.toLowerCase() == file);
                if (found) {
                    indexFiles.push((0, path_1.join)(dir, found));
                }
                else {
                    break;
                }
            }
            return indexFiles;
        });
    }
}
exports.SpliterMerger = SpliterMerger;
_SpliterMerger_defaultFormat = new WeakMap();
function _writePart(sourceFile, targetFile, start, end) {
    return __awaiter(this, void 0, void 0, function* () {
        const reader = (0, fs_1.createReadStream)(sourceFile, {
            flags: "r",
            start,
            end,
            autoClose: true,
        });
        const writer = (0, fs_1.createWriteStream)(targetFile);
        reader.pipe(writer);
        yield (0, promises_2.finished)(writer);
    });
}
function _rangeSplit(total, part) {
    const count = Math.floor(total / part);
    const ranges = [];
    let start = 0;
    let index = 0;
    for (; index < count;) {
        const end = start + part - 1;
        ranges.push({ index, start, end });
        start = end + 1;
        index++;
    }
    if (start < total) {
        ranges.push({ index, start, end: total - 1 });
    }
    return ranges;
}
