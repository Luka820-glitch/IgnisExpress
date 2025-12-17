import React, { useState } from "react";

const UploadImage: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "rf6cxjxc");

    setUploading(true);

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dpndhq1l9/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Upload failed:", errorData);
        throw new Error(errorData?.message || "Unknown upload error");
      }

      const data = await res.json();
      setImageUrl(data.secure_url);
      console.log("Uploaded:", data);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      {uploading && <p>Uploading...</p>}
      {imageUrl && (
        <div>
          <p>Uploaded Image:</p>
          <img src={imageUrl} alt="Uploaded" width={200} />
        </div>
      )}
    </div>
  );
};

export default UploadImage;
