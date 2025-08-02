import { useState, useRef, useCallback, useEffect, useMemo } from 'react'

export function usePageBlockScrolling(teiDocument, isModifyingTei = false) {
  const [currentPage, setCurrentPage] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const scrollInitiator = useRef(null)
  const pageMappingsCache = useRef(null)
  const lastTeiVersion = useRef(null)
  const scrollDetectionTimeout = useRef(null)

  // Refs for the three panes
  const renderedTextRef = useRef(null)
  const imageRef = useRef(null)
  const teiCodeRef = useRef(null)

  // Helper function to get TEI header offset - now returns 0 since we exclude header
  const getTeiHeaderOffset = useCallback(() => {
    // Since we now start TEI display from first page break, no header offset needed
    console.log(`🔍 TEI header offset: 0px (header excluded from display)`)
    return 0
  }, [])

  // Helper function to get element position in TEI code with CodeMirror document access
  const getElementLinePosition = useCallback((element, teiText) => {
    if (!teiText) return 0
    
    const pageNum = element.getAttribute('n')
    console.log(`🔍 Starting position calc for page ${pageNum}`)
    
    // Get CodeMirror editor instance to access full document content
    if (teiCodeRef.current) {
      // Try to access CodeMirror editor view for full document content
      const codeMirrorEditor = teiCodeRef.current.querySelector('.cm-editor')
      const codeMirrorContent = teiCodeRef.current.querySelector('.cm-content')
      
      console.log(`🔍 CodeMirror access:`, {
        teiCodeRef: teiCodeRef.current,
        codeMirrorEditor,
        codeMirrorContent,
        className: teiCodeRef.current.className
      })
      
      if (codeMirrorContent) {
        // Get the full document text from CodeMirror's state, not just visible DOM
        // CodeMirror uses virtual scrolling, so we need to get the full text content
        let fullDocumentText = ''
        
        // Try to access CodeMirror's editor view through the scroll container
        // The teiCodeRef.current should be the .cm-scroller element
        // Look for the CodeMirror view in the DOM structure
        let codeMirrorView = null
        
        // Method 1: Check if the scroll container has a reference to the view
        if (teiCodeRef.current.cmView) {
          codeMirrorView = teiCodeRef.current.cmView
        }
        // Method 2: Look for the editor in parent elements
        else {
          const editor = teiCodeRef.current.closest('.cm-editor')
          if (editor && editor.cmView) {
            codeMirrorView = editor.cmView
          }
        }
        
        if (codeMirrorView && codeMirrorView.state && codeMirrorView.state.doc) {
          // Access CodeMirror's full document state (header-less content)
          fullDocumentText = codeMirrorView.state.doc.toString()
          console.log('📄 Got full CodeMirror document (header-less):', fullDocumentText.length, 'chars')
        } else {
          // Fallback: extract visible text and hope it contains our page
          fullDocumentText = codeMirrorContent.textContent || codeMirrorContent.innerText
          console.log('📝 Using visible text fallback (header-less):', fullDocumentText.length, 'chars')
        }
        
        // If we have the full document text, search through it
        if (fullDocumentText) {
          const lines = fullDocumentText.split('\n')
          console.log(`🔍 Full document analysis:`, {
            totalLines: lines.length,
            hasPageBreaks: fullDocumentText.includes('<pb n='),
            searchPattern: `<pb n="${pageNum}"`
          })
          
          // Get accurate line height from CodeMirror
          let lineHeight = 16.8 // CodeMirror default for 12px font
          
          try {
            const codeMirrorLine = codeMirrorContent.querySelector('.cm-line')
            if (codeMirrorLine) {
              const computedStyle = window.getComputedStyle(codeMirrorLine)
              const computedLineHeight = parseFloat(computedStyle.lineHeight)
              if (!isNaN(computedLineHeight) && computedLineHeight > 0) {
                lineHeight = computedLineHeight
              }
            }
          } catch (e) {
            console.warn('Could not detect CodeMirror line height:', e)
          }
          
          // Search for the page break in the full document
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            if (line.includes(`<pb n="${pageNum}"`) || line.includes(`pb n="${pageNum}"`)) {
              const position = i * lineHeight
              console.log(`🎯 Found page ${pageNum} at line ${i}/${lines.length}, position ${position}px`)
              return position
            }
          }
          console.warn(`❌ Page ${pageNum} not found in full document (${lines.length} lines)`)
        }
      }
      
      // Fallback to old pre element method (for backward compatibility)
      const preElement = teiCodeRef.current.querySelector('pre')
      if (preElement) {
        const displayedText = preElement.textContent || preElement.innerText
        const lines = displayedText.split('\n')
        let lineHeight = 19.5
        
        try {
          const computedStyle = window.getComputedStyle(preElement)
          const computedLineHeight = parseFloat(computedStyle.lineHeight)
          if (!isNaN(computedLineHeight) && computedLineHeight > 0) {
            lineHeight = computedLineHeight
          }
        } catch (e) {
          // Use fallback
        }
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          if (line.includes(`<pb n="${pageNum}"`) || line.includes(`pb n="${pageNum}"`)) {
            return i * lineHeight
          }
        }
      }
    }
    
    // Final fallback: use the raw TEI text passed to the function
    console.log('🔄 Using raw TEI text fallback')
    const lines = teiText.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(`<pb n="${pageNum}"`) || lines[i].includes(`pb n="${pageNum}"`)) {
        const position = i * 16.8 // Use CodeMirror line height
        console.log(`🎯 Found page ${pageNum} in raw text at line ${i}, position ${position}px`)
        return position
      }
    }
    
    console.warn(`❌ Page ${pageNum} not found anywhere`)
    return 0
  }, [teiCodeRef])

  // Extract TEI page markers with robust <pb> detection
  const getTeiPageMarkers = useCallback(() => {
    if (!teiDocument?.dom) return []
    
    const pageBreaks = teiDocument.dom.querySelectorAll('pb')
    
    const markers = Array.from(pageBreaks).map((pb, index) => {
      const pageNum = pb.getAttribute('n') || pb.getAttribute('facs')?.match(/page_(\d+)/)?.[1] || (index + 1)
      return {
        pageNumber: parseInt(pageNum),
        element: pb,
        position: getElementLinePosition(pb, teiDocument.text || ''),
        facsimile: pb.getAttribute('facs') || `page_${String(pageNum).padStart(4, '0')}.png`
      }
    })
    
    return markers
  }, [teiDocument?.dom, teiDocument?.text, getElementLinePosition])

  // Helper function to get page content height
  const getPageContentHeight = useCallback((pageElement) => {
    if (!pageElement) return 0
    
    // Find the next page break element in the same container
    const container = pageElement.closest('[data-pane="rendered-text"]')
    if (!container) return 500
    
    const allPageBreaks = Array.from(container.querySelectorAll('[data-page-break]'))
    const currentIndex = allPageBreaks.indexOf(pageElement)
    
    if (currentIndex === -1) return 500
    
    // Get the next page break
    const nextPageBreak = allPageBreaks[currentIndex + 1]
    
    if (nextPageBreak) {
      const height = nextPageBreak.offsetTop - pageElement.offsetTop
      return height
    }
    
    // Last page - calculate to end of container
    const height = container.scrollHeight - pageElement.offsetTop
    return height
  }, [])

  // Cached page mapping for performance (only recalculate when TEI changes)
  const getPageMappings = useCallback(() => {
    const currentTeiVersion = teiDocument?.text?.length || 0
    
    // Force fresh calculation for TEI positions since they depend on formatted text
    // which might change even if the source TEI text length doesn't change
    const shouldRecalculate = !pageMappingsCache.current || 
                             lastTeiVersion.current !== currentTeiVersion
    
    if (!shouldRecalculate) {
      return pageMappingsCache.current
    }
    
    const textPageElements = renderedTextRef.current?.querySelectorAll('[data-page-break]') || []
    const imagePageElements = imageRef.current?.querySelectorAll('[data-page-number]') || []
    const teiPageMarkers = getTeiPageMarkers()


    console.log('🗺️ Building page mappings:', {
      teiPageMarkers: teiPageMarkers.map(m => `Page ${m.pageNumber}`),
      textPageElements: Array.from(textPageElements).map(el => `Page ${el.dataset.pageNumber}`),
      imagePageElements: Array.from(imagePageElements).map(el => `Page ${el.dataset.pageNumber}`)
    })

    const mappings = teiPageMarkers.map((teiMarker) => {
      // Find corresponding elements in text and image panes
      const textEl = Array.from(textPageElements).find(el => 
        parseInt(el.dataset.pageNumber) === teiMarker.pageNumber
      )
      const imageEl = Array.from(imagePageElements).find(el => 
        parseInt(el.dataset.pageNumber) === teiMarker.pageNumber
      )

      const mapping = {
        pageNumber: teiMarker.pageNumber,
        textPosition: textEl?.offsetTop || 0,
        imagePosition: imageEl?.offsetTop || 0,
        teiPosition: teiMarker.position,
        textHeight: textEl ? getPageContentHeight(textEl) : 0,
        imageHeight: imageEl?.offsetHeight || 0,
        facsimile: teiMarker.facsimile,
        hasTextContent: !!textEl,
        hasImageContent: !!imageEl
      }

      console.log(`📍 Page ${mapping.pageNumber} mapping:`, {
        tei: `${mapping.teiPosition}px`,
        text: mapping.hasTextContent ? `${mapping.textPosition}px` : 'missing',
        image: mapping.hasImageContent ? `${mapping.imagePosition}px` : 'missing'
      })

      return mapping
    })

    // Cache the result
    pageMappingsCache.current = mappings
    lastTeiVersion.current = currentTeiVersion
    
    return mappings
  }, [teiDocument?.text, getTeiPageMarkers, getPageContentHeight])

  // Smooth scroll helper function
  const smoothScrollTo = useCallback((container, targetPosition, duration = 800, easing = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)') => {
    return new Promise((resolve) => {
      const startPosition = container.scrollTop
      const distance = targetPosition - startPosition
      const startTime = performance.now()

      // If no distance to travel, resolve immediately
      if (Math.abs(distance) < 1) {
        resolve()
        return
      }

      const animateScroll = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Apply easing function (approximation of cubic-bezier)
        const easedProgress = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2

        const newScrollTop = startPosition + distance * easedProgress
        container.scrollTop = newScrollTop

        if (progress < 1) {
          requestAnimationFrame(animateScroll)
        } else {
          resolve()
        }
      }

      requestAnimationFrame(animateScroll)
    })
  }, [])

  // Smooth, comfortable scroll to specific page
  const scrollToPageBlock = useCallback((targetPage, initiatingPane = null) => {
    if (isTransitioning || targetPage === currentPage) {
      return
    }

    setIsTransitioning(true)
    scrollInitiator.current = initiatingPane

    // Force fresh TEI position calculation by clearing cache
    pageMappingsCache.current = null
    
    const pageMappings = getPageMappings()
    console.log(`🎯 Looking for Page ${targetPage} in mappings:`, pageMappings.map(p => p.pageNumber))
    
    const targetMapping = pageMappings.find(p => p.pageNumber === targetPage)

    if (!targetMapping) {
      console.warn(`❌ No mapping found for Page ${targetPage}`)
      setIsTransitioning(false)
      return
    }
    
    console.log(`✅ Found mapping for Page ${targetPage}:`, {
      teiPosition: targetMapping.teiPosition,
      textPosition: targetMapping.textPosition,
      imagePosition: targetMapping.imagePosition
    })

    // Comfortable scroll timing (slower, more pleasant)
    const scrollDuration = 800 // 800ms for comfortable transition
    const easing = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' // Smooth easing

    // Scroll all three panes simultaneously to show the same page
    const scrollPromises = []

    // Text pane - center the page content
    if (renderedTextRef.current && initiatingPane !== 'text') {
      scrollPromises.push(smoothScrollTo(
        renderedTextRef.current,
        targetMapping.textPosition - 50, // Small offset for better visual alignment
        scrollDuration,
        easing
      ))
    }

    // Image pane - show corresponding manuscript page
    if (imageRef.current && initiatingPane !== 'image') {
      scrollPromises.push(smoothScrollTo(
        imageRef.current,
        targetMapping.imagePosition,
        scrollDuration,
        easing
      ))
    }

    // TEI code pane - show corresponding XML section (no header offset needed)
    if (teiCodeRef.current && initiatingPane !== 'tei') {
      // No header offset needed since TEI pane now starts from first page break
      const teiPosition = targetMapping.teiPosition
      
      const scrollContainer = teiCodeRef.current
      console.log(`📱 PANE SYNC → Page ${targetPage}:`, {
        'Image Pane': imageRef.current ? `${targetMapping.imagePosition}px` : 'N/A',
        'Text Pane': renderedTextRef.current ? `${targetMapping.textPosition - 50}px` : 'N/A', 
        'TEI Pane': scrollContainer ? `${teiPosition}px (header-less display)` : 'N/A'
      })
      
      if (scrollContainer && typeof scrollContainer.scrollTop !== 'undefined') {
        console.log('📜 Scrolling TEI pane to:', teiPosition)
        scrollPromises.push(smoothScrollTo(
          scrollContainer,
          teiPosition,
          scrollDuration,
          easing
        ))
      } else {
        console.warn('❌ TEI scroll container not valid:', scrollContainer)
      }
    }

    // If no valid scrolling needed, reset immediately
    if (scrollPromises.length === 0) {
      setCurrentPage(targetPage)
      setIsTransitioning(false)
      scrollInitiator.current = null
      return
    }

    // Wait for all scrolling to complete
    Promise.all(scrollPromises).then(() => {
      setCurrentPage(targetPage)
      console.log(`✅ SYNC COMPLETE → All panes now showing Page ${targetPage}`)
      setTimeout(() => {
        setIsTransitioning(false)
        scrollInitiator.current = null
      }, 50)
    }).catch(error => {
      console.error('❌ Scroll sync failed:', error)
      setIsTransitioning(false)
      scrollInitiator.current = null
    })
  }, [currentPage, isTransitioning, getPageMappings, smoothScrollTo])

  // Handle page navigation (next/previous/goto)
  const handlePageNavigation = useCallback((direction, initiatingPane, specificPage = null) => {
    if (isTransitioning) return

    const pageMappings = getPageMappings()
    const maxPage = Math.max(...pageMappings.map(p => p.pageNumber))
    const minPage = Math.min(...pageMappings.map(p => p.pageNumber))

    let targetPage = currentPage

    if (direction === 'next' && currentPage < maxPage) {
      targetPage = currentPage + 1
    } else if (direction === 'prev' && currentPage > minPage) {
      targetPage = currentPage - 1
    } else if (direction === 'goto' && specificPage !== null) {
      // Validate the specific page is within available pages
      const pageExists = pageMappings.some(mapping => mapping.pageNumber === specificPage)
      if (pageExists && specificPage >= minPage && specificPage <= maxPage) {
        targetPage = specificPage
      }
    }

    if (targetPage !== currentPage) {
      scrollToPageBlock(targetPage, initiatingPane)
    }
  }, [currentPage, isTransitioning, scrollToPageBlock, getPageMappings])

  // Debounced scroll detection for performance with large documents
  const detectPageFromScroll = useCallback((scrollTop, containerHeight, initiatingPane) => {
    if (isTransitioning || scrollInitiator.current === initiatingPane || isModifyingTei) {
      console.log('🚫 Skipping page detection:', {
        isTransitioning,
        scrollInitiator: scrollInitiator.current,
        isModifyingTei,
        reason: isModifyingTei ? 'TEI operation in progress' : 'transition/scroll conflict'
      })
      return
    }

    // Clear existing timeout to debounce rapid scroll events
    if (scrollDetectionTimeout.current) {
      clearTimeout(scrollDetectionTimeout.current)
    }

    scrollDetectionTimeout.current = setTimeout(() => {
      // Force fresh mapping calculation by clearing cache
      pageMappingsCache.current = null
      const pageMappings = getPageMappings()
      if (!pageMappings.length) return

      // Find which page is most prominently displayed
      let detectedPage = currentPage
      let maxVisibleArea = 0

      pageMappings.forEach(mapping => {
        // Handle missing content gracefully
        if (!mapping.hasTextContent && initiatingPane === 'text') return
        if (!mapping.hasImageContent && initiatingPane === 'image') return

        const pageStart = initiatingPane === 'text' ? mapping.textPosition : mapping.imagePosition
        const pageHeight = initiatingPane === 'text' ? mapping.textHeight : mapping.imageHeight
        const pageEnd = pageStart + pageHeight
        const viewStart = scrollTop
        const viewEnd = scrollTop + containerHeight

        // Calculate visible area of this page
        const visibleStart = Math.max(pageStart, viewStart)
        const visibleEnd = Math.min(pageEnd, viewEnd)
        const visibleArea = Math.max(0, visibleEnd - visibleStart)

        if (visibleArea > maxVisibleArea) {
          maxVisibleArea = visibleArea
          detectedPage = mapping.pageNumber
        }
      })

      // If detected page is different and occupies majority of view, switch
      if (detectedPage !== currentPage && maxVisibleArea > containerHeight * 0.6) {
        setCurrentPage(detectedPage)
        scrollToPageBlock(detectedPage, initiatingPane)
      }
    }, 300) // Increased from 100ms to 300ms to prevent scroll conflicts
  }, [currentPage, isTransitioning, scrollToPageBlock, getPageMappings, isModifyingTei])

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        handlePageNavigation('next', 'keyboard')
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        handlePageNavigation('prev', 'keyboard')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handlePageNavigation])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollDetectionTimeout.current) {
        clearTimeout(scrollDetectionTimeout.current)
      }
    }
  }, [])

  // Get total pages
  const totalPages = useMemo(() => {
    const pageMappings = getPageMappings()
    return pageMappings.length > 0 ? Math.max(...pageMappings.map(p => p.pageNumber)) : 0
  }, [getPageMappings])

  // Debug function to test TEI position calculation
  const debugTeiPosition = useCallback((pageNum) => {
    console.log(`🔍 DEBUG: Testing TEI position for page ${pageNum}`)
    if (teiDocument?.dom) {
      const pageBreaks = teiDocument.dom.querySelectorAll('pb')
      const targetPb = Array.from(pageBreaks).find(pb => 
        parseInt(pb.getAttribute('n')) === pageNum
      )
      if (targetPb) {
        const teiPos = getElementLinePosition(targetPb, teiDocument.text)
        console.log(`🔍 DEBUG: TEI position result: ${teiPos}px`)
        return teiPos
      } else {
        console.log(`🔍 DEBUG: Page break ${pageNum} not found`)
      }
    } else {
      console.log(`🔍 DEBUG: No TEI document DOM`)
    }
    return 0
  }, [teiDocument, getElementLinePosition])

  // Make debugTeiPosition available globally for console testing
  if (typeof window !== 'undefined') {
    window.debugTeiPosition = debugTeiPosition
  }

  return {
    // Refs for components
    renderedTextRef,
    imageRef,
    teiCodeRef,
    
    // Current state
    currentPage,
    totalPages,
    isTransitioning,
    
    // Navigation functions
    scrollToPageBlock,
    handlePageNavigation,
    detectPageFromScroll,
    
    // Utility functions
    getPageMappings,
    
    // Debug functions
    debugTeiPosition
  }
}