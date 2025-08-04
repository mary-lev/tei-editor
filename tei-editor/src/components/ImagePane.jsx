import { useState, useEffect, forwardRef, useCallback } from 'react'

const ImagePane = forwardRef(({ documentImages, documentHash, teiDocument, onScroll }, ref) => {
  const [images, setImages] = useState([])
  const [loadingImages, setLoadingImages] = useState(false)

  useEffect(() => {
    if (!teiDocument) return

    const loadImages = async () => {
      setLoadingImages(true)
      try {
        // Check if we have uploaded images (from ZIP)
        if (teiDocument.isUserUpload && documentImages && documentImages.length > 0) {
          console.log('📖 Using uploaded images:', documentImages.length)
          console.log('📋 Document images details:', documentImages.map(img => ({
            pageNumber: img.pageNumber,
            filename: img.filename,
            hasUrl: !!img.url,
            urlPreview: img.url ? img.url.substring(0, 50) + '...' : null
          })))
          
          // Extract page numbers from TEI to match with uploaded images
          const pageBreaks = teiDocument.dom.querySelectorAll('pb')
          const pbPageNumbers = Array.from(pageBreaks).map(pb => parseInt(pb.getAttribute('n')))
          
          const facsElements = teiDocument.dom.querySelectorAll('[facs]')
          const facsPageNumbers = Array.from(facsElements)
            .map(el => {
              const facs = el.getAttribute('facs')
              const match = facs?.match(/#page_?(\d+)/)
              return match ? parseInt(match[1]) : null
            })
            .filter(num => num !== null)
          
          const allPageNumbers = [...pbPageNumbers, ...facsPageNumbers]
          const pageNumbers = [...new Set(allPageNumbers)].sort((a, b) => a - b)
          
          // Match TEI page numbers with uploaded images
          const matchedImages = pageNumbers.map(pageNum => {
            const uploadedImage = documentImages.find(img => img.pageNumber === pageNum)
            console.log(`🔍 Matching page ${pageNum}:`, {
              found: !!uploadedImage,
              url: uploadedImage ? uploadedImage.url : null,
              filename: uploadedImage ? uploadedImage.filename : null
            })
            return {
              pageNumber: pageNum,
              src: uploadedImage ? uploadedImage.url : null,
              alt: `Page ${pageNum}`,
              filename: uploadedImage ? uploadedImage.filename : null,
              isUploaded: !!uploadedImage
            }
          })
          
          console.log('🖼️ Matched images:', matchedImages.map(img => ({
            page: img.pageNumber,
            hasImage: !!img.src,
            filename: img.filename
          })))
          
          setImages(matchedImages)
        } 
        // Handle sample documents or documents with hash-based images
        else if (documentHash) {
          console.log('📖 Loading static images for hash:', documentHash)
          
          // Extract page numbers from both <pb> elements and facs attributes
          const pageBreaks = teiDocument.dom.querySelectorAll('pb')
          const pbPageNumbers = Array.from(pageBreaks).map(pb => parseInt(pb.getAttribute('n')))
          
          const facsElements = teiDocument.dom.querySelectorAll('[facs]')
          const facsPageNumbers = Array.from(facsElements)
            .map(el => {
              const facs = el.getAttribute('facs')
              const match = facs?.match(/#page_?(\d+)/)
              return match ? parseInt(match[1]) : null
            })
            .filter(num => num !== null)
          
          const allPageNumbers = [...pbPageNumbers, ...facsPageNumbers]
          const pageNumbers = [...new Set(allPageNumbers)].sort((a, b) => a - b)
          
          const teiImages = pageNumbers.map(pageNum => ({
            pageNumber: pageNum,
            src: teiDocument.isLoadedFromSample 
              ? `/samples/doc_${documentHash}/images/page_${String(pageNum).padStart(4, '0')}.png`
              : `/doc_${documentHash}/images/page_${String(pageNum).padStart(4, '0')}.png`,
            alt: `Page ${pageNum}`,
            isUploaded: false
          }))
          
          setImages(teiImages)
        }
        // No images available
        else {
          console.log('📖 No images available for document')
          setImages([])
        }
      } catch (error) {
        console.error('Error loading images:', error)
        setImages([])
      } finally {
        setLoadingImages(false)
      }
    }

    loadImages()
  }, [documentHash, teiDocument, documentImages])

  // Note: No cleanup needed for data URLs (they're self-contained strings)
  // Data URLs don't require explicit cleanup like blob URLs

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

  if (!teiDocument) {
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
            {teiDocument.isUserUpload ? (
              <>
                <p>No images available</p>
                <p className="text-sm mt-2">
                  Upload a ZIP file with images/ folder to view manuscript pages
                </p>
              </>
            ) : (
              <>
                <p>No images found for document</p>
                <p className="text-sm mt-2">
                  {documentHash ? `Expected images in: doc_${documentHash}/images/` : 'No document hash available'}
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {images.map((image) => (
              <div 
                key={image.pageNumber} 
                className="border rounded-lg overflow-hidden"
                data-page-number={image.pageNumber}
              >
                <div className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 flex justify-between items-center">
                  <span>Page {image.pageNumber}</span>
                  {image.isUploaded && (
                    <span className="text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded">
                      Uploaded
                    </span>
                  )}
                </div>
                <div className="p-2">
                  {image.src ? (
                    <>
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
                        <p>Image failed to load</p>
                        <p className="text-xs mt-1">{image.filename || image.src}</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded border-2 border-dashed">
                      <p>No image available for this page</p>
                      <p className="text-xs mt-1">Page {image.pageNumber}</p>
                    </div>
                  )}
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