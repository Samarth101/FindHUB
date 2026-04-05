import { useState, useRef } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { RADIUS } from '../../utils/constants';
import api from '../../api/http';
import toast from 'react-hot-toast';

export default function ImageUpload({ images = [], onChange, max = 3 }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = max - images.length;
    if (remaining <= 0) return toast.error(`Max ${max} images allowed`);
    const batch = files.slice(0, remaining);

    const formData = new FormData();
    batch.forEach(f => formData.append('images', f));

    setUploading(true);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const urls = res.data.urls || [];
      onChange([...images, ...urls]);
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeImage = (idx) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div>
      {/* Preview thumbnails */}
      {images.length > 0 && (
        <div className="flex gap-3 flex-wrap mb-3">
          {images.map((url, i) => (
            <div key={i} className="relative group">
              <img
                src={`http://localhost:5000${url}`}
                alt={`Upload ${i + 1}`}
                className="w-24 h-24 object-cover border-2 border-[#2d2d2d]"
                style={{ borderRadius: RADIUS.wobblySm }}
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-[#ff4d4d] text-white border-2 border-[#2d2d2d] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {images.length < max && (
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${uploading ? 'border-[#2d5da1] bg-blue-50' : 'border-gray-300 hover:border-[#2d2d2d]'}`}
          style={{ borderRadius: RADIUS.wobblySm }}
        >
          {uploading ? (
            <>
              <Loader2 size={40} className="mx-auto text-[#2d5da1] animate-spin mb-2" />
              <p className="font-body text-base text-[#2d5da1]">Uploading...</p>
            </>
          ) : (
            <>
              <ImagePlus size={40} strokeWidth={2} className="mx-auto text-gray-300 mb-2" />
              <p className="font-body text-base text-gray-500">Click to upload images</p>
              <p className="font-body text-sm text-gray-400">Max {max} images, 5MB each · JPEG, PNG, WebP</p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
    </div>
  );
}
