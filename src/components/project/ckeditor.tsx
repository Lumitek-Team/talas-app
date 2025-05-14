/**
 * This configuration was generated using the CKEditor 5 Builder. You can modify it anytime using this link:
 * https://ckeditor.com/ckeditor-5/builder/#installation/NoJgNARCB0Cs0AYKQIwICwgBxYOy/VlkwVwS3QDYERYUBOAZjMdnvvXR3JQuQgCmAO2QIwwFGEljJ0gLqRKIdABNYlRhDlA=
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react';


const LICENSE_KEY =
    'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NzgwMjU1OTksImp0aSI6IjNjMDAzODQxLWVmYTgtNDhiYy05NjBiLWU3YTE3ZGQ5NTE5ZSIsImxpY2Vuc2VkSG9zdHMiOlsiMTI3LjAuMC4xIiwibG9jYWxob3N0IiwiMTkyLjE2OC4qLioiLCIxMC4qLiouKiIsIjE3Mi4qLiouKiIsIioudGVzdCIsIioubG9jYWxob3N0IiwiKi5sb2NhbCJdLCJ1c2FnZUVuZHBvaW50IjoiaHR0cHM6Ly9wcm94eS1ldmVudC5ja2VkaXRvci5jb20iLCJkaXN0cmlidXRpb25DaGFubmVsIjpbImNsb3VkIiwiZHJ1cGFsIl0sImxpY2Vuc2VUeXBlIjoiZGV2ZWxvcG1lbnQiLCJmZWF0dXJlcyI6WyJEUlVQIl0sInZjIjoiY2JiNmQ0OGYifQ.bDsSAIWCCRYzs3R26xXgygcPKnp4NTUutG2P7ulfcXjmzrtPsQ2SFSjocXBnBYbIxeKPcb-3h-onUzIM2yzbaQ';

type EditorProps = {
    value: string;
    onChange: (data: string) => void;
    placeholder?: string;
};

export default function RichEditor({ value, onChange, placeholder }: EditorProps) {
    const editorContainerRef = useRef(null);
    const editorRef = useRef(null);
    const [isLayoutReady, setIsLayoutReady] = useState(false);
    const cloud = useCKEditorCloud({ version: '45.0.0' });

    useEffect(() => {

        setIsLayoutReady(true);

        return () => {
            setIsLayoutReady(false); // Cleanup state
        };
    }, []);

    const { ClassicEditor, editorConfig } = useMemo(() => {
        if (cloud.status !== 'success' || !isLayoutReady) {
            return {};
        }

        const headingOptionsConst = [
            {
                model: 'heading1',
                view: 'h1',
                title: 'Heading 1',
                class: 'ck-heading_heading1',
            },
            {
                model: 'heading2',
                view: 'h2',
                title: 'Heading 2',
                class: 'ck-heading_heading2',
            },
            {
                model: 'heading3',
                view: 'h3',
                title: 'Heading 3',
                class: 'ck-heading_heading3',
            },
            {
                model: 'heading4',
                view: 'h4',
                title: 'Heading 4',
                class: 'ck-heading_heading4',
            },
            {
                model: 'heading5',
                view: 'h5',
                title: 'Heading 5',
                class: 'ck-heading_heading5',
            },
            {
                model: 'heading6',
                view: 'h6',
                title: 'Heading 6',
                class: 'ck-heading_heading6',
            },
            {
                model: 'paragraph',
                view: 'p',
                title: 'Paragraph',
                class: 'ck-heading_paragraph',
            },
        ] as const;

        // Convert ke mutable object
        const headingOptions = headingOptionsConst.map(option => ({ ...option }));

        const {
            ClassicEditor,
            Alignment,
            Autoformat,
            AutoImage,
            Autosave,
            BalloonToolbar,
            BlockQuote,
            Bold,
            Code,
            CodeBlock,
            Essentials,
            FindAndReplace,
            Heading,
            HorizontalLine,
            ImageBlock,
            ImageInsertViaUrl,
            ImageToolbar,
            Indent,
            IndentBlock,
            Italic,
            Link,
            LinkImage,
            List,
            ListProperties,
            MediaEmbed,
            Paragraph,
            PasteFromMarkdownExperimental,
            PasteFromOffice,
            SpecialCharacters,
            SpecialCharactersArrows,
            SpecialCharactersCurrency,
            SpecialCharactersEssentials,
            SpecialCharactersLatin,
            SpecialCharactersMathematical,
            SpecialCharactersText,
            Strikethrough,
            Subscript,
            Superscript,
            Table,
            TableCaption,
            TableCellProperties,
            TableColumnResize,
            TableProperties,
            TableToolbar,
            TextTransformation,
            Underline
        } = cloud.CKEditor;

        return {
            ClassicEditor,
            editorConfig: {
                toolbar: {
                    items: [
                        'findAndReplace',
                        '|',
                        'heading',
                        '|',
                        'bold',
                        'italic',
                        'underline',
                        'strikethrough',
                        'subscript',
                        'superscript',
                        'code',
                        '|',
                        'specialCharacters',
                        'horizontalLine',
                        'link',
                        'mediaEmbed',
                        'insertTable',
                        'insertTableLayout',
                        'blockQuote',
                        'codeBlock',
                        '|',
                        'alignment',
                        '|',
                        'bulletedList',
                        'numberedList',
                    ],
                    shouldNotGroupWhenFull: false
                },
                plugins: [
                    Alignment,
                    Autoformat,
                    AutoImage,
                    Autosave,
                    BalloonToolbar,
                    BlockQuote,
                    Bold,
                    Code,
                    CodeBlock,
                    Essentials,
                    FindAndReplace,
                    Heading,
                    HorizontalLine,
                    ImageBlock,
                    ImageInsertViaUrl,
                    ImageToolbar,
                    Indent,
                    IndentBlock,
                    Italic,
                    Link,
                    LinkImage,
                    List,
                    ListProperties,
                    MediaEmbed,
                    Paragraph,
                    PasteFromMarkdownExperimental,
                    PasteFromOffice,
                    SpecialCharacters,
                    SpecialCharactersArrows,
                    SpecialCharactersCurrency,
                    SpecialCharactersEssentials,
                    SpecialCharactersLatin,
                    SpecialCharactersMathematical,
                    SpecialCharactersText,
                    Strikethrough,
                    Subscript,
                    Superscript,
                    Table,
                    TableCaption,
                    TableCellProperties,
                    TableColumnResize,
                    TableProperties,
                    TableToolbar,
                    TextTransformation,
                    Underline
                ],
                balloonToolbar: ['bold', 'italic', '|', 'link', '|', 'bulletedList', 'numberedList'],
                fontFamily: {
                    supportAllValues: true
                },
                fontSize: {
                    options: [10, 12, 14, 'default', 18, 20, 22],
                    supportAllValues: true
                },
                heading: {
                    options: headingOptions
                },
                image: {
                    toolbar: [
                        'toggleImageCaption',
                        'imageTextAlternative',
                        '|',
                        'imageStyle:inline',
                        'imageStyle:wrapText',
                        'imageStyle:breakText',
                        '|',
                        'resizeImage'
                    ]
                },
                licenseKey: LICENSE_KEY,
                link: {
                    addTargetToExternalLinks: true,
                    defaultProtocol: 'https://',
                    decorators: {
                        toggleDownloadable: {
                            mode: 'manual' as const,
                            label: 'Downloadable',
                            attributes: { download: 'file' }
                        }
                    }
                },
                list: {
                    properties: {
                        styles: true,
                        startIndex: true,
                        reversed: true
                    }
                },
                menuBar: {
                    isVisible: true
                },
                placeholder: placeholder ?? 'Type or paste your content here!',
                table: {
                    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
                }
            }
        };
    }, [cloud, isLayoutReady, placeholder]);

    useEffect(() => {
        if (!isLayoutReady) {
            console.warn("Editor is not ready yet. Skipping initialization.");
        }
    }, [isLayoutReady]);

    return (
        <div className="main-container">
            <div className="editor-container editor-container_classic-editor" ref={editorContainerRef}>
                <div className="editor-container__editor">
                    <div ref={editorRef}>{ClassicEditor && editorConfig &&
                        <CKEditor editor={ClassicEditor} config={editorConfig} data={value}
                            onChange={(_, editor) => {
                                const data = editor.getData();
                                onChange(data);
                            }} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
