"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractKeywords = extractKeywords;
function extractKeywords(content, filePath) {
    const keywordRegex = /^([\w\s]+)\s*$/gm;
    const ignoredSections = ["Settings", "Variables", "Test Cases"];
    let match;
    const keywords = [];
    const lines = content.split("\n");
    let inIgnoredSection = false;
    lines.forEach((lineText, index) => {
        const trimmedLine = lineText.trim();
        if (ignoredSections.some(section => trimmedLine.includes(section))) {
            inIgnoredSection = true;
            return;
        }
        if (trimmedLine.includes("*** Keywords ***")) {
            inIgnoredSection = false;
            return;
        }
        if (inIgnoredSection) {
            return;
        }
        if (keywordRegex.test(trimmedLine)) {
            keywords.push({ keyword: trimmedLine, line: index + 1 });
        }
    });
    return keywords;
}
