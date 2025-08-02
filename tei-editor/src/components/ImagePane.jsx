import { useState, useEffect, forwardRef, useCallback } from 'react'

const ImagePane = forwardRef(({ documentImages, documentHash, teiDocument, onScroll }, ref) => {
  const [images, setImages] = useState([])
  const [loadingImages, setLoadingImages] = useState(false)

  useEffect(() => {
    if (!documentHash || !teiDocument) return

    const loadImages = async () => {
      setLoadingImages(true)
      try {
        // Extract actual page numbers from TEI document
        const pageBreaks = teiDocument.dom.querySelectorAll('pb')
        const pageNumbers = Array.from(pageBreaks).map(pb => parseInt(pb.getAttribute('n')))
        
        console.log('📖 Found pages in TEI:', pageNumbers)
        
        const teiImages = pageNumbers.map(pageNum => ({
          pageNumber: pageNum,
          src: teiDocument.isLoadedFromSample 
            ? `/samples/doc_${documentHash}/images/page_${String(pageNum).padStart(4, '0')}.png`
            : `/doc_${documentHash}/images/page_${String(pageNum).padStart(4, '0')}.png`,
          alt: `Page ${pageNum}`
        }))
        
        setImages(teiImages)
      } catch (error) {
        console.error('Error loading images:', error)
        setImages([])
      } finally {
        setLoadingImages(false)
      }
    }

    loadImages()
  }, [documentHash, teiDocument])

  // Handle scroll events for page detection
  const handleScroll = useCallback((event) => {
    if (onScroll && ref.current) {
      const container = event.target
      const scrollTop = container.scrollTop
      const containerHeight = container.clientHeight
      onScroll(scrollTop, containerHeight, 'image')
    }
  }, [onScroll, ref])

  if (loadingImages) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading images...</div>
      </div>
    )
  }

  if (!documentHash) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">No document loaded</div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto" ref={ref} onScroll={handleScroll}>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Manuscript Images</h2>
        
        {images.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No images found for document hash: {documentHash}</p>
            <p className="text-sm mt-2">
              Expected images in: doc_{documentHash}/images/
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {images.map((image) => (
              <div 
                key={image.pageNumber} 
                className="border rounded-lg overflow-hidden"
                data-page-number={image.pageNumber}
              >
                <div className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700">
                  Page {image.pageNumber}
                </div>
                <div className="p-2">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-auto border rounded"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'block'
                    }}
                  />
                  <div 
                    className="hidden text-center py-8 text-gray-400 bg-gray-50 rounded border-2 border-dashed"
                    style={{ display: 'none' }}
                  >
                    <p>Image not found</p>
                    <p className="text-xs mt-1">{image.src}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

export default ImagePane