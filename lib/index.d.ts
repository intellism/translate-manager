import { EventEmitter, Memento } from "vscode";
export interface ITranslate {
    translate(content: string, options: ITranslateOptions): Promise<string>;
    link(content: string, options: ITranslateOptions): string;
    isSupported?: (src: string) => boolean;
    maxLen: number;
}
export interface ITranslateOptions {
    from?: string;
    to: string;
}
export interface ITranslateRegistry {
    (translation: string, translate: new () => ITranslate): void;
}
export declare class TranslateManager implements ITranslate {
    private _storage;
    private _maxLen;
    private _translate;
    protected _onTranslate: EventEmitter<string>;
    private _registry;
    private _source;
    private _inRequest;
    constructor(_storage: Memento, _maxLen?: number);
    get maxLen(): number;
    get translator(): ITranslate;
    hasSource(source: string): boolean;
    setSource(source: string): ITranslate | null;
    private _createTranslate;
    get onTranslate(): import("vscode").Event<string>;
    getAllSource(): string[];
    registry(title: string, ctor: new () => ITranslate): string[];
    private _subTranslate;
    translate(text: string, { to, from }: ITranslateOptions): Promise<string>;
    link(text: string, opts: ITranslateOptions): string;
}
