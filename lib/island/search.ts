/**
 * The medicine search in a corpus document's header.
 *
 * This is the one piece of state the document hands a script: what the reader has typed, which row
 * is selected, and whether the list is open. Nothing about the record on the page is passed to it —
 * the field is empty in the served HTML and the rows come from `/api/search`, the same route the
 * React header calls, through the same `searchHitHref` rule.
 *
 * The combobox keeps the ARIA contract the React header keeps: `aria-expanded` on the field,
 * `aria-controls` naming the listbox, `aria-activedescendant` naming the selected option, and
 * `role="option"` with `aria-selected` on each row. Arrow keys move the selection, Enter opens it,
 * Escape closes the list, and a click outside closes it.
 */
import { api, searchHitHref, type SearchHit } from '@/lib/api-client'
import { publicMedicineTypeLabel } from '@/lib/public-medicine-language'

const DEBOUNCE_MS = 180
const LIMIT = 10
const LISTBOX_ID = 'rnawiki-search-listbox'

function option(hit: SearchHit, index: number, active: boolean): HTMLAnchorElement {
  const row = document.createElement('a')
  row.id = `${LISTBOX_ID}-option-${index}`
  row.href = searchHitHref(hit)
  row.setAttribute('role', 'option')
  row.setAttribute('aria-selected', active ? 'true' : 'false')
  row.className = `w-full text-left p-3 hover:bg-[#F5F5F7] transition cursor-pointer flex items-center justify-between gap-2${
    active ? ' bg-[#F5F5F7]' : ''
  }`

  const body = document.createElement('div')
  body.className = 'min-w-0'
  const line = document.createElement('div')
  line.className = 'flex items-center gap-1.5 flex-wrap'

  const name = document.createElement('span')
  name.className = 'text-xs font-bold text-[#1D1D1F]'
  name.textContent = hit.name
  line.append(name)

  if (hit.tradeName) {
    const trade = document.createElement('span')
    trade.className = 'text-[10px] text-[#6E6E73]'
    trade.textContent = `(${hit.tradeName})`
    line.append(trade)
  }

  const modality = document.createElement('span')
  modality.className =
    'text-[9px] font-semibold bg-blue-50 text-[#0071E3] px-1.5 py-0.2 rounded-full'
  modality.textContent = publicMedicineTypeLabel(hit.modality)
  line.append(modality)
  body.append(line)

  if (hit.summaryContext) {
    const context = document.createElement('div')
    context.className =
      'mt-0.5 truncate text-[9px] font-semibold uppercase tracking-wide text-[#6E6E73]'
    context.textContent = hit.summaryContext
    body.append(context)
  }

  const indication = document.createElement('div')
  indication.className = 'mt-0.5 truncate text-[10px] text-[#6E6E73]'
  indication.textContent = hit.patientFriendlyIndication
  body.append(indication)

  row.append(body)
  return row
}

/** The field's clear control, which exists only while there is something to clear. */
function clearButton(onClear: () => void): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'text-[#6E6E73] hover:text-[#1D1D1F] p-0.5'
  button.setAttribute('aria-label', 'Clear search')
  button.innerHTML =
    '<svg class="w-3 h-3" aria-hidden="true" fill="none" stroke="currentColor" ' +
    'stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24">' +
    '<path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'
  button.addEventListener('click', onClear)
  return button
}

export function startSearch(): void {
  const input = document.getElementById('rnawiki-search-input')
  const container = document.getElementById('rnawiki-search')
  const shell = document.getElementById('rnawiki-search-shell')
  const toggle = document.getElementById('rnawiki-search-toggle')
  if (!(input instanceof HTMLInputElement) || !container || !shell) return

  let results: SearchHit[] = []
  let activeIndex = -1
  let searching = false
  let listbox: HTMLDivElement | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  let requestId = 0
  let clear: HTMLButtonElement | null = null

  const closeList = (): void => {
    listbox?.remove()
    listbox = null
    activeIndex = -1
    input.setAttribute('aria-expanded', 'false')
    input.removeAttribute('aria-activedescendant')
  }

  const paint = (): void => {
    if (input.value.trim().length === 0) {
      closeList()
      return
    }
    if (!listbox) {
      listbox = document.createElement('div')
      listbox.id = LISTBOX_ID
      listbox.setAttribute('role', 'listbox')
      listbox.setAttribute('aria-label', 'Search results')
      listbox.className =
        'absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-black/[0.08] shadow-xl overflow-hidden divide-y divide-black/[0.04] max-h-72 overflow-y-auto z-50'
      container.append(listbox)
    }
    listbox.replaceChildren()
    input.setAttribute('aria-expanded', 'true')
    if (results.length === 0) {
      const empty = document.createElement('div')
      empty.className = 'p-3 text-xs text-[#6E6E73] text-center'
      empty.textContent = searching ? 'Searching…' : 'No matches found'
      listbox.append(empty)
      input.removeAttribute('aria-activedescendant')
      return
    }
    results.forEach((hit, index) => {
      const row = option(hit, index, index === activeIndex)
      row.addEventListener('mouseenter', () => {
        activeIndex = index
        paint()
      })
      listbox?.append(row)
    })
    if (activeIndex >= 0) {
      input.setAttribute('aria-activedescendant', `${LISTBOX_ID}-option-${activeIndex}`)
      document.getElementById(`${LISTBOX_ID}-option-${activeIndex}`)?.scrollIntoView({
        block: 'nearest',
      })
    } else {
      input.removeAttribute('aria-activedescendant')
    }
  }

  const showClear = (): void => {
    const wanted = input.value.length > 0
    if (wanted && !clear) {
      clear = clearButton(() => {
        input.value = ''
        run()
        input.focus()
      })
      input.parentElement?.append(clear)
    } else if (!wanted && clear) {
      clear.remove()
      clear = null
    }
  }

  const run = (): void => {
    showClear()
    const query = input.value.trim()
    if (timer) clearTimeout(timer)
    if (query.length === 0) {
      results = []
      closeList()
      return
    }
    searching = true
    activeIndex = -1
    paint()
    const id = ++requestId
    timer = setTimeout(() => {
      api
        .search(query, LIMIT)
        .then((data) => {
          if (id !== requestId) return
          results = data.results
          searching = false
          activeIndex = -1
          paint()
        })
        .catch(() => {
          if (id !== requestId) return
          results = []
          searching = false
          paint()
        })
    }, DEBOUNCE_MS)
  }

  input.addEventListener('input', run)
  input.addEventListener('focus', () => {
    if (input.value.trim().length > 0) paint()
  })
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeList()
      return
    }
    if (results.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      activeIndex = (activeIndex + 1) % results.length
      paint()
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      activeIndex = activeIndex <= 0 ? results.length - 1 : activeIndex - 1
      paint()
      return
    }
    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      const hit = results[activeIndex]
      if (hit) window.location.assign(searchHitHref(hit))
    }
  })

  document.addEventListener('pointerdown', (event) => {
    if (event.target instanceof Node && container.contains(event.target)) return
    closeList()
  })

  if (toggle instanceof HTMLButtonElement) {
    toggle.addEventListener('click', () => {
      const open = shell.classList.toggle('hidden')
      const nowOpen = !open
      shell.classList.toggle('absolute', nowOpen)
      shell.classList.toggle('inset-x-0', nowOpen)
      shell.classList.toggle('top-[3.75rem]', nowOpen)
      shell.classList.toggle('rounded-2xl', nowOpen)
      shell.classList.toggle('border', nowOpen)
      shell.classList.toggle('border-black/[0.08]', nowOpen)
      shell.classList.toggle('bg-white', nowOpen)
      shell.classList.toggle('p-2', nowOpen)
      shell.classList.toggle('shadow-xl', nowOpen)
      toggle.setAttribute('aria-expanded', nowOpen ? 'true' : 'false')
      toggle.setAttribute('aria-label', nowOpen ? 'Close medicine search' : 'Search medicines')
      if (nowOpen) input.focus()
    })
  }
}
