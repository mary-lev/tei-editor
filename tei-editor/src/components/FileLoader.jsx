import UploadCard from './UploadCard'
import SamplesCard from './SamplesCard'

function FileLoader({ onFileLoad }) {
  return (
      <div className="h-full w-full bg-white flex flex-col justify-center items-center px-6">
      {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-primary mb-3 tracking-tight">
            TEI Poetry Editor
          </h1>
          <p className="text-base text-muted font-normal">
            Load your TEI document or select a sample to get started
          </p>
          {/* Force refresh marker */}
        </div>

      {/* Cards Container - Single Row */}
      <div className="flex justify-center items-center gap-8">
        <div className="w-80">
          <UploadCard onFileLoad={onFileLoad} />
        </div>
        <div className="w-80">
          <SamplesCard onFileLoad={onFileLoad} />
        </div>
      </div>

        {/* Optional: Add some bottom spacing or footer info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-muted">
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Secure file processing</span>
            </div>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <span>TEI P5 compliant</span>
            </div>
          </div>
        </div>
      </div>
  )
}

export default FileLoader