'use client';

import { useState, useEffect } from 'react';
import { Upload, Loader2, Trash2, Edit, X } from 'lucide-react';
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

    // Edit modal states
    const [editingModel, setEditingModel] = useState<Model3D | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        type: 'glasses',
    });
    const [editFile, setEditFile] = useState<File | null>(null);
    const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
    const [editThumbnailPreview, setEditThumbnailPreview] = useState<string | null>(null);

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

    const handleEditClick = (model: Model3D) => {
        setEditingModel(model);
        setEditFormData({
            name: model.name,
            type: model.type,
        });
        setEditThumbnailPreview(model.thumbnailUrl || null);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingModel(null);
        setEditFormData({ name: '', type: 'glasses' });
        setEditFile(null);
        setEditThumbnailFile(null);
        setEditThumbnailPreview(null);
    };

    const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setEditFile(e.target.files[0]);
        }
    };

    const handleEditThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setEditThumbnailFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setEditThumbnailPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingModel) return;

        setUploading(true);
        const data = new FormData();
        data.append('name', editFormData.name);
        data.append('type', editFormData.type);
        if (editFile) {
            data.append('file', editFile);
        }
        if (editThumbnailFile) {
            data.append('thumbnail', editThumbnailFile);
        }

        try {
            const res = await fetch(`/api/models/${editingModel._id}`, {
                method: 'PATCH',
                body: data,
            });
            const result = await res.json();

            if (result.success) {
                toast.success('Model updated successfully');
                handleCloseEditModal();
                fetchModels();
            } else {
                toast.error(result.error || 'Update failed');
            }
        } catch (error) {
            console.error('Error updating:', error);
            toast.error('Update failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa model này?')) return;

        try {
            const res = await fetch(`/api/models/${id}`, {
                method: 'DELETE',
            });
            const result = await res.json();

            if (result.success) {
                toast.success('Model deleted successfully');
                fetchModels();
            } else {
                toast.error(result.error || 'Delete failed');
            }
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Delete failed');
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
                                                    <div className="flex gap-2">
                                                        <a href={model.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900">
                                                            View
                                                        </a>
                                                        <button
                                                            onClick={() => handleEditClick(model)}
                                                            className="text-yellow-600 hover:text-yellow-900 flex items-center gap-1"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(model._id)}
                                                            className="text-red-600 hover:text-red-900 flex items-center gap-1"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete
                                                        </button>
                                                    </div>
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

            {/* Edit Modal */}
            {showEditModal && editingModel && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">Edit Model</h2>
                                <button
                                    onClick={handleCloseEditModal}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Model Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editFormData.name}
                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type
                                    </label>
                                    <select
                                        value={editFormData.type}
                                        onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="glasses">Glasses</option>
                                        <option value="hat">Hat</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Model File
                                    </label>
                                    <div className="text-xs text-gray-500 mb-2 truncate">
                                        {editingModel.url}
                                    </div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Replace 3D File (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        onChange={handleEditFileChange}
                                        accept=".glb,.gltf,.obj"
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Thumbnail
                                    </label>
                                    {editThumbnailPreview ? (
                                        <img
                                            src={editThumbnailPreview}
                                            alt="Current thumbnail"
                                            className="w-32 h-32 object-cover rounded-md border border-gray-300 mb-2"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 bg-gray-200 rounded-md flex items-center justify-center mb-2">
                                            <span className="text-xs text-gray-400">No thumbnail</span>
                                        </div>
                                    )}
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Replace Thumbnail (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        onChange={handleEditThumbnailChange}
                                        accept="image/*"
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="flex-1 flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 mr-2" />
                                                Update Model
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseEditModal}
                                        className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
