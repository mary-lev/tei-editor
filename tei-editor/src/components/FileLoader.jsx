import UploadCard from './UploadCard'
import SamplesCard from './SamplesCard'

function FileLoader({ onFileLoad }) {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      {/* Hero Header */}
      <section className="w-full bg-gray-50 py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
          TEI Poetry Editor
        </h1>
        <p className="text-lg text-gray-600 font-light">
          Load your TEI document or select a sample to get started
        </p>
      </section>
      {/* Cards Container */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 px-6 md:px-0">
          <UploadCard onFileLoad={onFileLoad} />
          <SamplesCard onFileLoad={onFileLoad} />
        </div>
      </div>
      {/* Optional: Add some bottom spacing or footer info */}
      <div className="mt-16 text-center">
        <div className="inline-flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Secure file processing</span>
          </div>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>TEI P5 compliant</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileLoader
