
jest.mock('vscode',()=>{
  return {
    EventEmitter: jest.fn().mockImplementation(() => {
      return {
          event: jest.fn(),
          fire: jest.fn(),
      };
    })
  }
},{virtual: true});

import { TranslateManager, encodeMarkdownUriComponent } from '../index';
import { markdown } from './fixtures/translate_data';


const Storeage = jest.fn().mockImplementation(() => {
    return {
        get: ()=>{},
        update:async ()=>{}
    };
  });

const Translator = jest.fn().mockImplementation(() => {
    return {
        translate: jest.fn((text:string)=>{
          return Promise.resolve(text.split('\n').map(()=>'你好').join('\n'));
        }),
        link: jest.fn().mockResolvedValue('google'),
        maxLen: 1000
    };
  });

let translateManager = new TranslateManager(new Storeage(),10000);
translateManager.registry('test', Translator);
translateManager.setSource('test');

test('default maxLen should equal 10000', async () => {
    let res = await translateManager.translate('hello', {to:'zh-cn'});
    expect(res).toEqual('你好');
    expect(translateManager.maxLen).toEqual(10000);
});

test('markdwon', async()=>{
  let maxLen = 0;
  const Translator1 = jest.fn().mockImplementation(() => {
    return {
        translate: jest.fn((text:string)=>{
          maxLen = Math.max(maxLen, text.length);
          return Promise.resolve(text.split('\n').map(()=>'你好').join('\n'));
        }),
        link: jest.fn().mockResolvedValue('google'),
        maxLen: 1000
    };
  });
  translateManager.registry('test1', Translator1);
  translateManager.setSource('test1');
  let res = await translateManager.translate(markdown, {to:'zh-cn'});
  expect(maxLen).toBeLessThan(1000);
  expect(res.split('\n').length).toEqual(markdown.split('\n').length);

});

test('encodeMarkdownUri', ()=>{
  encodeMarkdownUriComponent('<a href="/index">hello ()</a>');
})


test('should encode a markdown URI', () => {
  const input = "https://github.com/example_repo/(test)";
  const output = "https%3A%2F%2Fgithub.com%2Fexample_repo%2F%28test%29";

  expect(encodeMarkdownUriComponent(input)).toEqual(output);
});

test('should handle special characters properly', () => {
  const input = "https://github.com/example_repo/[test]/?q=test#fragment";
  const output = "https%3A%2F%2Fgithub.com%2Fexample_repo%2F%5Btest%5D%2F%3Fq%3Dtest%23fragment";

  expect(encodeMarkdownUriComponent(input)).toEqual(output);
});

test('should return an empty string if the input is empty', () => {
  const input = "";
  const output = "";

  expect(encodeMarkdownUriComponent(input)).toEqual(output);
});
