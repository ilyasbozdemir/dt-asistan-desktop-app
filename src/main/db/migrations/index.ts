import Database from 'better-sqlite3'
import { migration as alpha1_step1 } from './v1.0.0-alpha.1-step1'
import { migration as alpha1_step2 } from './v1.0.0-alpha.1-step2'
import { migration as alpha1_step3 } from './v1.0.0-alpha.1-step3'
import { migration as alpha1_to_alpha2 } from './v1.0.0-alpha.1_to_alpha.2'
import { migration as alpha2_to_alpha3 } from './v1.0.0-alpha.2_to_alpha.3'

export interface Migration {
  from: number
  to: number
  up: (db: Database.Database) => void
  description: string
}

/**
 * Migration registry containing all registered steps.
 * Automatically sorted sequentially by starting version.
 */
export const migrations: Migration[] = [
  alpha1_step1,
  alpha1_step2,
  alpha1_step3,
  alpha1_to_alpha2,
  alpha2_to_alpha3
].sort((a, b) => a.from - b.from)
