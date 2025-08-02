import { useMemo, forwardRef, useCallback, useRef, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { xml } from '@codemirror/lang-xml'
import { oneDark } from '@codemirror/theme-one-dark'

const TEICodePane = forwardRef(({ teiDocument, onScroll, onTeiChange }, ref) => {
  const codemirrorRef = useRef(null)

  const formattedXML = useMemo(() => {
    if (!teiDocument?.dom) return ''

    const serializer = new XMLSerializer()
    const xmlString = serializer.serializeToString(teiDocument.dom)
    
    // Find the start of actual content (first page break) and exclude TEI header
    const lines = xmlString.replace(/></g, '>\n<').split('\n')
    let startIndex = 0
    let inBody = false
    
    // Find where <text><body> starts and look for first <pb> tag
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Look for <body> tag
      if (line.includes('<body>') || line.includes('<body ')) {
        inBody = true
        continue
      }
      
      // Once in body, look for first page break
      if (inBody && (line.includes('<pb n=') || line.includes('<pb '))) {
        startIndex = i
        console.log(`📄 TEI display starting from line ${i}: ${line}`)
        break
      }
    }
    
    // If no page break found, start from <body>
    if (startIndex === 0) {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().includes('<body>')) {
          startIndex = i
          break
        }
      }
    }
    
    // Format only the content part (excluding header)
    const contentLines = lines.slice(startIndex)
    let indentLevel = 0
    
    const formatted = contentLines
      .map(line => {
        const trimmed = line.trim()
        if (!trimmed) return null
        
        // Adjust indent level for closing tags
        if (trimmed.startsWith('</')) {
          indentLevel = Math.max(0, indentLevel - 1)
        }
        
        // Create the indented line
        const indentedLine = '  '.repeat(indentLevel) + trimmed
        
        // Adjust indent level for opening tags (but not self-closing or closing tags)
        if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') && !trimmed.includes('</')) {
          indentLevel++
        }
        
        return indentedLine
      })
      .filter(line => line !== null)
      .join('\n')

    console.log(`📄 TEI pane showing ${contentLines.length} lines (header excluded)`)
    return formatted
  }, [teiDocument])

  // Handle CodeMirror changes
  const handleChange = useCallback((value) => {
    if (onTeiChange) {
      try {
        // Parse the XML to validate it
        const parser = new DOMParser()
        const dom = parser.parseFromString(value, 'application/xml')
        
        // Check for parsing errors
        const parserError = dom.querySelector('parsererror')
        if (parserError) {
          console.warn('XML parsing error:', parserError.textContent)
          // Still call onTeiChange but let parent handle validation
        }
        
        onTeiChange(value, dom)
      } catch (error) {
        console.error('Error parsing XML:', error)
      }
    }
  }, [onTeiChange])

  // Handle scroll events for page detection
  const handleScroll = useCallback(() => {
    if (onScroll && codemirrorRef.current) {
      const editor = codemirrorRef.current.view
      if (editor) {
        const scroller = editor.scrollDOM
        const scrollTop = scroller.scrollTop
        const containerHeight = scroller.clientHeight
        // console.log('🔄 TEI scroll event:', { scrollTop, containerHeight }) // Removed noisy logging
        onScroll(scrollTop, containerHeight, 'tei')
      }
    }
  }, [onScroll])

  // Set up scroll event listener
  useEffect(() => {
    const setupScrollListener = () => {
      if (codemirrorRef.current) {
        const editor = codemirrorRef.current.view
        if (editor && editor.scrollDOM) {
          const scroller = editor.scrollDOM
          scroller.addEventListener('scroll', handleScroll, { passive: true })
          return () => {
            scroller.removeEventListener('scroll', handleScroll)
          }
        }
      }
    }

    // Try to set up immediately
    let cleanup = setupScrollListener()
    
    // If not available yet, try again after a short delay
    if (!cleanup) {
      const timeout = setTimeout(() => {
        cleanup = setupScrollListener()
      }, 100)
      
      return () => {
        clearTimeout(timeout)
        if (cleanup) cleanup()
      }
    }
    
    return cleanup
  }, [handleScroll]) // Removed formattedXML dependency

  // Forward ref to CodeMirror for external scroll control
  useEffect(() => {
    const forwardRef = () => {
      if (ref && codemirrorRef.current && codemirrorRef.current.view) {
        const scrollDOM = codemirrorRef.current.view.scrollDOM
        console.log('🔗 TEI ref forwarding:', {
          codemirrorRef: codemirrorRef.current,
          view: codemirrorRef.current.view,
          scrollDOM,
          hasScrollTop: scrollDOM && typeof scrollDOM.scrollTop !== 'undefined'
        })
        
        if (scrollDOM && typeof scrollDOM.scrollTop !== 'undefined') {
          // Store the CodeMirror view reference on the scroll DOM for external access
          scrollDOM.cmView = codemirrorRef.current.view
          
          if (typeof ref === 'function') {
            ref(scrollDOM)
          } else {
            ref.current = scrollDOM
          }
          return true
        }
      }
      return false
    }

    // Try immediately
    let success = forwardRef()
    
    // If not successful, try multiple times with increasing delays
    if (!success) {
      const timeouts = []
      const delays = [50, 100, 200, 500] // Multiple retry attempts
      
      delays.forEach(delay => {
        timeouts.push(setTimeout(() => {
          const success = forwardRef()
          if (success) {
            // Clear remaining timeouts
            timeouts.forEach(clearTimeout)
          }
        }, delay))
      })
      
      return () => timeouts.forEach(clearTimeout)
    }
  }, [ref, formattedXML]) // Re-run when content changes too

  if (!teiDocument) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">No document loaded</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">TEI Source Code</h2>
        <p className="text-xs text-gray-500 mt-1">Click to edit XML directly</p>
      </div>
      
      <div className="flex-1" style={{overflow: 'hidden'}}>
        <CodeMirror
          ref={codemirrorRef}
          value={formattedXML}
          onChange={handleChange}
          extensions={[xml()]}
          height="100%"
          style={{
            fontSize: '12px',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            height: '100%'
          }}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightSelectionMatches: false,
            scrollPastEnd: true,
            searchKeymap: true
          }}
        />
      </div>
    </div>
  )
})

export default TEICodePane