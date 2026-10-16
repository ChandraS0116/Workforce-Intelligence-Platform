import { Project, SyntaxKind, JsxText, StringLiteral } from 'ts-morph';
import * as fs from 'fs';

const project = new Project();
project.addSourceFilesAtPaths("src/{pages,components,layouts,sdk}/**/*.{tsx,ts}");

const extractedStringsPath = 'extracted.json';
if (!fs.existsSync(extractedStringsPath)) {
    console.error("extracted.json not found!");
    process.exit(1);
}
const extractedStrings: string[] = JSON.parse(fs.readFileSync(extractedStringsPath, 'utf-8'));
const stringSet = new Set(extractedStrings);

let filesModified = 0;

for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();
    if (filePath.includes("useLanguageStore.ts") || filePath.includes("extract_strings.ts") || filePath.includes("inject_translations.ts")) continue;

    let fileModified = false;
    let needsImport = false;

    // We don't inject `t` into pure `.ts` files easily unless they are inside a React hook/component.
    // However, the Personalities in index.ts are pure JS. The user wants the dropdown to translate them.
    // In Header.tsx we already did `{t(p.metadata.name)}`. So we don't need to wrap the raw strings in index.ts!
    if (filePath.includes("personalities/index.ts")) {
        continue;
    }

    // Replace JSX Text
    const jsxTexts = sourceFile.getDescendantsOfKind(SyntaxKind.JsxText);
    // Reverse iterate to avoid invalidating nodes
    for (let i = jsxTexts.length - 1; i >= 0; i--) {
        const jsxText = jsxTexts[i];
        const text = jsxText.getLiteralText().trim();
        const cleaned = text.replace(/\s+/g, ' ');
        if (stringSet.has(cleaned)) {
            // Need to handle if the text is inside another JSX expression or just replace the node
            // Note: ts-morph JSX replacement can be tricky. We can replace with JsxExpression
            const parent = jsxText.getParent();
            // simple text replacement using string manipulation to be safe
            jsxText.replaceWithText(`{t("${cleaned.replace(/"/g, '\\"')}")}`);
            fileModified = true;
            needsImport = true;
        }
    }

    // Replace JSX Attributes
    const jsxAttributes = sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute);
    for (let i = jsxAttributes.length - 1; i >= 0; i--) {
        const attr = jsxAttributes[i];
        const name = attr.getNameNode().getText();
        if (['title', 'placeholder', 'label', 'description', 'tooltip'].includes(name)) {
            const initializer = attr.getInitializer();
            if (initializer && initializer.getKind() === SyntaxKind.StringLiteral) {
                const text = (initializer as StringLiteral).getLiteralValue().trim();
                if (stringSet.has(text)) {
                    attr.setInitializer(`{t("${text.replace(/"/g, '\\"')}")}`);
                    fileModified = true;
                    needsImport = true;
                }
            }
        }
    }

    if (needsImport) {
        // Check if useLanguageStore is imported
        const imports = sourceFile.getImportDeclarations();
        const hasImport = imports.some(imp => imp.getModuleSpecifierValue() === "@/store/useLanguageStore" || imp.getModuleSpecifierValue() === "../../store/useLanguageStore");
        if (!hasImport) {
            // Add import at top
            sourceFile.insertImportDeclaration(0, {
                namedImports: ["useLanguageStore"],
                moduleSpecifier: "@/store/useLanguageStore"
            });
            fileModified = true;
        }

        // Check if `const { t } = useLanguageStore();` is defined in the component
        // This is highly complex to do via AST perfectly across all files (since a file might have multiple components)
        // Let's do a simple text insertion if it's not there, assuming one main export per file
        const text = sourceFile.getText();
        if (!text.includes("const { t } = useLanguageStore();")) {
            // Find the main function
            const functions = sourceFile.getFunctions();
            for (const fn of functions) {
                if (fn.isExported()) {
                    fn.insertStatements(0, "const { t } = useLanguageStore();");
                    break;
                }
            }
        }
    }

    if (fileModified) {
        sourceFile.saveSync();
        filesModified++;
        console.log(`Modified: ${filePath}`);
    }
}

console.log(`Successfully injected translations into ${filesModified} files.`);
