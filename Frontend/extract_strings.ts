import { Project, SyntaxKind, StringLiteral } from 'ts-morph';
import * as fs from 'fs';

const project = new Project();
project.addSourceFilesAtPaths("src/{pages,components,layouts,sdk,store}/**/*.{tsx,ts}");

const extractedStrings = new Set<string>();

for (const sourceFile of project.getSourceFiles()) {
    if (sourceFile.getFilePath().includes("useLanguageStore.ts")) continue;

    // Extract from t("...")
    const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
    for (const call of calls) {
        if (call.getExpression().getText() === 't') {
            const args = call.getArguments();
            if (args.length > 0) {
                const arg = args[0];
                if (arg.getKind() === SyntaxKind.StringLiteral) {
                    extractedStrings.add((arg as StringLiteral).getLiteralValue());
                }
            }
        }
    }

    // Also get Personalities
    if (sourceFile.getFilePath().includes('personalities/index.ts')) {
        const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
        for (const call of calls) {
            if (call.getExpression().getText() === 'createThemeVariant') {
                const args = call.getArguments();
                if (args.length >= 2) {
                    const nameArg = args[1];
                    if (nameArg.getKind() === SyntaxKind.StringLiteral) {
                        extractedStrings.add((nameArg as StringLiteral).getLiteralValue());
                    }
                }
            }
        }
    }
}

fs.writeFileSync('extracted.json', JSON.stringify(Array.from(extractedStrings), null, 2));
console.log(`Extracted ${extractedStrings.size} strings.`);
