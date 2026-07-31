import { useState } from "react";

const CloudinaryUpload = ({ onUpload, accept = "image/*" }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("upload_preset", $import.meta.env.VITE_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${$import.meta.env.VITE_CLOUD_NAME}/auto/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Upload failed");
      }

      onUpload({
        url: data.secure_url,
        publicId: data.public_id,
        resourceType: data.resource_type,
        format: data.format,
      });
    } catch (error) {
      console.error(error);
      alert("حصل خطأ أثناء رفع الملف");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept={accept}
        onChange={handleUpload}
        disabled={uploading}
      />

      {uploading && <p>جاري رفع الملف...</p>}
    </div>
  );
};

export default CloudinaryUpload;
