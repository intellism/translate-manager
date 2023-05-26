"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeMarkdownUriComponent = exports.TranslateManager = void 0;
const vscode_1 = require("vscode");
class TranslateManager {
    constructor(_storage, maxLen = 5000) {
        this._storage = _storage;
        this.maxLen = maxLen;
        this._translate = null;
        this._onTranslate = new vscode_1.EventEmitter();
        this._registry = new Map();
        this._source = '';
        this._inRequest = new Map();
    }
    get translator() {
        if (!this._translate) {
            throw new Error('Translate not found.');
        }
        return this._translate;
    }
    hasSource(source) {
        return this._registry.has(source);
    }
    setSource(source) {
        if (this._source === source)
            return this._translate;
        this._source = source;
        return this._createTranslate();
    }
    _createTranslate() {
        const ctor = this._registry.get(this._source);
        if (!ctor)
            return null;
        this._translate = new ctor();
        return this._translate;
    }
    get onTranslate() {
        return this._onTranslate.event;
    }
    getAllSource() {
        return [...this._registry.keys()];
    }
    registry(title, ctor) {
        this._registry.set(title, ctor);
        return this.getAllSource();
    }
    async _subTranslate(text, { to, from = 'auto' }) {
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
        }
        catch (e) {
            this._inRequest.delete(key);
            const exceptTranslateTip = `\n[${this._source}]: request error:\n ${e.toString()} \n Try again later or change translate source.`;
            this._onTranslate.fire(exceptTranslateTip);
            throw e;
        }
    }
    async translate(text, { to, from = 'auto' }) {
        if (text.length > this.maxLen) {
            return `There are more than ${this.maxLen} characters with translation, please reduce the translation content.`;
        }
        const key = `${this._source}-from[${from}]to[${to}]-${text}`;
        // 命中本地存储
        const cashe = this._storage.get(key);
        if (cashe) {
            return cashe;
        }
        let maxLenTexts = splitText(text, this.translator.maxLen || 1000);
        let translateTasks = maxLenTexts.map(subText => {
            return this._subTranslate(subText, { to, from });
        });
        try {
            const startTranslateTip = `\n[Start translate]: Use '${this._source}' translate source`;
            this._onTranslate.fire(startTranslateTip);
            let translated = (await Promise.all(translateTasks)).join('\n');
            const successTranslateTip = `\n[${this._source}]:\n${text}\n[<============================>]:\n${translated}\n`;
            this._onTranslate.fire(successTranslateTip);
            this._storage.update(key, translated); // 不用等待持久化成功，直接返回。
            return translated;
        }
        catch (e) {
            this._onTranslate.fire(JSON.stringify(e));
            return '';
        }
    }
    link(text, opts) {
        try {
            return this.translator.link(text, opts);
        }
        catch (e) {
            this._onTranslate.fire(JSON.stringify(e));
            return '';
        }
    }
}
exports.TranslateManager = TranslateManager;
function splitText(text, maxLen) {
    if (text.length < maxLen)
        return [text];
    const texts = text.split('\n');
    let maxLenTexts = [];
    let subTexts = [];
    let subLen = 0;
    for (let i = 0; i < texts.length; i++) {
        const lineText = texts[i];
        // fix \n text length
        if (subLen + subTexts.length + lineText.length <= maxLen) {
            subLen += lineText.length;
            subTexts.push(lineText);
        }
        else {
            maxLenTexts.push(subTexts.join('\n'));
            // 重置下一片段。  TODO 这里比较隐晦，可以重构简单一些
            subTexts = [lineText];
            subLen = lineText.length;
        }
    }
    if (subTexts.length > 0) {
        maxLenTexts.push(subTexts.join('\n'));
    }
    return maxLenTexts;
}
/**
* Encode the incoming markdown URI to avoid conflicts with the original markdown format.
* @param uri The markdown URI string to be encoded
* @returns The encoded string
*/
function encodeMarkdownUriComponent(uri) {
    return encodeURIComponent(uri)
        .replace(/[()]/g, (char) => `%${char.charCodeAt(0).toString(16)}`);
}
exports.encodeMarkdownUriComponent = encodeMarkdownUriComponent;
//# sourceMappingURL=index.js.map