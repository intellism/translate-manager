Used for translate source management. Multiple I translate objects are registered together, and the proxy API realizes the switching of different translation sources.

## Installation

Koa requires higher for ES2020 and async function support.

```
$ npm install translate-manager
```

## How to use it

```typescript
let translateManager = new TranslateManager(context.workspaceState);
translateManager.onTranslate(e => {
    console.log(e);
});
```

### Registry translate
Register translate source to manager.
```typescript
export interface ITranslate {
    translate(content: string, options: ITranslateOptions): Promise<string>;
    link(content: string, options: ITranslateOptions): string;
    isSupported?: (src: string) => boolean;
    maxLen: number;
}

/**
 * @param key Registered key
 * @param translate Constructor of ITranslate
 */
translateManager.registry(key, translate);
```

### Switch translate
Switch active translate source
```typescript

if (translateManager.hasSource(key)) {
    return translateManager.setSource(key);
}

```

### Use

Consistent with **ITranslate**
```typescript
translateManager.translate(...);
translateManager.link(...);
translateManager.isSupport(...);
translateManager.maxLen;
```
