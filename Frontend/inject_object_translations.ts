import { Project, SyntaxKind, StringLiteral } from 'ts-morph';
import * as fs from 'fs';

const project = new Project();
project.addSourceFilesAtPaths("src/{pages,components,layouts,sdk,store}/**/*.{tsx,ts}");

const extractedStringsPath = 'extracted_objects.json';
if (!fs.existsSync(extractedStringsPath)) {
    console.error("extracted_objects.json not found!");
    process.exit(1);
}
const extractedStrings: string[] = JSON.parse(fs.readFileSync(extractedStringsPath, 'utf-8'));
const stringSet = new Set(extractedStrings);

let filesModified = 0;
const targetKeys = ['name', 'label', 'title', 'description', 'subtitle', 'header', 'category', 'type', 'role', 'department', 'location', 'status', 'risk_level'];

for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();
    if (filePath.includes("useLanguageStore.ts") || filePath.includes("extract_") || filePath.includes("inject_")) continue;

    let fileModified = false;
    let needsImport = false;

    if (filePath.includes("personalities/index.ts")) {
        continue; // We handle this separately
    }

    const props = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAssignment);
    // Reverse iterate to avoid invalidating nodes when we replace
    for (let i = props.length - 1; i >= 0; i--) {
        const prop = props[i];
        const nameNode = prop.getNameNode();
        if (!nameNode) continue;
        const keyName = nameNode.getText().replace(/['"]/g, '');
        
        if (targetKeys.includes(keyName)) {
            const initializer = prop.getInitializer();
            if (initializer && initializer.getKind() === SyntaxKind.StringLiteral) {
                const text = (initializer as StringLiteral).getLiteralValue().trim();
                if (stringSet.has(text)) {
                    // Check if we are inside a component, otherwise t() might be undefined.
                    // But we injected const { t } = useLanguageStore(); into all exported functions!
                    // If it's a global dummy data array outside a function, t() will fail at runtime.
                    // Oh! If the object is outside a function, it can't use t().
                    // Let's check if the property assignment is inside a function or a React component.
                    const fn = prop.getFirstAncestorByKind(SyntaxKind.FunctionDeclaration) || 
                               prop.getFirstAncestorByKind(SyntaxKind.ArrowFunction);
                    
                    if (fn) {
                        prop.setInitializer(`t("${text.replace(/"/g, '\\"')}")`);
                        fileModified = true;
                        needsImport = true;
                    }
                }
            }
        }
    }

    if (needsImport) {
        const imports = sourceFile.getImportDeclarations();
        const hasImport = imports.some(imp => imp.getModuleSpecifierValue() === "@/store/useLanguageStore" || imp.getModuleSpecifierValue() === "../../store/useLanguageStore");
        if (!hasImport) {
            sourceFile.insertImportDeclaration(0, {
                namedImports: ["useLanguageStore"],
                moduleSpecifier: "@/store/useLanguageStore"
            });
            fileModified = true;
        }

        const text = sourceFile.getText();
        if (!text.includes("const { t } = useLanguageStore();")) {
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

console.log(`Successfully injected object translations into ${filesModified} files.`);
