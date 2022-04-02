import { parse, join } from "path";
import { createReadStream, createWriteStream } from "fs";
import { lstat } from "fs/promises";
import { finished } from "stream/promises";
import { readdir } from "fs/promises";

const DEFAULT_FORMAT = "{file}.{index}";

interface Range {
	index: number;
	start: number;
	end: number;
}

export default class FileSpliterMerger {
	static #defaultFormat: string = DEFAULT_FORMAT;

	static get defaultFormat() {
		return this.#defaultFormat;
	}

	static set defaultFormat(format: string) {
		if (format == null) throw new Error("format is required");
		format = format.trim();
		if (format.indexOf("{index}") < 0)
			throw new Error("format must contain {index}");
		if (format.indexOf("{file}") < 0)
			throw new Error("format must contain {file}");
		this.#defaultFormat = format;
	}

	/**
	 * Split a big file to small pieces
	 * @param {string} filePath the absolute file path.
	 * @param {number} partSize the file size of one piece.
	 * @param {string?} format - optional format to use for the file name
	 */
	async split(filePath: string, partSize: number, format?: string) {
		const fileSize = (await lstat(filePath)).size;
		if (fileSize < partSize) throw new Error("File too small");

		const { base, dir } = parse(filePath);
		format ??= FileSpliterMerger.#defaultFormat;
		format = format.replace("{file}", base);

		const parts = _rangeSplit(fileSize, partSize).map(
			({ index, start, end }) => ({
				start,
				end,
				file: join(dir, format!.replace("{index}", `${index}`)),
			})
		);

		return await Promise.all(
			parts.map(async ({ start, end, file }) => {
				await _writePart(filePath, file, start, end);
				return file;
			})
		);
	}

	/**
	 * merge small pieces to a new file
	 * @param {array} files - an array of file absolute path
	 * @param {string} destination - path for the new file
	 */
	async merge(files: string[], destination: string) {
		const writer = createWriteStream(destination, { encoding: "ascii", autoClose: false });
		for (const file of files) {
			const reader = createReadStream(file);
			reader.pipe(writer, { end: false });
			await finished(reader);
		}
	}

	/**
	 * find file parts
	 * @param {string} filePath - base file path to search for
	 * @param {string?} format - optional format to use for the file name
	 */
	async findParts(filePath: string, format?: string) {
		const { dir, base } = parse(filePath);
		format ??= FileSpliterMerger.#defaultFormat;
		format = format.replace("{file}", base);

		const files = await readdir(dir);
		const count = files.length;

		const indexFiles: string[] = [];
		for (let i = 0; i < count; i++) {
			const file = format.replace("{index}", `${i}`).toLowerCase();
			const found: string | undefined = files.find(x => x.toLowerCase() == file);
			if (found) {
				indexFiles.push(join(dir, found));
			} else {
				break;
			}
		}

		return indexFiles;
	}
}

async function _writePart(sourceFile: string, targetFile: string, start: number, end: number) {
	const reader = createReadStream(sourceFile, {
		flags: "r",
		start,
		end,
		autoClose: true,
	});
	const writer = createWriteStream(targetFile);
	reader.pipe(writer);
	await finished(writer);
}

function _rangeSplit(total: number, part: number) {
	const count = Math.floor(total / part);
	const ranges: Range[] = [];
	let start = 0;
	let index = 0;
	for (; index < count; ) {
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
