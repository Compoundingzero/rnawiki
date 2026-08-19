import 'dotenv/config'
import { searchDrugs } from '@/lib/queries/drugs'

async function main() {
  for (const q of ['metf', 'ozempic', 'leqvio', 'blood pressure', 'paracetamol', 'vitamin d', 'keytruda', 'ashwagandha', 'statin', 'diabetes', 'creatine']) {
    const r = await searchDrugs(q, 4)
    console.log(q.padEnd(16), '->', r.length ? r.map((h) => h.name).join(', ') : '(NOTHING)')
  }
  process.exit(0)
}
main()
