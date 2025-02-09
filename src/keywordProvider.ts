import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { extractKeywords } from './utils';

export class KeywordItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly filePath: string,
        public readonly line: number,
        public readonly isDuplicate: boolean = false
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.tooltip = `${this.label} - Linha ${this.line}`;
        this.description = `Linha ${this.line}`;
        this.command = {
            command: 'robotKeywords.openKeyword',
            title: "Abrir Keyword",
            arguments: [filePath, line]
        };

        if (isDuplicate) {
            this.iconPath = new vscode.ThemeIcon('warning');
        }
    }
}

export class KeywordProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> =
        new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> =
        this._onDidChangeTreeData.event;

    private keywords: KeywordItem[] = [];
    private filteredKeywords: KeywordItem[] = [];
    private filterText: string = "";

    constructor() {
        this.indexKeywords();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(): Thenable<vscode.TreeItem[]> {
        const searchItem = new vscode.TreeItem("🔍 Search Keywords", vscode.TreeItemCollapsibleState.None);
        searchItem.command = {
            command: 'robotKeywords.promptSearch',
            title: "Search Keywords"
        };

        const clearFilterItem = new vscode.TreeItem("🗑️ Reset Filters", vscode.TreeItemCollapsibleState.None);
        clearFilterItem.command = {
            command: 'robotKeywords.clearFilter',
            title: "Reset Filters"
        };

        const keywordCount = new Map<string, number>();
        this.filteredKeywords.forEach(k => {
            keywordCount.set(k.label, (keywordCount.get(k.label) || 0) + 1);
        });

        const highlightedKeywords = this.filteredKeywords.map(keyword => {
            const count = keywordCount.get(keyword.label) || 0;
            return new KeywordItem(keyword.label, keyword.filePath, keyword.line, count > 1);
        });

        const sortedKeywords = highlightedKeywords.sort((a, b) => {
            const labelA = a.label || '';
            const labelB = b.label || '';
            return labelA.localeCompare(labelB);
        });

        return Promise.resolve([searchItem, clearFilterItem, ...sortedKeywords]);
    }

    refresh(): void {
        this.indexKeywords();
        this._onDidChangeTreeData.fire();
    }

    setFilter(filter: string): void {
        this.filterText = filter.toLowerCase();
        this.filteredKeywords = this.keywords.filter(keyword =>
            keyword.label.toLowerCase().includes(this.filterText)
        );

        this._onDidChangeTreeData.fire();
    }

    clearFilter(): void {
        this.filterText = "";
        this.filteredKeywords = [...this.keywords];
        this._onDidChangeTreeData.fire();
    }

    indexKeywords() {
        console.log("🔍 Indexing .robot files...");
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            console.log("❌ No open workspace!");
            return;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        const files = this.getRobotFiles(rootPath);

        console.log("📂 Files found:", files);

        this.keywords = [];
        files.forEach(file => {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const extractedKeywords = extractKeywords(content, file);
                this.keywords.push(...extractedKeywords.map(k => new KeywordItem(k.keyword, file, k.line)));
            } catch (error) {
                console.error(`❌ Error reading the file ${file}:`, error);
            }
        });

        this.filteredKeywords = [...this.keywords];
        this._onDidChangeTreeData.fire();
    }

    private getRobotFiles(dir: string): string[] {
        let results: string[] = [];
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat && stat.isDirectory()) {
                results = results.concat(this.getRobotFiles(filePath));
            } else if (file.endsWith('.robot')) {
                results.push(filePath);
            }
        });
        return results;
    }

    openKeyword(filePath: string, line: number): void {
        vscode.workspace.openTextDocument(filePath).then(doc => {
            vscode.window.showTextDocument(doc).then(editor => {
                const position = new vscode.Position(line - 1, 0);
                const range = new vscode.Range(position, position);
                editor.selection = new vscode.Selection(range.start, range.end);
                editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
            });
        });
    }
}