import discardComments from 'postcss-discard-comments';
import discardEmpty from 'postcss-discard-empty';
import fs from 'fs/promises';
import path from 'path';
import postcss from 'postcss';
import tailwind from 'tailwindcss';
import tailwindConfig from '../tailwind.config.cjs';
import ts from 'ttypescript';
import url from 'url';

const TSCONFIG_PATH = url.fileURLToPath(new URL('../tsconfig.json', import.meta.url));
const DEFINED_ENTRY = url.fileURLToPath(new URL('../src/index.defined.ts', import.meta.url));
const MAIN_ENTRY = url.fileURLToPath(new URL('../src/index.ts', import.meta.url));
const SRC_DIR = url.fileURLToPath(new URL('../src', import.meta.url));

const cssProcessor = postcss([tailwind(tailwindConfig), discardComments(), discardEmpty()]);
const cssSnippets = [];

for await (const file of getMatchingFiles(SRC_DIR, /\.ts$/)) {
  for (const css of await extractCSS(file)) {
    const { content: text } = await cssProcessor.process(css, { from: file });
    cssSnippets.push({ file, text });
  }
}

const sharedProgramOptions = await getCompilerOptions(TSCONFIG_PATH);
const programOptions = { ...sharedProgramOptions, declaration: true, declarationDir: 'dist' };
const result = ts
  .createProgram({ rootNames: [DEFINED_ENTRY, MAIN_ENTRY], options: programOptions })
  .emit(undefined, ts.sys.writeFile, undefined, undefined, { before: [injectCSS(cssSnippets)] });

if (result.emitSkipped) {
  console.error(ts.formatDiagnostics(result.diagnostics, ts.createCompilerHost(programOptions)));
  process.exit(1);
}

// #region helpers

async function getCompilerOptions(tsconfigPath) {
  const tsconfigText = await fs.readFile(tsconfigPath, { encoding: 'utf-8' });
  const tsconfigJSON = JSON.parse(tsconfigText).compilerOptions;
  return ts.convertCompilerOptionsFromJson(tsconfigJSON, './').options;
}

async function extractCSS(file) {
  const code = await fs.readFile(file, { encoding: 'utf-8' });
  const css = [];

  (function walk(node) {
    if (node.tag?.escapedText !== 'css') return node.forEachChild(walk);
    css.push(node.template.text);
  })(ts.createSourceFile(file, code, ts.ScriptTarget.Latest));

  return css;
}

function injectCSS(cssSnippets) {
  return context => {
    function visitNode(node) {
      if (node.tag?.escapedText === 'css') {
        const sourceFileName = node.getSourceFile().fileName;
        const cssSnippet = cssSnippets.find(({ file }) => file === sourceFileName);

        return context.factory.updateTaggedTemplateExpression(
          node,
          node.tag,
          node.typeArguments,
          context.factory.createNoSubstitutionTemplateLiteral(cssSnippet.text)
        );
      } else {
        return ts.visitEachChild(node, visitNode, context);
      }
    }

    return source => ts.visitNode(source, visitNode);
  };
}

async function* getMatchingFiles(dir, regex) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });

  for (const dirent of dirents) {
    const direntPath = path.resolve(dir, dirent.name);

    if (dirent.isDirectory()) {
      yield* getMatchingFiles(direntPath, regex);
    } else if (regex.test(dirent.name)) {
      yield direntPath;
    }
  }
}

// #endregion helpers
