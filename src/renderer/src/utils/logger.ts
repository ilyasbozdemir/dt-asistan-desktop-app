export type LogType = 'info' | 'success' | 'warning' | 'error'

/**
 * Log a system activity to the database (LOG_SystemLog table).
 * This log will also appear in the Dashboard's Announcements section.
 *
 * @param title Short summary of the event (e.g. "Dosya Eklendi")
 * @param message Detailed message describing the event
 * @param type Severity of the log ('info', 'success', 'warning', 'error')
 */
export async function logActivity(
  title: string,
  message: string,
  type: LogType = 'info'
): Promise<void> {
  try {
    const q = 'INSERT INTO LOG_SystemLog (title, message, type) VALUES (?, ?, ?)'
    await window.electron.ipcRenderer.invoke('db:query', q, [title, message, type])
  } catch (error) {
    console.error('Failed to write system log:', error)
  }
}
