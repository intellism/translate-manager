import { EventEmitter, Memento } from "vscode";
export interface ITranslate {
    translate(content: string, options: ITranslateOptions): Promise<string>;
    link(content: string, options: ITranslateOptions): string;
    isSupported?: (src: string) => boolean;
    maxLen: number;
}
export interface ITranslateOptions {
    from?: string;
    to?: string;
}
export interface ITranslateRegistry {
    (translation: string, translate: new () => ITranslate): void;
}
export declare class TranslateManager implements ITranslate {
    private _storage;
    maxLen: number;
    opts: ITranslateOptions;
    private _translate;
    protected _onTranslate: EventEmitter<string>;
    private _registry;
    private _source;
    private _inRequest;
    constructor(_storage: Memento, maxLen?: number, opts?: ITranslateOptions);
    get translator(): ITranslate;
    /**
     * Checks if the given source exists in the registry.
     *
     * @param {string} source - The source to check.
     * @return {boolean} True if the source exists in the registry, false otherwise.
     */
    hasSource(source: string): boolean;
    /**
     * Sets the source string for translation.
     *
     * @param {string} source - The new source string to set.
     * @return {void} - Returns nothing.
     */
    setSource(source: string): ITranslate | null;
    private _createTranslate;
    /**
     * Returns the event associated with the `onTranslate` property.
     *
     * @return {Event} The event associated with the `onTranslate` property.
     */
    get onTranslate(): import("vscode").Event<string>;
    /**
     * Get all source.
     *
     * @return {Array<any>} An array of all source.
     */
    getAllSource(): string[];
    /**
     * Adds a translation function to the registry.
     *
     * @param {string} title - The title of the translation function.
     * @param {new () => ITranslate} ctor - The constructor of the translation function.
     * @return {ReturnType<this['getAllSource']>} - The result of calling getAllSource.
     */
    registry(title: string, ctor: new () => ITranslate): string[];
    private _subTranslate;
    /**
     * Translate the given text from one language to another.
     *
     * @param {string} text - The text to be translated.
     * @param {ITranslateOptions} options - The options for translation.
     * @param {string} options.to - The language to translate to. Defaults to the value set in `this.opts.to`.
     * @param {string} options.from - The language to translate from. Defaults to the value set in `this.opts.from`.
     * @return {Promise<string>} - The translated text.
     */
    translate(text: string, { to, from }?: ITranslateOptions): Promise<string>;
    /**
     * Generates a link with translated text.
     *
     * @param {string} text - The text to be translated.
     * @param {ITranslateOptions} options - The translation options.
     * @param {string} options.to - The target language to translate to. Defaults to this.opts.to.
     * @param {string} options.from - The source language to translate from. Defaults to this.opts.from.
     * @return {string} The translated text wrapped in a link.
     */
    link(text: string, { to, from }?: ITranslateOptions): string;
}
/**
* Encode the incoming markdown URI to avoid conflicts with the original markdown format.
* @param uri The markdown URI string to be encoded
* @returns The encoded string
*/
export declare function encodeMarkdownUriComponent(uri: string): string;
