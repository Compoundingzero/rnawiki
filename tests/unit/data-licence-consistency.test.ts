import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * The core dataset licence must say one thing in every place it is written down.
 *
 * WHAT WENT WRONG. `LICENSE-DATA` has always carried the Creative Commons Attribution 4.0
 * International Public License and has never contained the word ShareAlike. Meanwhile the top-level
 * `README.md` declared the copyleft variant twice, `data/README.md` declared it once and restated
 * its obligation in prose, `scripts/export/dataset.ts` stamped it into every manifest it wrote, and
 * the checked-in `data/manifest.json` carried that stamp. Four declarations against the file that
 * actually grants the licence.
 *
 * WHY THAT IS WORSE THAN UNTIDY. `docs/recorded-background-data.md` records that this project
 * refuses to ingest ChEBI precisely because ChEBI ships a permissive licence file beside a README
 * claiming a stricter one, and will not do so until EBI says which governs. RNAWiki shipped the same
 * ambiguity in the same direction, so a downstream user applying RNAWiki's own published standard to
 * RNAWiki would have declined to use this dataset. A licence a reader cannot resolve is a licence
 * they cannot rely on.
 *
 * WHY THESE TESTS READ REAL FILES. A fixture would only prove that a copy of the text is consistent
 * with itself. The thing being protected is the bytes a reader or a licence scanner actually meets
 * on disk, so every assertion below opens the real file. Failures name the file, the line number and
 * the offending line, so the next person can fix it in one step without re-deriving the search.
 *
 * Scope note: this covers the DATA licence only. Code is AGPL-3.0 in `LICENSE` and is untouched by
 * anything here.
 */

const REPO_ROOT = process.cwd()

/**
 * The files that declare the core dataset's licence to a human reader or to a machine. Each is a
 * place someone goes to answer "what may I do with this data?", so each must give the same answer.
 * `docs/data-licensing-policy.md` is deliberately NOT in this list: it is where the history and the
 * third-party comparisons are allowed to be discussed by name.
 */
const CORE_DECLARATION_FILES = ['README.md', 'data/README.md', 'scripts/export/dataset.ts'] as const

/** The file that carries the actual granted licence text. */
const LICENCE_TEXT_FILE = 'LICENSE-DATA'

/** Generated output. Read for reporting, never asserted against, never hand-edited. See below. */
const GENERATED_MANIFEST = 'data/manifest.json'

/**
 * Any spelling of the copyleft licence identifier or its name.
 *
 * `[\s_-]?` rather than `[\s_-]*` on purpose: zero-or-more would let the match run across a line
 * break and invent a hit that no reader would ever see.
 */
const COPYLEFT_IDENTIFIER = /CC[\s_-]?BY[\s_-]?SA|Share[\s_-]?Alike/gi

/** The shorthand a declaration uses. Matches `CC BY 4.0`, `CC-BY-4.0`, `CC BY-4.0`. */
const CC_BY_DECLARATION = /CC[\s_-]?BY[\s_-]?4\.0/

/** The heading Creative Commons puts on the licence this dataset is actually granted under. */
const CC_BY_LEGAL_TEXT = 'Creative Commons Attribution 4.0 International Public License'

/**
 * The ShareAlike obligation stated as prose rather than as an identifier.
 *
 * This is not hypothetical tidying. Before this change `data/README.md` read "Credit RNAWiki and
 * share derivatives under the same terms" — a copyleft obligation asserted in a sentence that
 * contains no licence identifier at all, so an identifier search alone would have walked straight
 * past it.
 */
const OBLIGATION_PHRASE = /under the same (?:terms|licence|license)/gi

/**
 * Words that turn an obligation phrase into a denial of one. "There is no obligation to license a
 * derivative under the same terms" is the correct sentence to write under CC BY, and must not fail.
 */
const NEGATION = /\b(?:no|not|never|without)\b/i

function read(relativePath: string): string {
  return readFileSync(join(REPO_ROOT, relativePath), 'utf8')
}

/** Turn a character offset into the line number and trimmed line text a person can navigate to. */
function locate(text: string, index: number): { line: number; source: string } {
  const line = text.slice(0, index).split('\n').length
  return { line, source: (text.split('\n')[line - 1] ?? '').trim() }
}

/** Every match of `pattern`, reported as `path:line — line text`. */
function findAll(relativePath: string, text: string, pattern: RegExp): string[] {
  // Fresh RegExp per call: a module-level /g literal carries lastIndex between uses, which would
  // make one test's result depend on whether another ran first.
  const scan = new RegExp(pattern.source, pattern.flags)
  const hits: string[] = []
  let match: RegExpExecArray | null
  while ((match = scan.exec(text)) !== null) {
    const { line, source } = locate(text, match.index)
    hits.push(`${relativePath}:${line} — ${source}`)
    if (match.index === scan.lastIndex) scan.lastIndex += 1
  }
  return hits
}

/**
 * Split into sentences so an obligation phrase is judged with the words around it. Line-based
 * checking would be wrong here: these READMEs are hard-wrapped, so a negation routinely sits on the
 * line above the phrase it negates.
 */
function sentencesContaining(text: string, pattern: RegExp): string[] {
  const scan = new RegExp(pattern.source, pattern.flags)
  const flat = text.replace(/\s+/gu, ' ')
  const sentences = flat.split(/(?<=[.!?])\s+/u)
  return sentences.filter((sentence) => {
    scan.lastIndex = 0
    return scan.test(sentence)
  })
}

describe('LICENSE-DATA is the licence it claims to be', () => {
  it('carries the Creative Commons Attribution 4.0 International text', () => {
    const text = read(LICENCE_TEXT_FILE)
    expect(
      text.includes(CC_BY_LEGAL_TEXT),
      `${LICENCE_TEXT_FILE} does not contain "${CC_BY_LEGAL_TEXT}". Every other declaration in this repository points at this file for the terms, so if the text here has changed, the declarations are now wrong rather than this test being wrong.`,
    ).toBe(true)
  })

  it('contains no copyleft licence identifier anywhere', () => {
    const text = read(LICENCE_TEXT_FILE)
    const hits = findAll(LICENCE_TEXT_FILE, text, COPYLEFT_IDENTIFIER)
    expect(
      hits,
      `${LICENCE_TEXT_FILE} mentions a copyleft licence. Attribution 4.0 never does, so a hit here means a different licence file was dropped in. Offending lines:\n${hits.join('\n')}`,
    ).toEqual([])
  })
})

describe('core dataset declarations agree with LICENSE-DATA', () => {
  for (const relativePath of CORE_DECLARATION_FILES) {
    it(`${relativePath} declares CC BY 4.0`, () => {
      const text = read(relativePath)
      expect(
        CC_BY_DECLARATION.test(text),
        `${relativePath} no longer states "CC BY 4.0" anywhere. A file that a reader consults for the dataset licence has to state it; pointing at LICENSE-DATA without naming the licence leaves them to read 18 KB of legal text to find out.`,
      ).toBe(true)
    })

    it(`${relativePath} names no copyleft licence`, () => {
      const text = read(relativePath)
      const hits = findAll(relativePath, text, COPYLEFT_IDENTIFIER)
      expect(
        hits,
        `${relativePath} names a copyleft licence, but LICENSE-DATA grants CC BY 4.0.\n\n${hits.join('\n')}\n\nIf this is a real licence change, change LICENSE-DATA and every file in this test together. If it is a mention rather than a declaration — history, or a comparison with a third-party dataset — it belongs in docs/data-licensing-policy.md, not here: scripts/audit/denial-corpus/measure.ts pattern-matches these files for a licence identifier and cannot tell the two apart.`,
      ).toEqual([])
    })

    it(`${relativePath} imposes no ShareAlike obligation in prose`, () => {
      const text = read(relativePath)
      const asserted = sentencesContaining(text, OBLIGATION_PHRASE).filter(
        (sentence) => !NEGATION.test(sentence),
      )
      expect(
        asserted,
        `${relativePath} tells a reader to release derivatives under the same terms. CC BY 4.0 imposes no such obligation, and this phrasing carries it without ever naming a licence, so the identifier checks above cannot catch it. Offending sentence(s):\n${asserted.join('\n')}`,
      ).toEqual([])
    })
  }

  it('the exporter stamps the same licence the READMEs declare', () => {
    // The exporter is the only one of the three that writes a licence into a published artefact, so
    // a drift here is not a documentation bug: it ships in every future manifest.
    const exporter = read('scripts/export/dataset.ts')
    const constant = /const CORE_DATASET_LICENCE = '([^']+)'/u.exec(exporter)
    expect(
      constant,
      'scripts/export/dataset.ts no longer defines CORE_DATASET_LICENCE. The manifest licence field must come from one named constant so there is a single place to change it; inlining the string is how the previous drift went unnoticed.',
    ).not.toBeNull()
    expect(
      CC_BY_DECLARATION.test(constant?.[1] ?? ''),
      `CORE_DATASET_LICENCE is "${constant?.[1] ?? ''}", which does not state CC BY 4.0. Every manifest written from now on would carry that value.`,
    ).toBe(true)
  })
})

describe('the generated manifest', () => {
  /**
   * This test reports; it does not fail on a stale value, and it must not.
   *
   * `data/manifest.json` is generated. `data/README.md` states that every file in `data/` is
   * overwritten wholesale on each export and that a change committed there disappears at the next
   * run, so hand-editing the licence field is not a fix — it is a value that would be silently
   * reverted while looking correct in review. The real fix is CORE_DATASET_LICENCE in the exporter,
   * which the test above asserts. The checked-in manifest catches up on the next successful export.
   *
   * At the time of writing the checked-in manifest is stale: it was generated before the constant
   * was corrected, so it still carries the old copyleft declaration. That is expected and is why
   * this reports rather than throws.
   */
  it('is reported as stale when it disagrees with the exporter, and is never hand-edited', () => {
    const exporter = read('scripts/export/dataset.ts')
    const expected = /const CORE_DATASET_LICENCE = '([^']+)'/u.exec(exporter)?.[1] ?? ''
    const manifestText = read(GENERATED_MANIFEST)
    const actual = (JSON.parse(manifestText) as { licence?: string }).licence ?? ''

    if (actual !== expected) {
      const hits = findAll(GENERATED_MANIFEST, manifestText, /"licence"\s*:/gu)
      console.warn(
        `[licence] ${GENERATED_MANIFEST} is stale.\n` +
          `  ${hits.join('\n  ')}\n` +
          `  declares: ${actual}\n` +
          `  exporter: ${expected}\n` +
          '  Regenerate it with the dataset export against the authoritative database. Do not hand-edit it: data/ is overwritten wholesale on every export.',
      )
    }

    // What is actually asserted is that the generated field is one the exporter could have written,
    // now or before this correction. Anything else means the manifest was edited by hand, which is
    // the failure mode this file exists to make visible.
    // A fresh RegExp because COPYLEFT_IDENTIFIER is /g: calling .test() on a global literal advances
    // its lastIndex, so a second call against a similar string can return false for no visible
    // reason. That bug is a coin-flip to debug, so it does not get to exist here.
    const declaresCopyleft = new RegExp(COPYLEFT_IDENTIFIER.source, 'iu').test(actual)
    expect(
      actual === expected || declaresCopyleft,
      `${GENERATED_MANIFEST} declares "${actual}", which is neither the exporter's current CORE_DATASET_LICENCE ("${expected}") nor the superseded declaration it is expected to carry until the next export. A third value means this generated file was edited by hand.`,
    ).toBe(true)
  })
})
