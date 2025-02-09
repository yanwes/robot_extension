import * as vscode from 'vscode';
import { KeywordProvider } from './keywordProvider';

export function activate(context: vscode.ExtensionContext) {
    const provider = new KeywordProvider();
    vscode.window.registerTreeDataProvider('robotKeywords', provider);

    context.subscriptions.push(
        vscode.commands.registerCommand('robotKeywords.refresh', () => {
            console.log("🔄 Refreshing keywords...");
            provider.refresh();
        }),
        vscode.commands.registerCommand('robotKeywords.openKeyword', (filePath: string, line: number) => {
            console.log(`📂 Opening keyword in file: ${filePath}, at line: ${line}`);
            provider.openKeyword(filePath, line);
        }),
        vscode.commands.registerCommand('robotKeywords.promptSearch', async () => {
            const searchTerm = await vscode.window.showInputBox({
                prompt: "Digite a keyword para filtrar",
                placeHolder: "Exemplo: login",
            });

            if (searchTerm && searchTerm.trim() !== "") {
                console.log(`🔍 Filtering keywords with: ${searchTerm}`);
                provider.setFilter(searchTerm);
            } else {
                console.log("🔄 Resetting filter (empty search input)");
                provider.clearFilter();
            }
        }),
        vscode.commands.registerCommand('robotKeywords.clearFilter', () => {
            console.log("🗑️ Clearing keyword filter...");
            provider.clearFilter();
        })
    );
}

export function deactivate() {}