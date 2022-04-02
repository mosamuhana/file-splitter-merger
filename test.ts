import { join } from "path";

import { SpliterMerger } from './src';

async function testSplit() {
	const dir = join(process.cwd(), "someDir");
	const filePath = join(dir, "vVSD5n8d0E8.m4a");
	const spliterMerger = new SpliterMerger();
	await spliterMerger.split(filePath, 1024 * 1024);
}

async function testMerge() {
	const dir = join(process.cwd(), "someDir");
	const spliterMerger = new SpliterMerger();
	const files = await spliterMerger.findParts(join(dir, "vVSD5n8d0E8.m4a"));
	const filePath = join(dir, "vVSD5n8d0E8_new.m4a");
	await spliterMerger.merge(files, filePath);
}

async function main() {
	await testSplit();
	//await testMerge();
}

main();
