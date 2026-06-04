
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { useGetCmsContent, useUpsertCmsContent } from '../hooks/useCms.js';
import { useTranslation } from 'react-i18next';

const ToolbarButton = ({ onClick, active, children }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer
            ${active
                ? 'bg-pink-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-pink-50 hover:text-pink-500'
            }`}
    >
        {children}
    </button>
);

function CmsEditor({ cmsKey, title }) {

    const { t } = useTranslation();
    const { data, isLoading } = useGetCmsContent(cmsKey);
    const { mutate, isPending } = useUpsertCmsContent();

    const editor = useEditor({
        extensions: [StarterKit, TextStyle, Color],
        content: data?.content,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'min-h-[300px] p-4 focus:outline-none text-sm text-slate-700 dark:text-slate-200 prose prose-sm max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-lg prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 prose-blockquote:border-l-4 prose-blockquote:border-pink-400 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-500',
            }
        }
    }, [data?.content]);

    const handleSave = (status) => {
        if (!editor) return;
        const content = editor.getHTML();
        if (!content || content === '<p></p>') {
            toast.error('Content cannot be empty');
            return;
        }
        mutate(
            { key: cmsKey, formData: { title, content, status } },
            {
                onSuccess: () => toast.success(status === 'published' ? 'Published successfully' : 'Saved as draft'),
                onError: () => toast.error('Failed to save content'),
            }
        );
    };

    if (isLoading) return (
        <div className='flex items-center justify-center min-h-75'>
            <p className='text-sm text-slate-400'>
                {t('cmsEditor.loading')}
            </p>
        </div>
    );

    return (
        <div className='bg-slate-50/50 p-4 md:p-8 min-h-screen text-left'>

            {/* header */}
            <div className='max-w-4xl mx-auto p-4 md:p-8 bg-linear-to-br from-pink-500 to-pink-600 rounded-t-xl md:rounded-t-3xl relative overflow-hidden'>
                <div className='absolute -top-10 -right-10 h-32 w-32 bg-white/10 rounded-full blur-2xl'></div>
                <div className='absolute -bottom-10 -left-10 h-24 w-24 bg-white/10 rounded-full blur-xl'></div>
                <div className='relative z-10 text-center md:text-start'>
                    <h1 className='text-xl md:text-2xl font-bold text-white mb-1'>
                        {title}
                    </h1>

                    <p className='text-pink-50 text-xs font-medium opacity-90'>
                        {t('cmsEditor.subtitle')}
                    </p>

                    {data?.status && (
                        <span className={`mt-2 inline-block px-3 py-0.5 rounded-full text-xs font-bold
                            ${data.status === 'published' ? 'bg-green-400/20 text-green-100' : 'bg-yellow-400/20 text-yellow-100'}`}>
                            {data.status === 'published' ? t('cmsEditor.statusPublished') : t('cmsEditor.statusDraft')}
                        </span>
                    )}
                </div>
            </div>

            {/* editor */}
            <div className='max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-b-xl md:rounded-b-3xl shadow-sm border border-pink-50 dark:border-slate-800'>

                {/* toolbar */}
                {editor && (
                    <div className='flex flex-wrap gap-1.5 p-3 border-b border-slate-100 dark:border-slate-800'>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>B</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>I</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}>S</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>H2</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>H3</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>• {t('cmsEditor.toolbarBulletList')}</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>{t('cmsEditor.toolbarOrderedList')}</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>{t('cmsEditor.toolbarBlockquote')}</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>{t('cmsEditor.toolbarUndo')}</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>{t('cmsEditor.toolbarRedo')}</ToolbarButton>

                        {/* text color */}
                        <div className='flex items-center gap-1 ml-1'>
                            <label className='text-[11px] text-slate-400 font-medium'>{t('cmsEditor.toolbarColor')}</label>
                            <input
                                type="color"
                                onInput={e => editor.chain().focus().setColor(e.target.value).run()}
                                value={editor.getAttributes('textStyle').color || '#000000'}
                                className='w-7 h-7 rounded cursor-pointer border border-slate-200'
                            />
                        </div>
                    </div>
                )}

                {/* editor content */}
                <div className='border-b border-slate-100 dark:border-slate-800'>
                    <EditorContent editor={editor} />
                </div>

                {/* actions */}
                <div className='flex flex-col sm:flex-row items-center justify-end gap-3 p-5 md:p-6'>
                    <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleSave('draft')}
                        className='w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-pink-500 hover:bg-pink-100 dark:hover:bg-slate-800 transition-all cursor-pointer active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'
                    >
                        {isPending ? t('cmsEditor.saving') : t('cmsEditor.saveDraft')}
                    </button>

                    <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleSave('published')}
                        className='w-full sm:w-auto md:px-10 py-2.5 rounded-xl text-sm font-bold text-white bg-linear-to-br from-pink-500 to-pink-600 shadow-lg shadow-pink-100 dark:shadow-none hover:shadow-pink-200 transition-all cursor-pointer active:scale-95 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none'
                    >
                        {isPending ? t('cmsEditor.publishing') : t('cmsEditor.publish')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CmsEditor;