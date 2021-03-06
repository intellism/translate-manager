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

export class TranslateManager implements ITranslate {

    private _translate: ITranslate | null = null;
    protected _onTranslate = new EventEmitter<string>();
    private _registry: Map<string, new () => ITranslate> = new Map();
    private _source: string = '';
    private _inRequest: Map<string, Promise<string>> = new Map();
    constructor(private _storage: Memento, private _maxLen = 5000) {
    }

    public get maxLen() {
        return this._maxLen;
    }
    public get translator() {
        if (!this._translate) {
            throw new Error('Translate not found.');
        }
        return this._translate;
    }

    public hasSource(source:string) {
        return this._registry.has(source);
    }

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

    get onTranslate() {
        return this._onTranslate.event;
    }

    public getAllSource() {
        return [...this._registry.keys()];
    }

    public registry(title: string, ctor: new () => ITranslate) {
        this._registry.set(title, ctor);
        return this.getAllSource();
    }

    private async _subTranslate(text: string, { to, from = 'auto' }: ITranslateOptions) {
        const key = `${this._source}-from[${from}]to[${to}]-${text}`;
        try {
            // ???????????????
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

    public async translate(text: string, { to, from = 'auto' }: ITranslateOptions) {

        if(text.length>this.maxLen) {
            return `There are more than ${this.maxLen} characters with translation, please reduce the translation content.`;
        }

        const key = `${this._source}-from[${from}]to[${to}]-${text}`;
        // ??????????????????
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
            this._storage.update(key, translated);  // ?????????????????????????????????????????????
            return translated;
        } catch(e) {
            this._onTranslate.fire(JSON.stringify(e));
            return '';
        }
        
    }

    public link(text: string, opts: ITranslateOptions) {
        try {
            return this.translator.link(text, opts);
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
            // ?????????????????????  TODO ?????????????????????????????????????????????
            subTexts = [lineText];
            subLen = lineText.length;
        }
    }

    if(subTexts.length>0) {
        maxLenTexts.push(subTexts.join('\n'));
    }

    return maxLenTexts;
}