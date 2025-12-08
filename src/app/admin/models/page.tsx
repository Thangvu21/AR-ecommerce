'use client';

import { useState, useEffect } from 'react';
import { Upload, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Model3D {
    _id: string;
    name: string;
    type: 'glasses' | 'hat' | 'other';
    url: string;
    publicId: string;
    thumbnailUrl?: string;
    thumbnailPublicId?: string;
    createdAt: string;
}

export default function ModelsPage() {
    const [models, setModels] = useState<Model3D[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'glasses',
    });
    const [file, setFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        try {
            const res = await fetch('/api/models');
            const data = await res.json();
            if (data.success) {
                setModels(data.data);
            }
        } catch (error) {
            console.error('Error fetching models:', error);
            toast.error('Failed to load models');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setThumbnailFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !formData.name) {
            toast.error('Please fill in all fields');
            return;
        }

        setUploading(true);
        const data = new FormData();
        data.append('file', file);
        data.append('name', formData.name);
        data.append('type', formData.type);
        if (thumbnailFile) {
            data.append('thumbnail', thumbnailFile);
        }

        try {
            const res = await fetch('/api/models', {
                method: 'POST',
                body: data,
            });
            const result = await res.json();

            if (result.success) {
                toast.success('Model uploaded successfully');
                setFormData({ name: '', type: 'glasses' });
                setFile(null);
                setThumbnailFile(null);
                setThumbnailPreview(null);
                // Reset file inputs
                const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                const thumbnailInput = document.getElementById('thumbnail-upload') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
                if (thumbnailInput) thumbnailInput.value = '';
                fetchModels();
            } else {
                toast.error(result.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Error uploading:', error);
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">3D Model Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Upload Form */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4">Upload New Model</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Model Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., RayBan Aviator"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Type
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="glasses">Glasses</option>
                                    <option value="hat">Hat</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    3D File (.glb, .gltf, .obj)
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".glb,.gltf,.obj"
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Thumbnail (Optional)
                                </label>
                                <input
                                    id="thumbnail-upload"
                                    type="file"
                                    onChange={handleThumbnailChange}
                                    accept="image/*"
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                />
                                {thumbnailPreview && (
                                    <div className="mt-2">
                                        <img
                                            src={thumbnailPreview}
                                            alt="Thumbnail preview"
                                            className="w-32 h-32 object-cover rounded-md border border-gray-300"
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Model
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Model List */}
                <div className="md:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4">Existing Models</h2>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        ) : models.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No models found. Upload one to get started.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thumbnail</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {models.map((model) => (
                                            <tr key={model._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {model.thumbnailUrl ? (
                                                        <img
                                                            src={model.thumbnailUrl}
                                                            alt={model.name}
                                                            className="w-16 h-16 object-cover rounded-md"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                                                            <span className="text-xs text-gray-400">No thumb</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{model.name}</div>
                                                    <div className="text-xs text-gray-500 truncate max-w-[150px]">{model.url}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${model.type === 'glasses' ? 'bg-green-100 text-green-800' :
                                                            model.type === 'hat' ? 'bg-purple-100 text-purple-800' :
                                                                'bg-gray-100 text-gray-800'}`}>
                                                        {model.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(model.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <a href={model.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900 mr-4">
                                                        View
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
