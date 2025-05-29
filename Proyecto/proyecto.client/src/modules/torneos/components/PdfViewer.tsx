import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

const PdfViewer: React.FC = () => {
  const { fileUrl } = useParams<{ fileUrl?: string }>();
  const safeFileUrl = fileUrl ? decodeURIComponent(fileUrl) : "";
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      className="container py-5"
      style={{ background: "#f0fdf4", borderRadius: "12px" }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="text-center mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 style={{ fontSize: "2.2rem", color: "#0a4735", fontWeight: "bold" }}>
          📑 Documento en vista previa
        </h2>
        <hr style={{ width: "150px", margin: "0.5rem auto", borderColor: "#ffd166" }} />
      </motion.div>

      {safeFileUrl ? (
        <>
          {!isLoaded && (
            <div className="text-center my-4">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-3" style={{ color: "#0a4735", fontWeight: "bold" }}>
                Cargando el documento...
              </p>
            </div>
          )}

          <motion.div
            className="d-flex justify-content-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.6 }}
          >
            <iframe
              src={safeFileUrl}
              title="PDF Viewer"
              width="85%"
              height="650px"
              style={{
                border: "none",
                borderRadius: "10px",
                boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                background: "#fff",
                transition: "box-shadow 0.4s ease-in-out",
              }}
              onLoad={() => setIsLoaded(true)}
            />
          </motion.div>
        </>
      ) : (
        <motion.div
          className="alert alert-danger text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          ❌ No se pudo encontrar el documento.
        </motion.div>
      )}
    </motion.div>
  );
};

export default PdfViewer;
