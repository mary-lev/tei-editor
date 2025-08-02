import { useCallback } from 'react'

function UploadCard({ onFileLoad }) {
  const handleFileSelect = useCallback(async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      const text = await file.text()
      const parser = new DOMParser()
      const dom = parser.parseFromString(text, 'application/xml')
      
      // Check for parsing errors
      const parserError = dom.querySelector('parsererror')
      if (parserError) {
        throw new Error(`XML parsing failed: ${parserError.textContent}`)
      }

      // Extract document hash from filename to locate images
      const filename = file.name.replace('.xml', '')
      const hashMatch = filename.match(/doc_([a-f0-9]+)/)
      const documentHash = hashMatch ? hashMatch[1] : null

      const teiDocument = {
        dom,
        filename,
        documentHash,
        text
      }

      // For now, we'll pass empty images array - will implement image loading next
      const images = []
      
      onFileLoad(teiDocument, images)
    } catch (error) {
      alert(`Error loading TEI file: ${error.message}`)
    }
  }, [onFileLoad])

  const handleDrop = useCallback((event) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.name.endsWith('.xml')) {
      // Simulate file input change
      handleFileSelect({ target: { files: [file] } })
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((event) => {
    event.preventDefault()
  }, [])

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg hover:border-teal-700 transition-shadow duration-300 h-full">
      {/* Card Header */}
      <div className="text-center p-8 pb-6">
        <div className="inline-flex items-center justify-center w-10 h-10 mb-6">
          <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-primary mb-3 tracking-wide">Upload File</h3>
        <p className="text-sm text-muted font-normal">Upload your own TEI document</p>
      </div>

      {/* Upload Button */}
      <div className="px-8 pb-8 flex-1 flex items-center justify-center">
        <label className="inline-flex items-center px-8 py-3 bg-primary hover:bg-primary-dark text-white text-sm font-medium cursor-pointer transition-colors">
          <input
            type="file"
            className="hidden"
            accept=".xml"
            onChange={handleFileSelect}
          />
          Browse Files
        </label>
      </div>

      {/* Card Footer */}
      <div className="px-8 pb-8">
        <div className="pt-6 border-t border-neutral-100">
          <div className="flex items-center justify-center text-xs text-neutral-400 font-normal">
            <div className="w-1 h-1 bg-primary rounded-full mr-2"></div>
            Supports TEI P5 XML files
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadCard
