/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyMCEEditor } from 'tinymce';
import { getColor } from 'helpers/utils';
import { IProps } from '@tinymce/tinymce-react/lib/cjs/main/ts/components/Editor';
import { useAppContext } from 'providers/AppProvider';

interface TinymceEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  options?: IProps['init'];
}

const TinymceEditor = ({
  value,
  onChange,
  options = { height: '50vh' }
}: TinymceEditorProps) => {
  const {
    config: { isDark }
  } = useAppContext();
  const editorRef = useRef<TinyMCEEditor | null>(null);

  const handleEditorFocus = () => {
    const editorContainer = editorRef.current?.editorContainer;
    editorContainer?.classList.add('editor-focused');
  };

  const handleEditorBlur = () => {
    const editorContainer = editorRef.current?.editorContainer;
    editorContainer?.classList.remove('editor-focused');
  };

  const handleEditorStyle = () => {
    if (editorRef.current) {
      editorRef.current.dom.addStyle(
        `.mce-content-body{
          color: ${getColor('emphasis-color')} !important;
          background-color: ${getColor('tinymce-bg')} !important;
        }
        `
      );
    }
  };

  useEffect(() => {
    handleEditorStyle();
  }, [isDark]);

  return (
    <Editor
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      apiKey={import.meta.env.VITE_TINYMCE_APIKEY}
      onFocus={handleEditorFocus}
      onBlur={handleEditorBlur}
      // @ts-ignore
      onInit={(evt, editor) => (editorRef.current = editor)}
      value={value}
      onEditorChange={onChange}
      init={{
        skin: 'oxide',
        license_key: 'gpl',
        menubar: false,
        content_style: `
        body { 
          color: ${getColor('emphasis-color')};
        }
        .mce-content-body{
          background-color: ${getColor('tinymce-bg')};
        }
        .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before {
          color: ${getColor('gray-400')};
          font-weight: 400;
          font-size: 12.8px;
        }
        `,
        statusbar: false,
        plugins: ['link', 'image', 'lists', 'table', 'media'],
        theme_advanced_toolbar_align: 'center',
        // directionality: getItemFromStore('phoenixIsRTL') ? 'rtl' : 'ltr',
        toolbar: [
          { name: 'history', items: ['undo', 'redo'] },
          {
            name: 'formatting',
            items: ['bold', 'italic', 'underline', 'strikethrough']
          },
          {
            name: 'alignment',
            items: ['alignleft', 'aligncenter', 'alignright', 'alignjustify']
          },
          { name: 'list', items: ['numlist', 'bullist'] },
          { name: 'link', items: ['link'] }
        ],
        ...options
      }}
    />
  );
};

export default TinymceEditor;
