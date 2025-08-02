/**
 * Utility functions for extracting metadata from TEI documents
 */

/**
 * Extracts document metadata from TEI DOM
 * @param {Document} dom - TEI XML DOM
 * @param {Object} sampleInfo - Optional sample info if loaded from samples
 * @returns {Object} Document metadata
 */
export function extractTeiMetadata(dom, sampleInfo = null) {
  if (!dom) return { title: '', author: '' }

  // If loaded from sample, prefer the sample metadata for title and author
  if (sampleInfo) {
    return {
      title: sampleInfo.title || '',
      author: sampleInfo.author || ''
    }
  }

  // Extract from TEI header
  const title = extractTitle(dom)
  const author = extractAuthor(dom)

  return { title, author }
}

/**
 * Extracts title from TEI document
 * @param {Document} dom - TEI XML DOM
 * @returns {string} Document title
 */
function extractTitle(dom) {
  // Try multiple paths for title
  const titleSelectors = [
    'teiHeader titleStmt title[type="main"]',
    'teiHeader titleStmt title',
    'teiHeader sourceDesc bibl title'
  ]

  for (const selector of titleSelectors) {
    const titleElement = dom.querySelector(selector)
    if (titleElement && titleElement.textContent.trim()) {
      let title = titleElement.textContent.trim()
      // Clean up title by removing publication info if it's too long
      if (title.length > 60) {
        // Remove publication details (everything after " — ")
        const dashIndex = title.indexOf(' — ')
        if (dashIndex > 0) {
          title = title.substring(0, dashIndex)
        }
      }
      return title
    }
  }

  return ''
}

/**
 * Extracts author from TEI document
 * @param {Document} dom - TEI XML DOM
 * @returns {string} Document author
 */
function extractAuthor(dom) {
  // Try multiple paths for author
  const authorSelectors = [
    'teiHeader titleStmt author persName',
    'teiHeader titleStmt author',
    'teiHeader sourceDesc bibl author'
  ]

  for (const selector of authorSelectors) {
    const authorElement = dom.querySelector(selector)
    if (authorElement && authorElement.textContent.trim()) {
      return authorElement.textContent.trim()
    }
  }

  return ''
}

/**
 * Formats title and author for display
 * @param {string} title - Document title
 * @param {string} author - Document author
 * @returns {string} Formatted display string
 */
export function formatDocumentInfo(title, author) {
  if (!title && !author) return ''
  if (!author) return title
  if (!title) return `by ${author}`
  return `${title} by ${author}`
}