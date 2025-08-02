import { useRef, useEffect, useCallback } from 'react'

export function useSynchronizedScrolling(teiDocument) {
  const renderedTextRef = useRef(null)
  const imageRef = useRef(null)
  const teiCodeRef = useRef(null)
  const isScrollingRef = useRef(false)
  const timeoutRef = useRef(null)

  // Get page break positions in the rendered text pane
  const getPageBreakPositions = useCallback(() => {
    if (!renderedTextRef.current) return []
    
    const pageBreaks = renderedTextRef.current.querySelectorAll('[data-page-break]')
    return Array.from(pageBreaks).map(pb => ({
      pageNumber: parseInt(pb.dataset.pageNumber),
      offsetTop: pb.offsetTop,
      element: pb
    }))
  }, [])

  // Calculate which page is currently visible based on scroll position
  const getCurrentPage = useCallback((scrollTop, pageBreakPositions) => {
    if (pageBreakPositions.length === 0) return null
    
    // Find the page break that's closest to the current scroll position
    let currentPage = pageBreakPositions[0]
    
    for (const pageBreak of pageBreakPositions) {
      if (pageBreak.offsetTop <= scrollTop + 100) { // 100px offset for better UX
        currentPage = pageBreak
      } else {
        break
      }
    }
    
    return currentPage
  }, [])

  // Scroll image pane to corresponding page
  const scrollToPage = useCallback((pageNumber) => {
    if (!imageRef.current) return
    
    const pageElement = imageRef.current.querySelector(`[data-page-number="${pageNumber}"]`)
    if (pageElement) {
      const container = imageRef.current
      const containerRect = container.getBoundingClientRect()
      const elementRect = pageElement.getBoundingClientRect()
      
      // Calculate smooth scroll position - center the page in view
      const scrollTop = container.scrollTop + elementRect.top - containerRect.top - (containerRect.height / 3)
      
      container.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      })
    }
  }, [])

  // Sync TEI code pane scroll proportionally
  const syncTeiCodeScroll = useCallback((renderedScrollRatio) => {
    if (!teiCodeRef.current) return
    
    const teiContainer = teiCodeRef.current
    const maxScroll = teiContainer.scrollHeight - teiContainer.clientHeight
    
    if (maxScroll > 0) {
      const targetScroll = maxScroll * renderedScrollRatio
      teiContainer.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      })
    }
  }, [])

  // Main scroll handler for rendered text pane
  const handleRenderedTextScroll = useCallback(() => {
    if (isScrollingRef.current) return
    
    const container = renderedTextRef.current
    if (!container) return
    
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight
    const scrollRatio = scrollTop / (scrollHeight - clientHeight) || 0
    
    // Get current page based on scroll position
    const pageBreakPositions = getPageBreakPositions()
    const currentPage = getCurrentPage(scrollTop, pageBreakPositions)
    
    // Debounce scroll events to avoid excessive updates
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      isScrollingRef.current = true
      
      // Scroll image pane to corresponding page
      if (currentPage) {
        scrollToPage(currentPage.pageNumber)
      }
      
      // Scroll TEI code pane proportionally
      syncTeiCodeScroll(scrollRatio)
      
      // Reset scrolling flag after animation completes
      setTimeout(() => {
        isScrollingRef.current = false
      }, 300)
    }, 50) // 50ms debounce
  }, [getPageBreakPositions, getCurrentPage, scrollToPage, syncTeiCodeScroll])

  // Attach scroll listener to rendered text pane
  useEffect(() => {
    const container = renderedTextRef.current
    if (!container) return
    
    container.addEventListener('scroll', handleRenderedTextScroll, { passive: true })
    
    return () => {
      container.removeEventListener('scroll', handleRenderedTextScroll)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [handleRenderedTextScroll])

  return {
    renderedTextRef,
    imageRef,
    teiCodeRef
  }
}