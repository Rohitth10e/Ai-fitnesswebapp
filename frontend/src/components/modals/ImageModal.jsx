import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Camera } from 'lucide-react';

export default function ImageModal({ data, isLoading, onClose, theme }) {
    if (!data && !isLoading) return null;

    const title = data?.name || 'Image';
    const type = data?.type || 'Image';

    return (
        <AnimatePresence>
            <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                onClick={onClose} 
            >
                <motion.div
                    key="modal"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className={`relative w-full max-w-2xl rounded-lg shadow-xl overflow-hidden ${
                        theme === 'dark' ? 'bg-gray-900 border border-gray-700' : 'bg-white'
                    }`}
                    onClick={(e) => e.stopPropagation()} 
                >
                    <div className={`flex items-center justify-between p-4 border-b ${
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                        <div>
                            <h3 className="text-lg font-semibold">{title}</h3>
                            <p className={`text-sm capitalize ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {type} Visualization
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-full transition-colors ${
                                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            }`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-4 min-h-[300px] flex items-center justify-center">
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                    Finding image...
                                </p>
                            </div>
                        ) : data?.imageUrl ? (
                            <div className="w-full">
                                <img
                                    src={data.imageUrl}
                                    alt={data.altText || `Image of ${title}`}
                                    className="w-full h-auto max-h-[60vh] object-contain rounded-md"
                                />
                                <p className={`text-xs text-center mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                    Photo by <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">{data.sourceName}</a> on <a href="https://pexels.com" target="_blank" rel="noopener noreferrer" className="underline">Pexels</a>
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Camera className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                    No image found.
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}