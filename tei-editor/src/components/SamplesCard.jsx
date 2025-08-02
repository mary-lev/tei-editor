import { useState, useEffect, useCallback } from 'react'

function SamplesCard({ onFileLoad }) {
  const [samples, setSamples] = useState([])
  const [loading, setLoading] = useState(true)

  // Load available samples on component mount
  useEffect(() => {
    async function loadSamples() {
      try {
        const response = await fetch('/samples/index.json')
        const data = await response.json()
        setSamples(data.samples)
      } catch (error) {
        console.warn('Could not load sample documents index:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSamples()
  }, [])

  const handleSampleClick = useCallback(async (sample) => {
    try {
      const response = await fetch(`/${sample.xmlPath}`)
      const text = await response.text()
      const parser = new DOMParser()
      const dom = parser.parseFromString(text, 'application/xml')
      
      // Check for parsing errors
      const parserError = dom.querySelector('parsererror')
      if (parserError) {
        throw new Error(`XML parsing failed: ${parserError.textContent}`)
      }

      const teiDocument = {
        dom,
        filename: sample.id,
        documentHash: sample.id.replace('doc_', ''),
        text,
        isLoadedFromSample: true,
        sampleInfo: sample
      }

      // For now, we'll pass empty images array - will implement image loading next
      const images = []
      
      onFileLoad(teiDocument, images)
    } catch (error) {
      alert(`Error loading sample document: ${error.message}`)
    }
  }, [onFileLoad])

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      {/* Card Header */}
      <div className="text-center p-6 pb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Sample Documents</h3>
        <p className="text-sm text-gray-600">Try the editor with example files</p>
      </div>

      {/* Samples List */}
      <div className="px-6 pb-6 flex-1">
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
              <p className="text-sm text-gray-500">Loading samples...</p>
            </div>
          ) : samples.length > 0 ? (
            <>
              <div className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-4">
                Available Samples
              </div>
              {samples.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSampleClick(sample)}
                  className="block p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-green-700">
                        {sample.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {sample.author} • {sample.totalPages} pages
                      </p>
                      {sample.description && (
                        <p className="text-xs text-gray-500 mt-1 overflow-hidden">
                          {sample.description.length > 70 
                            ? `${sample.description.substring(0, 70)}...` 
                            : sample.description}
                        </p>
                      )}
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-8 w-8 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">No sample documents available</p>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 pb-6">
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-center text-xs text-gray-500">
            <svg 
              className="mr-2" 
              width="16" 
              height="16" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Perfect for testing features
          </div>
        </div>
      </div>
    </div>
  )
}

export default SamplesCard
