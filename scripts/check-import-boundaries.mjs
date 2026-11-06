import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const jsRoot = join(projectRoot, 'resources', 'js');
const pagesRoot = join(jsRoot, 'pages');
const sharedRoot = join(jsRoot, 'shared');

const importPatterns = [
    /\bfrom\s+['"]([^'"]+)['"]/g,
    /\bimport\s+['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
];

const errors = [];
const files = [];

function toPosix(path) {
    return path.split(sep).join('/');
}

function walk(directory) {
    for (const entry of readdirSync(directory)) {
        const fullPath = join(directory, entry);

        if (statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (/\.(ts|tsx)$/.test(entry)) {
            files.push(fullPath);
        }
    }
}

function resolveSpecifier(specifier, fromFile) {
    if (specifier.startsWith('@/')) {
        return join(jsRoot, specifier.slice(2));
    }

    if (specifier.startsWith('.')) {
        return resolve(dirname(fromFile), specifier);
    }

    return null;
}

function isInside(target, root) {
    return !relative(root, target).startsWith('..');
}

function pagesDomain(target) {
    const relativePath = toPosix(relative(pagesRoot, target));

    if (relativePath.startsWith('..')) {
        return null;
    }

    const parts = relativePath.split('/');

    return parts.length > 1 ? parts[0] : null;
}

walk(jsRoot);

for (const file of files) {
    const relFile = toPosix(relative(jsRoot, file));
    const inShared = isInside(file, sharedRoot);
    const inPages = isInside(file, pagesRoot);
    const source = readFileSync(file, 'utf8');

    for (const pattern of importPatterns) {
        pattern.lastIndex = 0;

        let match;

        while ((match = pattern.exec(source)) !== null) {
            const specifier = match[1];

            if (
                specifier.startsWith('@/features/') ||
                specifier.includes('/features/')
            ) {
                errors.push(
                    `${relFile}: import "${specifier}" ke folder features/ yang sudah dihapus`,
                );

                continue;
            }

            const target = resolveSpecifier(specifier, file);

            if (!target) {
                continue;
            }

            const targetInPages = isInside(target, pagesRoot);

            if (inShared && targetInPages) {
                errors.push(
                    `${relFile}: shared/ tidak boleh import pages/ ("${specifier}")`,
                );

                continue;
            }

            if (inPages && targetInPages) {
                const fromDomain = pagesDomain(file);
                const targetDomain = pagesDomain(target);

                if (fromDomain && targetDomain && fromDomain !== targetDomain) {
                    errors.push(
                        `${relFile}: pages/${fromDomain} tidak boleh import pages/${targetDomain} ("${specifier}")`,
                    );
                } else if (!fromDomain && targetDomain) {
                    errors.push(
                        `${relFile}: file page level-atas tidak boleh import pages/${targetDomain} ("${specifier}")`,
                    );
                }
            }
        }
    }
}

if (errors.length > 0) {
    console.error('Import boundary violations:');

    for (const error of errors) {
        console.error(`  - ${error}`);
    }

    process.exit(1);
}

console.log('Import boundaries OK.');
