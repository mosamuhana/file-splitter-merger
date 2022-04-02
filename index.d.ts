export declare class SpliterMerger {
    #private;
    get defaultFormat(): string;
    set defaultFormat(format: string);
    /**
     * Split a big file to small pieces
     * @param {string} filePath the absolute file path.
     * @param {number} partSize the file size of one piece.
     * @param {string?} format - optional format to use for the file name
     */
    split(filePath: string, partSize: number, format?: string): Promise<string[]>;
    /**
     * merge small pieces to a new file
     * @param {array} files - an array of file absolute path
     * @param {string} destination - path for the new file
     */
    merge(files: string[], destination: string): Promise<void>;
    /**
     * find file parts
     * @param {string} filePath - base file path to search for
     * @param {string?} format - optional format to use for the file name
     */
    findParts(filePath: string, format?: string): Promise<string[]>;
}
