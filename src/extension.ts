'use strict';

import { languages, TextDocument, ExtensionContext, CompletionItem, Position, workspace, CompletionItemKind } from 'vscode';
import { exec } from 'child_process';
import { quote } from 'shell-quote';
import * as _ from 'lodash';

const projectRoot = workspace.rootPath ? workspace.rootPath : '.';

export function activate(context: ExtensionContext) {

    // The most simple completion item provider which 
    // * registers for text files (`'plaintext'`), and
    // * only return the 'Hello World' completion
    context.subscriptions.push(languages.registerCompletionItemProvider('*', {
        provideCompletionItems(document: TextDocument, position: Position) {
            console.log(document.getText(document.getWordRangeAtPosition(position)))
            const string = document.getText(document.getWordRangeAtPosition(position));
            const command = quote(['git', 'grep', '-e', `[ |\t]${string}`, '--or', '-e', `^${string}`]);

            return new Promise((resolve, reject) => {
                exec(command, { cwd: projectRoot }, (err, stdout, stderr) => {
                    const lines = _.uniq(stdout.split(/\n/).map((l) => l.replace(/.*:\s*/, "")).filter(l => !!l));
                    resolve(lines.map((line) => new CompletionItem(line, CompletionItemKind.Keyword)));
                });
            });
        },
        resolveCompletionItem: (item, token) => item,
    }, '.'));
}
