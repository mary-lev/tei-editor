// TEI Operations - Core XML manipulation functions

export class TEIOperations {
  constructor(teiDocument) {
    this.document = teiDocument
    this.dom = teiDocument.dom
  }

  // Helper: Find the TEI element that contains the given DOM node
  findTEIElement(domNode, tagName) {
    let current = domNode
    while (current && current !== this.dom) {
      if (current.nodeType === Node.ELEMENT_NODE && current.tagName?.toLowerCase() === tagName) {
        return current
      }
      current = current.parentNode
    }
    return null
  }

  // Helper: Find all stanzas that intersect with the selection
  findSelectedStanzas(selection) {
    const stanzas = new Set()
    
    // Find stanzas that contain the start and end of selection
    const startStanza = this.findTEIElement(selection.startContainer, 'lg')
    const endStanza = this.findTEIElement(selection.endContainer, 'lg')
    
    if (startStanza) stanzas.add(startStanza)
    if (endStanza) stanzas.add(endStanza)
    
    // Find any stanzas between start and end
    if (startStanza && endStanza && startStanza !== endStanza) {
      let current = startStanza.nextElementSibling
      while (current && current !== endStanza) {
        if (current.tagName?.toLowerCase() === 'lg' && current.getAttribute('type') === 'stanza') {
          stanzas.add(current)
        }
        current = current.nextElementSibling
      }
    }
    
    return Array.from(stanzas).filter(s => s.getAttribute('type') === 'stanza')
  }

  // Helper: Find the line element that contains the selection
  findSelectedLine(selection) {
    console.log('🔍 Finding selected line, selection:', selection)
    console.log('🔍 Start container:', selection.startContainer)
    console.log('🔍 Start container parent:', selection.startContainer?.parentElement)
    
    // First try the original method
    let line = this.findTEIElement(selection.startContainer, 'l')
    console.log('🔍 Found line via findTEIElement:', !!line)
    
    if (!line) {
      // Alternative approach: find by line content matching
      const selectedText = selection.text?.trim()
      console.log('🔍 Selected text:', selectedText)
      
      if (selectedText) {
        // Find all lines in TEI DOM and match by content
        const allLines = this.dom.querySelectorAll('l')
        line = Array.from(allLines).find(l => {
          const lineText = l.textContent?.trim()
          return lineText && (
            lineText.includes(selectedText) || 
            selectedText.includes(lineText.substring(0, 20))
          )
        })
        console.log('🔍 Found line via content matching:', !!line, line?.textContent?.substring(0, 30))
      }
    }
    
    return line
  }

  // Helper: Find any line-like element (l, head, dedication, epigraph) that contains the selection
  findSelectedLineElement(selection) {
    console.log('🔍 Finding selected line-like element, selection:', selection)
    
    // Try to find different types of line-like elements
    const elementTypes = ['l', 'head', 'dedication', 'epigraph']
    let element = null
    
    for (const tagName of elementTypes) {
      element = this.findTEIElement(selection.startContainer, tagName)
      if (element) {
        console.log(`🎯 Found ${tagName} element via findTEIElement`)
        break
      }
    }
    
    if (!element) {
      // Alternative approach: find by content matching
      const selectedText = selection.text?.trim()
      console.log('🔍 Selected text for matching:', selectedText)
      
      if (selectedText) {
        // Find all line-like elements in TEI DOM and match by content
        const allElements = this.dom.querySelectorAll('l, head, dedication, epigraph')
        element = Array.from(allElements).find(el => {
          const elementText = el.textContent?.trim()
          return elementText && (
            elementText.includes(selectedText) || 
            selectedText.includes(elementText.substring(0, 20))
          )
        })
        console.log('🔍 Found element via content matching:', !!element, element?.tagName, element?.textContent?.substring(0, 30))
      }
    }
    
    return element
  }

  // Helper: Renumber lines within a stanza
  renumberStanzaLines(stanza) {
    const lines = stanza.querySelectorAll('l')
    lines.forEach((line, index) => {
      // Only update the line number (n attribute), leave xml:id unchanged
      line.setAttribute('n', (index + 1).toString())
    })
  }

  // Helper: Renumber all stanzas within a poem
  renumberStanzasInPoem(stanza) {
    // Find the poem container (div with type="poem")
    let poemContainer = stanza.parentElement
    while (poemContainer && !(poemContainer.tagName?.toLowerCase() === 'div' && poemContainer.getAttribute('type') === 'poem')) {
      poemContainer = poemContainer.parentElement
    }
    
    if (!poemContainer) {
      console.log('⚠️ Could not find poem container for stanza renumbering')
      return
    }
    
    // Find all stanzas in this poem
    const stanzas = poemContainer.querySelectorAll('lg[type="stanza"]')
    console.log(`🔢 Renumbering ${stanzas.length} stanzas in poem ${poemContainer.getAttribute('xml:id')}`)
    
    stanzas.forEach((stanza, index) => {
      const newNumber = (index + 1).toString()
      const oldNumber = stanza.getAttribute('n')
      
      // Update stanza number
      stanza.setAttribute('n', newNumber)
      
      // Update stanza xml:id if it follows the pattern
      const currentId = stanza.getAttribute('xml:id')
      if (currentId && currentId.includes('_stanza_')) {
        const poemId = poemContainer.getAttribute('xml:id')
        const newId = `${poemId}_stanza_${newNumber}`
        stanza.setAttribute('xml:id', newId)
        console.log(`🏷️ Updated stanza ID: ${currentId} → ${newId}`)
      }
    })
  }

  // Helper: Find stanzas by their IDs
  findStanzasByIds(stanzaIds) {
    const stanzas = []
    
    stanzaIds.forEach(stanzaId => {
      console.log('🔍 Looking for stanza with ID:', stanzaId)
      
      // Try to find by xml:id first
      let stanza = this.dom.querySelector(`lg[xml\\:id="${stanzaId}"]`)
      
      // If that doesn't work, try alternative selectors for xml:id
      if (!stanza) {
        stanza = this.dom.querySelector(`lg[*|id="${stanzaId}"]`)
      }
      if (!stanza) {
        // Direct attribute search as fallback
        const allStanzas = this.dom.querySelectorAll('lg[type="stanza"]')
        stanza = Array.from(allStanzas).find(s => s.getAttribute('xml:id') === stanzaId)
      }
      
      console.log('📍 Found by xml:id:', !!stanza)
      
      // If not found, try by data-stanza-id (fallback)
      if (!stanza) {
        const renderedElement = document.querySelector(`[data-stanza-id="${stanzaId}"]`)
        console.log('📍 Found rendered element:', !!renderedElement)
        
        if (renderedElement) {
          // Find corresponding stanza in TEI DOM by position/content
          const stanzaNum = renderedElement.querySelector('.text-xs')?.textContent?.match(/Stanza (\d+)/)?.[1]
          console.log('📍 Extracted stanza number:', stanzaNum)
          
          if (stanzaNum) {
            // Try different selectors to handle nested structures
            stanza = this.dom.querySelector(`lg[type="stanza"][n="${stanzaNum}"]`)
            
            if (!stanza) {
              // Try within nested lg[type="poem"] structures
              const allStanzas = this.dom.querySelectorAll('lg[type="stanza"]')
              stanza = Array.from(allStanzas).find(s => s.getAttribute('n') === stanzaNum)
            }
            
            console.log('📍 Found by number:', !!stanza, stanza?.getAttribute('n'))
          }
          
          // Last resort: try to match by text content
          if (!stanza) {
            const firstLine = renderedElement.querySelector('[class*="line"]')?.textContent?.trim()
            if (firstLine) {
              const allStanzas = this.dom.querySelectorAll('lg[type="stanza"]')
              stanza = Array.from(allStanzas).find(s => {
                const firstStanzaLine = s.querySelector('l')?.textContent?.trim()
                return firstStanzaLine && firstStanzaLine.includes(firstLine.substring(0, 20))
              })
              console.log('📍 Found by content match:', !!stanza)
            }
          }
        }
      }
      
      if (stanza) {
        console.log('✅ Successfully found stanza:', stanza.getAttribute('n'))
        stanzas.push(stanza)
      } else {
        console.log('❌ Could not find stanza for ID:', stanzaId)
      }
    })
    
    console.log('📋 Total stanzas found:', stanzas.length)
    return stanzas
  }

  // Operation 1: Merge Stanzas (updated for checkbox selection)
  mergeStanzas(selection) {
    let stanzas = []
    
    // Check if we have selectedStanzaIds (from checkboxes)
    if (selection.selectedStanzaIds && selection.selectedStanzaIds.length > 0) {
      stanzas = this.findStanzasByIds(selection.selectedStanzaIds)
    } else {
      // Fallback to text selection method
      stanzas = this.findSelectedStanzas(selection)
    }
    
    if (stanzas.length < 2) {
      throw new Error('Please select at least 2 stanzas to merge')
    }

    console.log('🔄 Starting merge operation...')
    console.log('📍 Stanzas to merge:', stanzas.map(s => ({
      n: s.getAttribute('n'),
      xmlId: s.getAttribute('xml:id'),
      parent: s.parentElement?.tagName,
      linesCount: s.querySelectorAll('l').length,
      firstLineText: s.querySelector('l')?.textContent?.substring(0, 40) + '...'
    })))

    // Use the first stanza as the target
    const targetStanza = stanzas[0]
    console.log('🎯 Target stanza:', targetStanza.getAttribute('n'))
    console.log('🎯 Target has lines before merge:', targetStanza.querySelectorAll('l').length)
    
    // Move all lines from other stanzas to the first one
    for (let i = 1; i < stanzas.length; i++) {
      const sourceStanza = stanzas[i]
      console.log(`📥 Processing source stanza ${i}:`, sourceStanza.getAttribute('n'))
      
      const lines = Array.from(sourceStanza.querySelectorAll('l'))
      console.log(`📥 Lines to move from stanza ${sourceStanza.getAttribute('n')}:`, lines.length)
      
      lines.forEach((line, index) => {
        console.log(`🔄 Moving line ${index + 1}:`, line.textContent.substring(0, 30) + '...')
        targetStanza.appendChild(line)
      })
      
      console.log('🎯 Target stanza lines after moving:', targetStanza.querySelectorAll('l').length)
      console.log('📤 Source stanza lines remaining:', sourceStanza.querySelectorAll('l').length)
      
      // Remove the now-empty stanza
      console.log(`🗑️ Removing source stanza ${sourceStanza.getAttribute('n')}`)
      sourceStanza.remove()
    }
    
    console.log('🎯 Final target stanza lines count:', targetStanza.querySelectorAll('l').length)
    
    // Renumber lines in the merged stanza
    this.renumberStanzaLines(targetStanza)
    
    // Renumber all stanzas in the poem after merge
    this.renumberStanzasInPoem(targetStanza)
    
    // Debug: Check the actual DOM structure after merge
    console.log('🔍 Final DOM structure:')
    console.log('Target stanza XML:', new XMLSerializer().serializeToString(targetStanza))
    
    // Check if target stanza is still properly connected to the document
    console.log('🔗 Target stanza connected to document:', this.dom.contains(targetStanza))
    console.log('🔗 Target stanza parent:', targetStanza.parentElement?.tagName)
    
    console.log('✅ Merge operation completed')
    
    return {
      operation: 'merge-stanzas',
      merged: stanzas.length,
      result: targetStanza
    }
  }

  // Operation 2: Convert Line to Dedication
  convertLineToDedication(selection) {
    console.log('🏷️ Converting line-like element to dedication, selection:', selection)
    const element = this.findSelectedLineElement(selection)
    console.log('📍 Found element:', !!element, element?.tagName, element?.textContent?.substring(0, 30))
    
    if (!element) {
      throw new Error('Please select a poem line or heading to convert to dedication')
    }

    const elementText = element.textContent.trim()
    const parentElement = element.parentElement
    console.log('📝 Element text:', elementText)
    console.log('🏠 Parent element:', parentElement?.tagName)
    
    // Create dedication element with proper TEI namespace
    const dedication = this.dom.createElementNS('http://www.tei-c.org/ns/1.0', 'dedication')
    const paragraph = this.dom.createElementNS('http://www.tei-c.org/ns/1.0', 'p')
    paragraph.textContent = elementText
    dedication.appendChild(paragraph)
    console.log('✨ Created dedication element')
    
    // Replace the element with dedication
    parentElement.replaceChild(dedication, element)
    console.log('🔄 Replaced element with dedication')
    
    // Only renumber lines if we converted an actual line element
    if (element.tagName.toLowerCase() === 'l') {
      this.renumberStanzaLines(parentElement)
      console.log('🔢 Renumbered remaining lines')
    }
    
    return {
      operation: 'tag-dedication',
      originalText: elementText,
      result: dedication
    }
  }

  // Operation 3: Convert Line-like Element to Subtitle
  convertLineToSubtitle(selection) {
    const element = this.findSelectedLineElement(selection)
    
    if (!element) {
      throw new Error('Please select a poem line or heading to convert to subtitle')
    }

    const elementText = element.textContent.trim()
    const parentElement = element.parentElement
    
    // Create subtitle heading element with proper TEI namespace
    const subtitle = this.dom.createElementNS('http://www.tei-c.org/ns/1.0', 'head')
    subtitle.setAttribute('type', 'sub')
    subtitle.textContent = elementText
    
    // Replace the element with subtitle
    parentElement.replaceChild(subtitle, element)
    
    // Only renumber lines if we converted an actual line element
    if (element.tagName.toLowerCase() === 'l') {
      this.renumberStanzaLines(parentElement)
    }
    
    return {
      operation: 'tag-subtitle',
      originalText: elementText,
      result: subtitle
    }
  }

  // Operation 4: Convert Line-like Element to Epigraph
  convertLineToEpigraph(selection) {
    const element = this.findSelectedLineElement(selection)
    
    if (!element) {
      throw new Error('Please select a poem line or heading to convert to epigraph')
    }

    const elementText = element.textContent.trim()
    const parentElement = element.parentElement
    
    // Create epigraph element with proper TEI namespace
    const epigraph = this.dom.createElementNS('http://www.tei-c.org/ns/1.0', 'epigraph')
    const paragraph = this.dom.createElementNS('http://www.tei-c.org/ns/1.0', 'p')
    paragraph.textContent = elementText
    epigraph.appendChild(paragraph)
    
    // Replace the element with epigraph
    parentElement.replaceChild(epigraph, element)
    
    // Only renumber lines if we converted an actual line element
    if (element.tagName.toLowerCase() === 'l') {
      this.renumberStanzaLines(parentElement)
    }
    
    return {
      operation: 'tag-epigraph',
      originalText: elementText,
      result: epigraph
    }
  }

  // Operation 5: Convert Line-like Element to Heading
  convertLineToHeading(selection) {
    const element = this.findSelectedLineElement(selection)
    
    if (!element) {
      throw new Error('Please select a poem line or element to convert to heading')
    }

    const elementText = element.textContent.trim()
    const parentElement = element.parentElement
    
    // Create heading element with proper TEI namespace
    const heading = this.dom.createElementNS('http://www.tei-c.org/ns/1.0', 'head')
    heading.textContent = elementText
    
    // Replace the element with heading
    parentElement.replaceChild(heading, element)
    
    // Only renumber lines if we converted an actual line element
    if (element.tagName.toLowerCase() === 'l') {
      this.renumberStanzaLines(parentElement)
    }
    
    return {
      operation: 'tag-heading',
      originalText: elementText,
      result: heading
    }
  }

  // Operation 6: Delete Element
  deleteElement(selection) {
    console.log('🗑️ Starting element deletion, selection:', selection)
    
    // Find the selected element by content matching (more reliable than DOM traversal)
    const selectedText = selection.text?.trim()
    console.log('🎯 Selected text:', selectedText)
    
    if (!selectedText) {
      throw new Error('Please select some text to delete an element')
    }
    
    let elementToDelete = null
    let operationType = ''
    
    // First try to find element by ID if we have selectedStanzaIds
    let matchedElementText = selectedText
    if (selection.selectedStanzaIds && selection.selectedStanzaIds.length > 0) {
      const elementId = selection.selectedStanzaIds[0]
      console.log('🔍 Looking for element by ID:', elementId)
      
      // Try to find by data attribute (rendered elements)
      const renderedElement = document.querySelector(`[data-head-id="${elementId}"], [data-stanza-id="${elementId}"]`)
      if (renderedElement) {
        // Extract text content for matching
        const elementText = renderedElement.textContent?.trim()
        if (elementText) {
          matchedElementText = elementText
          console.log('📍 Found element by ID, using text:', elementText.substring(0, 30))
        }
      }
    }

    // Try to find various element types that could contain the selected text
    const elementSearches = [
      { selector: 'head[type="sub"]', type: 'delete-subtitle', name: 'subtitle' },
      { selector: 'head:not([type])', type: 'delete-heading', name: 'heading' },  
      { selector: 'dedication', type: 'delete-dedication', name: 'dedication' },
      { selector: 'epigraph', type: 'delete-epigraph', name: 'epigraph' },
      { selector: 'dateline', type: 'delete-dateline', name: 'date/location' },
      { selector: 'l', type: 'delete-line', name: 'line' },
      { selector: 'lg[type="stanza"]', type: 'delete-stanza', name: 'stanza' }
    ]
    
    // Search for matching elements by content
    for (const search of elementSearches) {
      const elements = this.dom.querySelectorAll(search.selector)
      const matchingElement = Array.from(elements).find(el => {
        const elText = el.textContent?.trim()
        return elText && (
          elText.includes(matchedElementText) ||
          matchedElementText.includes(elText) ||
          this.textContentMatches(elText, matchedElementText)
        )
      })
      
      if (matchingElement) {
        elementToDelete = matchingElement
        operationType = search.type
        console.log(`✅ Found ${search.name} to delete:`, matchingElement.textContent?.trim()?.substring(0, 50))
        break
      }
    }
    
    if (!elementToDelete) {
      throw new Error('Could not find a matching element to delete. Please select text within a heading, subtitle, dedication, epigraph, date, line, or stanza.')
    }
    
    const elementText = elementToDelete.textContent?.trim()
    const elementTag = elementToDelete.tagName.toLowerCase()
    const parentElement = elementToDelete.parentElement
    
    console.log(`🗑️ Deleting ${elementTag} element:`, elementText?.substring(0, 50))
    
    // Remove the element
    elementToDelete.remove()
    
    // Handle post-deletion cleanup
    if (operationType === 'delete-line' && parentElement?.tagName?.toLowerCase() === 'lg') {
      // Renumber remaining lines in stanza
      this.renumberStanzaLines(parentElement)
      console.log('🔢 Renumbered remaining lines in stanza')
    } else if (operationType === 'delete-stanza') {
      // Renumber remaining stanzas in poem
      this.renumberStanzasInPoem(elementToDelete)
      console.log('🔢 Renumbered remaining stanzas in poem')
    }
    
    console.log(`✅ Successfully deleted ${elementTag} element`)
    
    return {
      operation: operationType,
      deleted: elementTag,
      text: elementText
    }
  }
  
  // Helper: Check if two text contents match (with some flexibility)
  textContentMatches(text1, text2) {
    if (!text1 || !text2) return false
    
    // Normalize whitespace and compare
    const normalize = (text) => text.replace(/\s+/g, ' ').trim().toLowerCase()
    const norm1 = normalize(text1)
    const norm2 = normalize(text2)
    
    // Check for substantial overlap
    const shorter = norm1.length < norm2.length ? norm1 : norm2
    const longer = norm1.length >= norm2.length ? norm1 : norm2
    
    return longer.includes(shorter) && shorter.length > 10
  }

  // Execute operation based on operation ID
  executeOperation(operationId, selection) {
    switch (operationId) {
      case 'merge-stanzas':
        return this.mergeStanzas(selection)
      case 'tag-dedication':
        return this.convertLineToDedication(selection)
      case 'tag-subtitle':
        return this.convertLineToSubtitle(selection)
      case 'tag-epigraph':
        return this.convertLineToEpigraph(selection)
      case 'tag-heading':
        return this.convertLineToHeading(selection)
      case 'delete-element':
        return this.deleteElement(selection)
      default:
        throw new Error(`Unknown operation: ${operationId}`)
    }
  }
}