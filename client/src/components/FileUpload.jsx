import { useRef } from "react";
import { Upload, FileText, Image } from "lucide-react";

const FileUpload = ({
  file,
  onFileChange,
  dragActive,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  loading,
}) => {
  const fileInputRef = useRef(null);

  return (
    <div
      className={`w-full p-8 rounded-xl transition-colors border-2 ${
        dragActive
          ? "border-pink-500 bg-gray-700"
          : "border-dashed border-gray-500 bg-gray-800"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="text-purple-500">
          <Upload size={40} />
        </div>
        <div className="text-center">
          <h3 className="text-base font-semibold text-gray-100">
            Drop your PDF, JPG, or PNG file here
          </h3>
          <p className="text-xs text-gray-400">or click to browse</p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={onFileChange}
          className="hidden"
        />
        <button
          type="button"
          className="px-6 py-2 rounded-lg text-white text-sm font-medium bg-gradient-to-tr from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition"
          onClick={() => fileInputRef.current.click()}
        >
          Browse
        </button>
       
      </div>

      {file && (
        <div className="mt-3 p-3 border rounded-md bg-gray-700">
          <div className="flex items-center space-x-3">
            <div className="text-gray-200">
              {file.type.startsWith("image/") ? (
                <Image size={20} />
              ) : (
                <FileText size={20} />
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-100">
                {file.name}
              </h4>
              <p className="text-xs text-gray-400">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
