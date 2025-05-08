import React from "react";
import { useParams } from "react-router-dom";

const PdfViewer: React.FC = () => {
  const { fileUrl } = useParams<{ fileUrl?: string }>();

  // Verificación y decodificación del enlace
  const safeFileUrl = fileUrl ? decodeURIComponent(fileUrl) : "";

  return (
    <div className="container my-5">
      <h2 className="text-center">📄 Vista Previa del Documento</h2>
      {safeFileUrl ? (
        <div className="d-flex justify-content-center">
          <iframe
            src={safeFileUrl}
            title="PDF Viewer"
            width="80%"
            height="600px"
            style={{ border: "1px solid #ccc", borderRadius: "8px" }}
          />
        </div>
      ) : (
        <div className="alert alert-danger text-center">
          ⚠️ Error: No se encontró el archivo para visualizar.
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
