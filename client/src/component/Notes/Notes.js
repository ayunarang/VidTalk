
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Editor, EditorState, RichUtils, ContentState } from 'draft-js';
import { X } from 'lucide-react';
import 'draft-js/dist/Draft.css';
import styles from "./index.module.css";
import { useNotes } from '../../context/notes';
import { stateToHTML } from 'draft-js-export-html';
import { debounce } from 'lodash';

const customStyleMap = {
    RED: { color: 'rgba(255, 140, 135, 0.6)' },
    PURPLE: { color: 'rgba(174, 181, 255, 0.6)' },
    GREEN: { color: 'rgba(179, 229, 103, 0.6)' },
    YELLOW_BG: { backgroundColor: 'rgba(255, 220, 116, 0.6)' },
    PINK_BG: { backgroundColor: 'rgba(243, 166, 200, 0.6)' },
    BLUE_BG: { backgroundColor: 'rgba(149, 201, 243, 0.6)' }
};

const blockRenderMap = {
    'header-one': { element: 'h1', attributes: { className: 'text-4xl font-bold' } },
    'header-two': { element: 'h2', attributes: { className: 'text-3xl font-semibold' } },
    'header-three': { element: 'h3', attributes: { className: 'text-2xl font-medium' } },
    'unordered-list-item': { element: 'li', wrapper: 'ul', attributes: { className: 'list-disc ml-4' } },
    'ordered-list-item': { element: 'li', wrapper: 'ol', attributes: { className: 'list-decimal ml-4' } },
    'unstyled': { element: 'p' }
};

const exportOptions = {
    inlineStyles: {
        RED: { style: { color: 'rgba(255, 140, 135, 0.6)' } },
        PURPLE: { style: { color: 'rgba(174, 181, 255, 0.6)' } },
        GREEN: { style: { color: 'rgba(179, 229, 103, 0.6)' } },
        YELLOW_BG: { style: { backgroundColor: 'rgba(255, 220, 116, 0.6)' } },
        PINK_BG: { style: { backgroundColor: 'rgba(243, 166, 200, 0.6)' } },
        BLUE_BG: { style: { backgroundColor: 'rgba(149, 201, 243, 0.6)' } }
    },
    blockStyleFn: (block) => {
        const blockType = block.getType();
        const blockDef = blockRenderMap[blockType];
        if (blockDef) {
            return {
                element: blockDef.element,
                attributes: blockDef.attributes,
                wrapper: blockDef.wrapper
            };
        }
        return {};
    }
};

const Notes = ({ isNotesVisible, setisNotesVisible }) => {
    const defaultContentState = ContentState.createFromText('');
    const [editorState, setEditorState] = useState(() => EditorState.createWithContent(defaultContentState));
    const editorRef = useRef(null);
    const { UpdateNote } = useNotes();
    const [lastHtmlContent, setLastHtmlContent] = useState('');
    const [NotesInfo, setNotesInfo] = useState(true);

    const currentHtmlContent = useMemo(() => {
        return stateToHTML(editorState.getCurrentContent(), exportOptions);
    }, [editorState]);

    const handleKeyCommand = (command) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            setEditorState(newState);
            return 'handled';
        }
        return 'not-handled';
    };

    const getBlockStyle = (block) => {
        const blockType = block.getType();
        return blockRenderMap[blockType]?.attributes?.className || 'text-xl';
    };

    const applyBlockType = (type) => {
        const newEditorState = RichUtils.toggleBlockType(editorState, type);
        setEditorState(newEditorState);
    };

    const applyInlineStyle = (style) => {
        const selectionState = editorState.getSelection();
        const contentState = editorState.getCurrentContent();
        const startKey = selectionState.getStartKey();
        const endKey = selectionState.getEndKey();
        const startOffset = selectionState.getStartOffset();
        const endOffset = selectionState.getEndOffset();

        if (startKey === endKey) {
            const blockText = contentState.getBlockForKey(startKey).getText();
            const selectedText = blockText.slice(startOffset, endOffset).trim();
            if (selectedText.length > 0) {
                const newEditorState = RichUtils.toggleInlineStyle(editorState, style);
                setEditorState(newEditorState);
            }
        } else {
            const newEditorState = RichUtils.toggleInlineStyle(editorState, style);
            setEditorState(newEditorState);
        }
    };

    const debouncedUpdateNote = useCallback(debounce((htmlContent) => {
        UpdateNote(htmlContent);
        // console.log("Note updated", htmlContent);
    }, 800), []);

    const handleBlur = () => {
        if (currentHtmlContent !== lastHtmlContent) {
            debouncedUpdateNote(currentHtmlContent);
            setLastHtmlContent(currentHtmlContent);
        }
    };

    useEffect(() => {
        if (isNotesVisible) {
            if (editorRef.current) {
                editorRef.current.scrollIntoView({ behavior: 'smooth' });
                editorRef.current.focus();
            }
        }
    }, [isNotesVisible, editorState]);

    return (
        <div className='fixed z-50 top-[5rem] left-5 max-w-sm h-[500px] md:max-w-[700px] md:h-[650px] shadow-lg bg-[#202531] pl-4 py-1 border border-[#3a3a3a] rounded-lg overflow-hidden break-words text-wrap flex flex-row'>
            <div className="toolbar rounded-lg flex my-2 flex-col max-w-fit border-black bg-[#D3D3D3] md:py-2 md:px-2 p-1 justify-center align-middle gap-1">
                <button className={styles.toolBarButtons} style={{ fontSize: '1.5rem' }} onClick={() => applyBlockType('header-one')}>H1</button>
                <button className={styles.toolBarButtons} style={{ fontSize: '1.2rem' }} onClick={() => applyBlockType('header-two')}>H2</button>
                <button className={styles.toolBarButtons} style={{ fontSize: '0.85rem' }} onClick={() => applyBlockType('header-three')}>H3</button>
                <button className={styles.toolBarButtons} style={{ fontWeight: 'bold' }} onClick={() => applyInlineStyle('BOLD')}>B</button>
                <button className={styles.toolBarButtons} style={{ border: 'none', fontStyle: 'italic' }} onClick={() => applyInlineStyle('ITALIC')}>Italic</button>
                <button className={styles.toolBarButtons} onClick={() => applyBlockType('unordered-list-item')}>•</button>
                <button className={styles.toolBarButtons} onClick={() => applyBlockType('ordered-list-item')}>1.</button>
                <button className={styles.toolBarButtons} onClick={() => applyInlineStyle('RED')} style={{ color: '#FF8C87' }}>A</button>
                <button className={styles.toolBarButtons} onClick={() => applyInlineStyle('PURPLE')} style={{ color: '#AEB5FF' }}>A</button>
                <button className={styles.toolBarButtons} onClick={() => applyInlineStyle('GREEN')} style={{ color: '#B3E567' }}>A</button>
                <button className={styles.toolBarButtons} onClick={() => applyInlineStyle('YELLOW_BG')} style={{ backgroundColor: '#FFDC74' }}>H</button>
                <button className={styles.toolBarButtons} onClick={() => applyInlineStyle('PINK_BG')} style={{ backgroundColor: '#F3A6C8' }}>H</button>
                <button className={styles.toolBarButtons} onClick={() => applyInlineStyle('BLUE_BG')} style={{ backgroundColor: '#95C9F3' }}>H</button>
            </div>
            <div className='md:w-[90%] w-[85%] px-4 py-2'>
                <div className='flex flex-row justify-between w-full mt-2'>
                    <h2 className="text-lg font-semibold text-white">Meeting Notes</h2>
                    <X 
                    className='md:h-8 md:w-8 font-bold'
                    onClick={() => { setisNotesVisible(false); }} style={{ backgroundColor: '#D60010', padding: '0.3rem', borderRadius: '5px', cursor: 'pointer' }} />
                </div>
                {(NotesInfo) ?
                    <div className='flex flex-row gap-2 w-full bg-[#1f2228] mb-2 mt-2 py-2 px-4 items-start '>
                        <p className='text-[11px] md:text-base text-gray-100'>Notes will automatically be saved if you close the notes or exit the meeting :)</p>
                        <X
                            onClick={() => { setNotesInfo(false) }}
                            className='border-0 outline-none text-gray-100 h-5 w-5'></X>
                    </div>
                    : ''}

                <div className={styles.notes} ref={editorRef}>
                    <Editor
                        editorState={editorState}
                        onChange={setEditorState}
                        handleKeyCommand={handleKeyCommand}
                        blockStyleFn={getBlockStyle}
                        customStyleMap={customStyleMap}
                        onBlur={handleBlur} // Use onBlur to save note
                    />
                </div>
            </div>
        </div>
    );
};

export default Notes;
