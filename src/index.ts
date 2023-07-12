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

export class TranslateManager implements ITranslate {

    private _translate: ITranslate | null = null;
    protected _onTranslate = new EventEmitter<string>();
    private _registry: Map<string, new () => ITranslate> = new Map();
    private _source: string = '';
    private _inRequest: Map<string, Promise<string>> = new Map();
    
    constructor(private _storage: Memento, public maxLen = 5000, public opts:ITranslateOptions = {to:'auto', from:'auto'}) {
    }

    public get translator() {
        if (!this._translate) {
            throw new Error('Translate not found.');
        }
        return this._translate;
    }

    /**
     * Checks if the given source exists in the registry.
     *
     * @param {string} source - The source to check.
     * @return {boolean} True if the source exists in the registry, false otherwise.
     */
    public hasSource(source:string) {
        return this._registry.has(source);
    }

    /**
     * Sets the source string for translation.
     *
     * @param {string} source - The new source string to set.
     * @return {void} - Returns nothing.
     */
    public setSource(source:string) {
        if (this._source === source) return this._translate;
        this._source = source;
        return this._createTranslate();
    }

    private _createTranslate(): ITranslate | null {
        const ctor = this._registry.get(this._source);
        if (!ctor) return null;
        this._translate = new ctor();
        return this._translate;
    }

    /**
     * Returns the event associated with the `onTranslate` property.
     *
     * @return {Event} The event associated with the `onTranslate` property.
     */
    get onTranslate() {
        return this._onTranslate.event;
    }

    /**
     * Get all source.
     *
     * @return {Array<any>} An array of all source.
     */
    public getAllSource() {
        return [...this._registry.keys()];
    }

    /**
     * Adds a translation function to the registry.
     *
     * @param {string} title - The title of the translation function.
     * @param {new () => ITranslate} ctor - The constructor of the translation function.
     * @return {ReturnType<this['getAllSource']>} - The result of calling getAllSource.
     */
    public registry(title: string, ctor: new () => ITranslate) {
        this._registry.set(title, ctor);
        return this.getAllSource();
    }

    private async _subTranslate(text: string, { to, from = 'auto' }: ITranslateOptions) {
        const key = `${this._source}-from[${from}]to[${to}]-${text}`;
        try {
            // 网络请求中
            if (this._inRequest.has(key)) {
                return this._inRequest.get(key);
            }
            let action = this.translator.translate(text, { from, to });
            this._inRequest.set(key, action);
            
            const translated = await action;
            this._inRequest.delete(key);


            return translated;
        } catch (e:any) {
            this._inRequest.delete(key);
            const exceptTranslateTip = `\n[${this._source}]: request error:\n ${e.toString()} \n Try again later or change translate source.`;
            this._onTranslate.fire(exceptTranslateTip);
            throw e;
        }
    }

   
    /**
     * Translate the given text from one language to another.
     *
     * @param {string} text - The text to be translated.
     * @param {ITranslateOptions} options - The options for translation.
     * @param {string} options.to - The language to translate to. Defaults to the value set in `this.opts.to`.
     * @param {string} options.from - The language to translate from. Defaults to the value set in `this.opts.from`.
     * @return {Promise<string>} - The translated text.
     */
    public async translate(text: string, { to = this.opts.to, from = this.opts.from }: ITranslateOptions = this.opts) {

        if(text.length>this.maxLen) {
            return `There are more than ${this.maxLen} characters with translation, please reduce the translation content.`;
        }

        const key = `${this._source}-from[${from}]to[${to}]-${text}`;
        // 命中本地存储
        const cashe = this._storage.get<string>(key);
        if (cashe) {
            return cashe;
        }
        let maxLenTexts = splitText(text,this.translator.maxLen || 1000);
        let translateTasks = maxLenTexts.map(subText=>{
            return this._subTranslate(subText,{to,from});
        });
        try{
            const startTranslateTip = `\n[Start translate]: Use '${this._source}' translate source`;
            this._onTranslate.fire(startTranslateTip);
            let translated = (await Promise.all(translateTasks)).join('\n');
            const successTranslateTip = `\n[${this._source}]:\n${text}\n[<============================>]:\n${translated}\n`;
            this._onTranslate.fire(successTranslateTip);
            this._storage.update(key, translated);  // 不用等待持久化成功，直接返回。
            return translated;
        } catch(e) {
            this._onTranslate.fire(JSON.stringify(e));
            return '';
        }
        
    }

    
    /**
     * Generates a link with translated text.
     *
     * @param {string} text - The text to be translated.
     * @param {ITranslateOptions} options - The translation options.
     * @param {string} options.to - The target language to translate to. Defaults to this.opts.to.
     * @param {string} options.from - The source language to translate from. Defaults to this.opts.from.
     * @return {string} The translated text wrapped in a link.
     */
    public link(text: string, { to = this.opts.to, from = this.opts.from }: ITranslateOptions = this.opts) {
        try {
            return this.translator.link(text, {to, from});
        } catch (e) {
            this._onTranslate.fire(JSON.stringify(e));
            return '';
        }
    }
}

function splitText(text:string, maxLen:number):string[] {
    if(text.length < maxLen) return [text];
    const texts = text.split('\n');
    let maxLenTexts:string[] = [];
    
    let subTexts:string[] = [];
    let subLen = 0;
    for(let i=0;i<texts.length;i++) {
        const lineText = texts[i];
        // fix \n text length
        if(subLen+ subTexts.length + lineText.length <= maxLen) {
            subLen +=lineText.length;
            subTexts.push(lineText);
        } else {
            maxLenTexts.push(subTexts.join('\n'));
            // 重置下一片段。  TODO 这里比较隐晦，可以重构简单一些
            subTexts = [lineText];
            subLen = lineText.length;
        }
    }

    if(subTexts.length>0) {
        maxLenTexts.push(subTexts.join('\n'));
    }

    return maxLenTexts;
}

/**
* Encode the incoming markdown URI to avoid conflicts with the original markdown format.
* @param uri The markdown URI string to be encoded
* @returns The encoded string
*/
export function encodeMarkdownUriComponent(uri: string): string {
    return encodeURIComponent(uri)
        .replace(/[()]/g, (char) => `%${char.charCodeAt(0).toString(16)}`);
}