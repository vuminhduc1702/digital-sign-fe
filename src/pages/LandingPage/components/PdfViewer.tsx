import { Worker, Viewer } from "@react-pdf-viewer/core"
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout"
import "@react-pdf-viewer/core/lib/styles/index.css"
import "@react-pdf-viewer/default-layout/lib/styles/index.css"

export default function App() {
  const renderToolbar = (Toolbar) => (
    <Toolbar>
      {(slots) => {
        const {
          CurrentPageLabel,
          Download,
          GoToNextPage,
          GoToPreviousPage,
          NumberOfPages,
          Zoom,
          ZoomIn,
          ZoomOut
        } = slots;
        return (
          <div className="flex items-center justify-between w-full font-helvetica">
            <div className="p-2">
              <GoToPreviousPage />
            </div>
            <div className="p-2">
              <CurrentPageLabel /> / <NumberOfPages />
            </div>
            <div className="p-2">
              <GoToNextPage />
            </div>
            <div className="p-2 ml-auto">
              <ZoomOut />
            </div>
            <div className="p-2">
              <Zoom />
            </div>
            <div className="p-2">
              <ZoomIn />
            </div>
            <div className="p-2 ml-auto">
              <Download />
            </div>
          </div>
        )
      }}
    </Toolbar>
  )

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [],
    renderToolbar
  })
  return (
    <div className=" z-0">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js">
        <div style={{ height: "100%" }}>
          <Viewer
            fileUrl="/VHT_IOT_PLATFORM30_1-1.pdf" 
            plugins={[defaultLayoutPluginInstance]}
            defaultScale={1}
          />
        </div>
      </Worker>
    </div>
  )
}

