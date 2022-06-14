export const markdown  = `
# Markdown Support for Visual Studio Code <!-- omit in toc -->

[![version](https://img.shields.io/vscode-marketplace/v/yzhang.markdown-all-in-one.svg?style=flat-square&label=vscode%20marketplace)](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one)
[![installs](https://img.shields.io/vscode-marketplace/d/yzhang.markdown-all-in-one.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/yzhang-gh/vscode-markdown/CI?style=flat-square)](https://github.com/yzhang-gh/vscode-markdown/actions)
[![GitHub stars](https://img.shields.io/github/stars/yzhang-gh/vscode-markdown.svg?style=flat-square&label=github%20stars)](https://github.com/yzhang-gh/vscode-markdown)
[![GitHub Contributors](https://img.shields.io/github/contributors/yzhang-gh/vscode-markdown.svg?style=flat-square)](https://github.com/yzhang-gh/vscode-markdown/graphs/contributors)

All you need for Markdown (keyboard shortcuts, table of contents, auto preview and more).

***Note***: VS Code has basic Markdown support out-of-the-box (e.g, **Markdown preview**), please see the [official documentation](https://code.visualstudio.com/docs/languages/markdown) for more information.

**Table of Contents**

- [Features](#features)
  - [Keyboard shortcuts](#keyboard-shortcuts)
  - [Table of contents](#table-of-contents)
  - [List editing](#list-editing)
  - [Print Markdown to HTML](#print-markdown-to-html)
  - [GitHub Flavored Markdown](#github-flavored-markdown)
  - [Math](#math)
  - [Auto completions](#auto-completions)
  - [Others](#others)
- [Available Commands](#available-commands)
- [Keyboard Shortcuts](#keyboard-shortcuts-1)
- [Supported Settings](#supported-settings)
- [FAQ](#faq)
    - [Q: Error "command 'markdown.extension.onXXXKey' not found"](#q-error-command-markdownextensiononxxxkey-not-found)
    - [Q: Which Markdown syntax is supported?](#q-which-markdown-syntax-is-supported)
    - [Q: This extension has overridden some of my key bindings (e.g. <kbd>Ctrl</kbd> + <kbd>B</kbd>, <kbd>Alt</kbd> + <kbd>C</kbd>)](#q-this-extension-has-overridden-some-of-my-key-bindings-eg-ctrl--b-alt--c)
    - [Q: The extension is unresponsive, causing lag etc. (performance issues)](#q-the-extension-is-unresponsive-causing-lag-etc-performance-issues)
- [Changelog](#changelog)
- [Latest Development Build](#latest-development-build)
- [Contributing](#contributing)
- [Related](#related)

## Features

### Keyboard shortcuts

<p><img src="https://github.com/yzhang-gh/vscode-markdown/raw/master/images/gifs/toggle-bold.gif" alt="toggle bold gif" width="282px">
<br>(Typo: multiple words)</p>

<p><img src="https://github.com/yzhang-gh/vscode-markdown/raw/master/images/gifs/check-task-list.gif" alt="check task list" width="240px"></p>

See full key binding list in the [keyboard shortcuts](#keyboard-shortcuts-1) section

### Table of contents

<p><img src="https://github.com/yzhang-gh/vscode-markdown/raw/master/images/toc.png" alt="toc" width="305px"></p>

- Run command "**Create Table of Contents**" (in the [VS Code Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette)) to insert a new table of contents.

- The TOC is **automatically updated** on file save by default. To disable, please change the \`toc.updateOnSave\` option.

- The **indentation type (tab or spaces)** of TOC can be configured per file. Find the setting in the right bottom corner of VS Code's status bar.

  ***Note***: Be sure to also check the \`list.indentationSize\` option.

- To make TOC **compatible with GitHub or GitLab**, set option \`slugifyMode\` accordingly

- Three ways to **control which headings are present** in the TOC:

  <details>
  <summary>Click to expand</summary>

  1. Add \`<!-- omit from toc -->\` at the end of a heading to ignore it in TOC\
    (It can also be placed above a heading)

  2. Use \`toc.levels\` setting.

  3. You can also use the \`toc.omittedFromToc\` setting to omit some headings (and their subheadings) from TOC:
`;