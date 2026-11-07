import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const jsRoot = join(projectRoot, 'resources', 'js');

// Regex for static Tailwind color classes: e.g. bg-lime-50, text-emerald-800, border-amber-300
const hardcodedColorPattern =
    /\b(bg|text|border|ring|stroke|fill|divide|outline)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00)\b/g;

const files = [];

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

walk(jsRoot);

const errors = [];

for (const file of files) {
    const content = readFileSync(file, 'utf8');
    const lines = content.split('\n');

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const trimmed = line.trim();

        // Skip comment lines
        if (
            trimmed.startsWith('//') ||
            trimmed.startsWith('/*') ||
            trimmed.startsWith('*')
        ) {
            continue;
        }

        const matches = line.match(hardcodedColorPattern);
        if (matches) {
            const relPath = relative(projectRoot, file).split(sep).join('/');
            errors.push(
                `${relPath}:${index + 1}: Dilarang hardcode warna Tailwind '${matches.join(', ')}'. Gunakan variabel semantik shadcn/app.css (contoh: bg-primary, text-secondary-foreground, border-border, bg-muted, border-destructive/20, dsb.)`,
            );
        }
    }
}

if (errors.length > 0) {
    console.error(
        `\n❌ Ditemukan ${errors.length} pelanggaran aturan larangan hardcode warna:`,
    );
    for (const error of errors) {
        console.error(`   - ${error}`);
    }
    console.error(
        '\nSesuai aturan AGENTS.md dan docs/conventions.md: Selalu gunakan variabel semantik shadcn/app.css.\n',
    );
    process.exit(1);
}

console.log('No hardcoded colors in resources/js OK.');
