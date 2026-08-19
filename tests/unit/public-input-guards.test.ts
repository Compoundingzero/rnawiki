import { describe, expect, it } from 'vitest'
import { MAX_POSTGRES_INT, parsePublicId, sanitisePublicText } from '@/lib/public-ids'
import { serializeJsonLd } from '@/lib/json-ld'
import { isRegulatorSourceUrl, regulatorySourceLinkLabel } from '@/lib/regulator-sources'
import { makeSessionHash, currentDaySalt } from '@/lib/session-hash'

/**
 * Guards on the untrusted text that reaches a database query, a script element, or a published
 * link label. Each block below pins a defect that was live in shipped code, not a hypothetical.
 */

describe('parsePublicId', () => {
  it('accepts a canonical decimal id', () => {
    expect(parsePublicId('1')).toBe(1)
    expect(parsePublicId('1016')).toBe(1016)
    expect(parsePublicId(String(MAX_POSTGRES_INT))).toBe(MAX_POSTGRES_INT)
  })

  /**
   * REGRESSION. `Number.isInteger(2147483648)` is true, so the old guard passed the value to a
   * query against an int4 column and the driver raised "value ... is out of range for type
   * integer" - a 500 on a route whose own comment promises "malformed id is just another way to
   * not find a claim - same uniform 404".
   */
  it('rejects an id above the Postgres integer range instead of letting the driver raise', () => {
    expect(parsePublicId('2147483648')).toBeNull()
    expect(parsePublicId('99999999999')).toBeNull()
    expect(parsePublicId('99999999999999999999')).toBeNull()
  })

  /**
   * REGRESSION. `Number()` accepts hex, exponent, decimal-point, signed and whitespace-padded
   * spellings, so one claim was served at /api/v1/claims/0x3F8, /1.016e3, /1016.0, /+1016 and
   * /%201016%20 as well as at its own id - five extra URLs for one record, each cacheable.
   */
  it('rejects every non-canonical spelling of a number', () => {
    for (const raw of ['0x3F8', '1.016e3', '1016.0', '+1016', ' 1016 ', '1e3', '01016']) {
      expect(parsePublicId(raw), raw).toBeNull()
    }
  })

  it('rejects zero, negatives and non-numeric text', () => {
    for (const raw of ['0', '-5', 'abc', '', 'Infinity', 'NaN', 'null']) {
      expect(parsePublicId(raw), raw).toBeNull()
    }
  })
})

describe('sanitisePublicText', () => {
  /**
   * REGRESSION. Postgres refuses to bind a NUL in a text parameter (SQLSTATE 22021), so a single
   * %00 in a query string or a slug returned 500 from /search, /api/v1/search and
   * /api/v1/entities/[slug]. A control character in user input is a no-match, never a server error.
   */
  it('strips NUL and the other C0 control characters', () => {
    expect(sanitisePublicText('\u0000')).toBe('')
    expect(sanitisePublicText('a\u0000b')).toBe('ab')
    expect(sanitisePublicText('bpc\u0000-157')).toBe('bpc-157')
    expect(sanitisePublicText('a\u0001\u001Fb')).toBe('ab')
  })

  it('turns tab, newline and carriage return into a space so a pasted phrase still searches', () => {
    expect(sanitisePublicText('tendon\nhealing')).toBe('tendon healing')
    expect(sanitisePublicText('tendon\thealing')).toBe('tendon healing')
    expect(sanitisePublicText('tendon\r\nhealing')).toBe('tendon  healing')
  })

  it('leaves ordinary text, punctuation and non-ASCII alone', () => {
    expect(sanitisePublicText('BPC-157 (exa-cel) 96.7%')).toBe('BPC-157 (exa-cel) 96.7%')
    expect(sanitisePublicText('beta-thalassemia')).toBe('beta-thalassemia')
  })
})

describe('serializeJsonLd', () => {
  /**
   * REGRESSION. JSON.stringify leaves `<` and `/` literal, so a closing script tag inside
   * entity.canonicalName or entity.aliases ended the record page's ld+json block and everything
   * after it was parsed as markup - stored XSS on every public record page, writable by an editor.
   */
  it('escapes a closing script tag so it cannot end the script element', () => {
    const out = serializeJsonLd({ name: 'BPC-157</script><script>alert(1)</script>' })
    expect(out).not.toContain('</script>')
    expect(out).not.toContain('<script>')
    expect(out).toContain('\\u003c')
  })

  it('escapes < > and & wherever they appear, including inside nested arrays', () => {
    const out = serializeJsonLd({ about: { alternateName: ['a<b', 'c>d', 'e&f'] } })
    expect(out).not.toMatch(/[<>&]/)
  })

  /** The escapes are legal JSON string escapes, so the output still parses as the same object. */
  it('still round-trips to the original object', () => {
    const value = { name: 'x</script>y', aliases: ['a&b', 'c<d'] }
    expect(JSON.parse(serializeJsonLd(value))).toEqual(value)
  })
})

describe('regulatory source link label', () => {
  /**
   * REGRESSION. Every jurisdiction block printed "Read the regulator's own record" whatever the
   * stored URL was, so two of Casgevy's three approval links handed the reader Vertex's own press
   * releases under a sentence promising the regulator.
   */
  it('recognises regulator and government hosts, including subdomains', () => {
    for (const url of [
      'https://www.fda.gov/news-events/press-announcements/x',
      'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=abc',
      'https://www.ema.europa.eu/en/medicines/human/EPAR/x',
      'https://www.gov.uk/x',
      'https://www.hsa.gov.sg/x',
    ]) {
      expect(isRegulatorSourceUrl(url), url).toBe(true)
    }
  })

  it('does not treat a sponsor newsroom, trade press or a manufacturer site as the regulator', () => {
    for (const url of [
      'https://news.vrtx.com/news-releases/news-release-details/x',
      'https://www.raps.org/resource/x.html',
      'https://www.casgevy.com/sickle-cell-disease/treatment-journey',
      'https://www.cnbc.com/2023/12/08/x.html',
      'https://www.biopharmadive.com/news/x/812243/',
    ]) {
      expect(isRegulatorSourceUrl(url), url).toBe(false)
      expect(regulatorySourceLinkLabel(url)).toBe('Read the source for this status')
    }
  })

  /** Substring matching would let `https://evil.example/?u=fda.gov` claim to be the regulator. */
  it('matches on the parsed host, never on a substring of the URL', () => {
    expect(isRegulatorSourceUrl('https://evil.example/?u=fda.gov')).toBe(false)
    expect(isRegulatorSourceUrl('https://fda.gov.evil.example/x')).toBe(false)
    expect(isRegulatorSourceUrl('not a url at all')).toBe(false)
    expect(isRegulatorSourceUrl('javascript:alert(1)//fda.gov')).toBe(false)
  })

  it('prints the regulator wording only for a regulator host', () => {
    expect(regulatorySourceLinkLabel('https://www.fda.gov/x')).toBe('Read the regulator’s own record')
  })
})

describe('makeSessionHash', () => {
  /**
   * REGRESSION. The hash used to mix in `userAgent.slice(0, 40)`, a value the caller writes. Every
   * input except the IP was therefore attacker-chosen, so a new User-Agent was a new anonymous
   * identity with a fresh daily budget - which defeated the corrections cap and the comprehension
   * dedupe, and turned the teach-back answer key into an oracle.
   */
  it('depends only on the IP and the day salt, so no request header can steer it', () => {
    const salt = currentDaySalt('a-secret-at-least-32-characters-long!!')
    expect(makeSessionHash('203.0.113.9', salt)).toBe(makeSessionHash('203.0.113.9', salt))
    expect(makeSessionHash('203.0.113.9', salt)).not.toBe(makeSessionHash('198.51.100.9', salt))
    // Two arguments, not three: a caller cannot pass a header in even by accident.
    expect(makeSessionHash.length).toBe(2)
  })
})
