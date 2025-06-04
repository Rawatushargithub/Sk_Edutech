import { useState, useEffect } from "react";
import { Search, Eye, X, ZoomIn, ZoomOut, Maximize, FileText, Filter, NotepadText, ExternalLink } from "lucide-react";
import API_BASE_URL from "../../config";

const Notes = ({ student }) => {
  const [materials, setMaterials] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const materialsPerPage = 12;

  const storedStudent = localStorage.getItem("student");
  const parsedStudent = storedStudent ? JSON.parse(storedStudent) : null;

  useEffect(() => {
    const courseCode = parsedStudent?.courseCode;
    if (!courseCode) return;
    console.log(courseCode);

    setLoading(true);
    fetch(`${API_BASE_URL}/api/notes/${courseCode}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        // Extract course materials from the API response
        const courseMaterials = data?.courses?.courseMaterials || [];
        setMaterials(courseMaterials);
        console.log(courseMaterials);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching course materials:", err);
        setLoading(false);
      });
  }, [student]);

  // Filter materials based on search input
  const filteredMaterials = materials.filter((material) =>
    material.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastMaterial = currentPage * materialsPerPage;
  const indexOfFirstMaterial = indexOfLastMaterial - materialsPerPage;
  const currentMaterials = filteredMaterials.slice(indexOfFirstMaterial, indexOfLastMaterial);
  
  const totalPages = Math.ceil(filteredMaterials.length / materialsPerPage);

  // Get file type display name
  const getFileTypeDisplay = (fileType, type) => {
    if (fileType === 'external-link' || type === 'link') return 'External Link';
    if (fileType === 'pdf') return 'PDF Document';
    if (fileType === 'video') return 'Video';
    if (fileType === 'document') return 'Document';
    return 'Material';
  };

  // Check if URL is viewable in iframe (Google Drive, PDF, etc.)
  const isViewableInIframe = (url) => {
    return url.includes('drive.google.com') || 
           url.includes('.pdf') || 
           url.includes('docs.google.com') ||
           url.includes('youtube.com') ||
           url.includes('youtu.be');
  };

  const getEmbedLink = (link) => {
    const match = link?.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    return match ? `https://drive.google.com/file/d/${match[1]}/preview` : link;
  };

  return (
    <div className="bg-gradient-to-br from-sky-50 to-white min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md border border-sky-100 mb-6 overflow-hidden">
          <div className="bg-sky-800 p-5 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center">
                <FileText size={24} className="mr-3" />
                <h2 className="text-2xl font-bold">Course Materials</h2>
                {(student?.course || parsedStudent?.courseCode) && (
                  <span className="ml-3 bg-sky-200 bg-opacity-30 text-blue-950 px-3 py-1 rounded-full text-sm font-medium">
                    {student?.course || parsedStudent?.courseCode}
                  </span>
                )}
              </div>
              
              {/* Search Bar */}
              <div className="mt-4 md:mt-0 relative">
                <div className="flex items-center bg-white bg-opacity-20 rounded-lg overflow-hidden">
                  <div className="absolute left-3 pointer-events-none">
                    <Search size={18} className="text-white" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 py-2 pl-10 pr-3 bg-transparent border border-sky-300 border-opacity-50 rounded-lg focus:ring-2 focus:ring-white focus:border-white placeholder-blue-200 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Filter Stats */}
          <div className="px-5 py-3 bg-sky-50 border-b border-sky-100 flex flex-wrap items-center justify-between">
            <div className="flex items-center text-sky-800">
              <Filter size={16} className="mr-2" />
              <span className="text-sm">
                Showing {filteredMaterials.length > 0 ? `${indexOfFirstMaterial + 1}-${Math.min(indexOfLastMaterial, filteredMaterials.length)} of ` : ""}{filteredMaterials.length} materials
              </span>
            </div>
            {searchTerm && (
              <div className="flex items-center mt-2 sm:mt-0">
                <span className="text-sm text-sky-600 mr-2">
                  Filter: "{searchTerm}"
                </span>
                <button 
                  onClick={() => setSearchTerm("")}
                  className="text-sky-600 hover:text-sky-800 p-1 rounded-full hover:bg-sky-100"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
          </div>
        )}

        {/* No Materials State */}
        {!loading && filteredMaterials.length === 0 && (
          <div className="bg-white rounded-xl shadow-md border border-sky-100 p-8 text-center">
            <div className="bg-sky-50 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
              <FileText size={24} className="text-sky-400" />
            </div>
            <h3 className="mt-4 text-xl font-medium text-sky-800">No materials found</h3>
            <p className="mt-2 text-sky-600">
              {searchTerm
                ? "Try adjusting your search query."
                : "No course materials available yet."}
            </p>
          </div>
        )}

        {/* Materials Grid */}
        {!loading && filteredMaterials.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentMaterials.map((material) => (
                <div
                  key={material._id}
                  className="bg-white rounded-xl shadow-md border border-sky-100 overflow-hidden transition-all hover:shadow-lg hover:translate-y-[-2px] flex flex-col"
                >
                  <div className="p-5 flex-grow">
                    <h3 className="text-xl font-semibold text-blue-950 mb-3 line-clamp-2 flex items-center gap-2">
                      <NotepadText size={20} />
                      {material.title}
                    </h3>
                    
                    <div className="mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                        {getFileTypeDisplay(material.fileType, material.type)}
                      </span>
                    </div>

                    {material.url && (
                      <div className="text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <ExternalLink size={14} className="mr-1" />
                          <span className="truncate">Resource Link Available</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {material.url && (
                    <div className="px-5 pb-4 space-y-2">
                      {isViewableInIframe(material.url) ? (
                        <button
                          onClick={() => setSelectedMaterial(material)}
                          className="w-full text-white bg-sky-800 hover:bg-sky-600 px-4 py-2 rounded-lg transition-colors flex items-center justify-center shadow-sm"
                        >
                          <Eye size={18} className="mr-2" />
                          Preview Material
                        </button>
                      ) : (
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full text-white bg-sky-800 hover:bg-sky-600 px-4 py-2 rounded-lg transition-colors flex items-center justify-center shadow-sm"
                        >
                          <ExternalLink size={18} className="mr-2" />
                          Open Material
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="inline-flex rounded-lg shadow-sm">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-l-lg border ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                        : "bg-white text-sky-600 hover:bg-sky-50 border-sky-200"
                    }`}
                  >
                    Previous
                  </button>
                  <div className="px-4 py-2 bg-sky-500 text-white border-t border-b border-sky-500">
                    {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-r-lg border ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                        : "bg-white text-sky-600 hover:bg-sky-50 border-sky-200"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal for Viewing Materials */}
      {selectedMaterial && (
        <div className="fixed inset-0 flex items-center justify-center bg-sky-900 bg-opacity-75 z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full flex flex-col h-[600px] border border-sky-200">
            <div className="flex justify-between items-center p-4 border-b border-sky-100">
              <h2 className="text-xl font-bold text-sky-800 line-clamp-1">{selectedMaterial.title}</h2>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="text-sky-500 hover:text-sky-700 hover:bg-sky-50 rounded-full p-1 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Zoom & Full-Screen Controls */}
            <div className="flex justify-between items-center p-3 bg-sky-50 border-b border-sky-100">
              <div className="flex items-center">
                <button
                  onClick={() => setZoom((prev) => Math.min(prev + 0.2, 2))}
                  className="p-2 bg-white hover:bg-sky-100 text-sky-600 rounded-l-lg flex items-center border border-sky-200"
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  onClick={() => setZoom((prev) => Math.max(prev - 0.2, 0.5))}
                  className="p-2 bg-white hover:bg-sky-100 text-sky-600 rounded-r-lg flex items-center border-t border-r border-b border-sky-200"
                >
                  <ZoomOut size={18} />
                </button>
                <span className="ml-3 text-sm text-sky-700">
                  Zoom: {Math.round(zoom * 100)}%
                </span>
              </div>
              <div className="flex gap-2">
                
                <button
                  onClick={() => {
                    const iframe = document.getElementById("materialPreview");
                    if (iframe.requestFullscreen) {
                      iframe.requestFullscreen();
                    } else if (iframe.mozRequestFullScreen) {
                      iframe.mozRequestFullScreen();
                    } else if (iframe.webkitRequestFullscreen) {
                      iframe.webkitRequestFullscreen();
                    } else if (iframe.msRequestFullscreen) {
                      iframe.msRequestFullscreen();
                    }
                  }}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg flex items-center shadow-sm transition-colors"
                >
                  <Maximize size={18} className="mr-2" />
                  Full Screen
                </button>
              </div>
            </div>

            {/* Material Preview */}
            <div className="flex-grow overflow-hidden bg-gray-100">
              <iframe
                id="materialPreview"
                src={getEmbedLink(selectedMaterial.url)}
                style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                    width: `${100 / zoom}%`,
                    height: `${100 / zoom}%`,
                  }}className="border-0"
                title={selectedMaterial.title}
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;