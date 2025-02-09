"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordProvider = exports.KeywordItem = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const utils_1 = require("./utils");
class KeywordItem extends vscode.TreeItem {
    constructor(label, filePath, line, isDuplicate = false) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.label = label;
        this.filePath = filePath;
        this.line = line;
        this.isDuplicate = isDuplicate;
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
exports.KeywordItem = KeywordItem;
class KeywordProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.keywords = [];
        this.filteredKeywords = [];
        this.filterText = "";
        this.indexKeywords();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren() {
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
        const keywordCount = new Map();
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
    refresh() {
        this.indexKeywords();
        this._onDidChangeTreeData.fire();
    }
    setFilter(filter) {
        this.filterText = filter.toLowerCase();
        this.filteredKeywords = this.keywords.filter(keyword => keyword.label.toLowerCase().includes(this.filterText));
        this._onDidChangeTreeData.fire();
    }
    clearFilter() {
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
                const extractedKeywords = (0, utils_1.extractKeywords)(content, file);
                this.keywords.push(...extractedKeywords.map(k => new KeywordItem(k.keyword, file, k.line)));
            }
            catch (error) {
                console.error(`❌ Error reading the file ${file}:`, error);
            }
        });
        this.filteredKeywords = [...this.keywords];
        this._onDidChangeTreeData.fire();
    }
    getRobotFiles(dir) {
        let results = [];
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat && stat.isDirectory()) {
                results = results.concat(this.getRobotFiles(filePath));
            }
            else if (file.endsWith('.robot')) {
                results.push(filePath);
            }
        });
        return results;
    }
    openKeyword(filePath, line) {
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
exports.KeywordProvider = KeywordProvider;
