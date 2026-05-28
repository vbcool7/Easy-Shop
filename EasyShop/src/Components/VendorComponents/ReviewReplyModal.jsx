
import React, { useState } from 'react';
import { useEffect } from 'react';

function ReviewReplyModal({ isOpen, onClose, review, onSubmit, isSubmitting }) {

    const [text, setText] = useState();

    useEffect(() => {
        if (isOpen && review) {
            setText(review.vendorReply || "");
        } else if (!isOpen) {
            setText("");
        }
    }, [review, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-150 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-950 w-full max-w-md rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-md font-bold text-slate-800 dark:text-white mb-1">
                    Reply to {review?.userId?.name || 'Customer'}
                </h3>
                <p className="text-xs text-slate-400 italic mb-4">
                    "{review?.review || review?.comment}"
                </p>

                <textarea
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your official vendor response..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-pink-500/20 transition-all resize-none"
                />

                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => onSubmit(text)}
                        disabled={isSubmitting || !text.trim()}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-pink-500 text-white hover:bg-pink-600 transition-all disabled:opacity-40 cursor-pointer"
                    >
                        {isSubmitting ? "Saving..." : "Submit Reply"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ReviewReplyModal;