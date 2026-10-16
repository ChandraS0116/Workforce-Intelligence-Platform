import { Project, SyntaxKind, StringLiteral, PropertyAssignment } from 'ts-morph';
import * as fs from 'fs';

const project = new Project();
project.addSourceFilesAtPaths("src/{pages,components,layouts,sdk,store}/**/*.{tsx,ts}");

const extractedStrings = new Set<string>();

const targetKeys = ['name', 'label', 'title', 'description', 'subtitle', 'header', 'category', 'type', 'role', 'department', 'location', 'status', 'risk_level'];

for (const sourceFile of project.getSourceFiles()) {
    if (sourceFile.getFilePath().includes("useLanguageStore.ts")) continue;

    const props = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAssignment);
    for (const prop of props) {
        const nameNode = prop.getNameNode();
        if (!nameNode) continue;
        const keyName = nameNode.getText().replace(/['"]/g, '');
        
        if (targetKeys.includes(keyName)) {
            const initializer = prop.getInitializer();
            if (initializer && initializer.getKind() === SyntaxKind.StringLiteral) {
                const text = (initializer as StringLiteral).getLiteralValue().trim();
                // Avoid extracting short internal IDs or CSS
                if (text.length > 1 && !text.match(/^[a-z0-9_-]+$/)) {
                    extractedStrings.add(text);
                }
            }
        }
    }
}

fs.writeFileSync('extracted_objects.json', JSON.stringify(Array.from(extractedStrings), null, 2));
console.log(`Extracted ${extractedStrings.size} object strings.`);
