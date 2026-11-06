import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const jsRoot = join(projectRoot, 'resources', 'js');
const pagesRoot = join(jsRoot, 'pages');
const sharedRoot = join(jsRoot, 'shared');

const supportDirectories = new Set(['components', 'hooks', 'types', 'lib']);

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

function pageInfo(target) {
    const relativePath = toPosix(relative(pagesRoot, target));

    if (relativePath.startsWith('..')) {
        return null;
    }

    const parts = relativePath.split('/').filter(Boolean);
    const isDirectory = existsSync(target) && statSync(target).isDirectory();
    const directories = isDirectory ? parts : parts.slice(0, -1);
    const domain = directories[0] ?? null;
    const domainShared =
        directories.length > 1 && supportDirectories.has(directories[1]);
    const resource =
        !domainShared && directories.length > 1 ? directories[1] : null;
    const resourceShared =
        resource !== null &&
        directories.length > 2 &&
        supportDirectories.has(directories[2]);
    const route =
        resource !== null && !resourceShared && directories.length > 2
            ? directories[2]
            : null;
    const routeShared =
        route !== null &&
        directories.length > 3 &&
        supportDirectories.has(directories[3]);

    return {
        domain,
        resource,
        route,
        domainShared,
        resourceShared,
        routeShared,
        isPage: !domainShared && !resourceShared && !routeShared,
    };
}

function routeKey(info) {
    return info.route ? `${info.domain}/${info.resource}/${info.route}` : null;
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
                const sourceInfo = pageInfo(file);
                const targetInfo = pageInfo(target);

                if (!sourceInfo || !targetInfo) {
                    continue;
                }

                const fromDomain = sourceInfo.domain;
                const targetDomain = targetInfo.domain;
                const fromRoute = routeKey(sourceInfo);
                const targetRoute = routeKey(targetInfo);

                if (fromDomain && targetDomain && fromDomain !== targetDomain) {
                    errors.push(
                        `${relFile}: pages/${fromDomain} tidak boleh import pages/${targetDomain} ("${specifier}")`,
                    );
                } else if (!fromDomain && targetDomain) {
                    errors.push(
                        `${relFile}: file page level-atas tidak boleh import pages/${targetDomain} ("${specifier}")`,
                    );
                } else if (
                    fromRoute &&
                    targetRoute &&
                    fromRoute !== targetRoute
                ) {
                    errors.push(
                        `${relFile}: route ${fromRoute} tidak boleh import route ${targetRoute} ("${specifier}")`,
                    );
                } else if (sourceInfo.resourceShared && targetRoute) {
                    errors.push(
                        `${relFile}: kode bersama resource tidak boleh import route ${targetRoute} ("${specifier}")`,
                    );
                } else if (
                    sourceInfo.domainShared &&
                    (targetInfo.resource || targetRoute)
                ) {
                    errors.push(
                        `${relFile}: kode bersama domain tidak boleh import resource/route ("${specifier}")`,
                    );
                } else if (
                    sourceInfo.isPage &&
                    !sourceInfo.route &&
                    targetRoute
                ) {
                    errors.push(
                        `${relFile}: halaman tidak boleh import route ${targetRoute} ("${specifier}")`,
                    );
                } else if (
                    sourceInfo.isPage &&
                    targetInfo.isPage &&
                    fromDomain === targetDomain
                ) {
                    errors.push(
                        `${relFile}: halaman tidak boleh import halaman lain ("${specifier}")`,
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
