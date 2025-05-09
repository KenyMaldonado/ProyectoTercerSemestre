import React, { useState } from "react";
import { Form } from "react-bootstrap";

interface ImagenUploaderProps {
    label?: string;
    onBase64Change: (base64: string) => void;
    }

    const ImagenUploader: React.FC<ImagenUploaderProps> = ({
    label = "Selecciona una imagen",
    onBase64Change,
    }) => {
    const [preview, setPreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setPreview(base64);
            onBase64Change(base64);
        };
        reader.readAsDataURL(file);
        }
    };

    return (
        <Form.Group className="mb-3">
        <Form.Label>{label}</Form.Label>
        <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
        {preview && (
            <div className="mt-2">
            <img src={preview} alt="Vista previa" style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }} />
            </div>
        )}
        </Form.Group>
    );
};

export default ImagenUploader;
