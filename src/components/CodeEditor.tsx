
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { File, Folder, Code, Download, Plus, X } from "lucide-react";
import type { ExtensionFiles } from "@/pages/Index";

interface CodeEditorProps {
  files: ExtensionFiles;
  activeFile: string;
  onFileSelect: (filename: string) => void;
  onFileUpdate: (filename: string, content: string) => void;
  loading: boolean;
}

export const CodeEditor = ({ files, activeFile, onFileSelect, onFileUpdate, loading }: CodeEditorProps) => {
  const [editorValue, setEditorValue] = useState("");
  const [openTabs, setOpenTabs] = useState<string[]>([]);

  useEffect(() => {
    if (files[activeFile]) {
      setEditorValue(files[activeFile]);
    }
  }, [files, activeFile]);

  useEffect(() => {
    const fileNames = Object.keys(files);
    if (fileNames.length > 0) {
      setOpenTabs(fileNames);
      if (!activeFile || !files[activeFile]) {
        onFileSelect(fileNames[0]);
      }
    }
  }, [files]);

  const getLanguage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return 'javascript';
      case 'json': return 'json';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'md': return 'markdown';
      default: return 'javascript';
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return <Code className="w-4 h-4 text-yellow-500" />;
      case 'json': return <File className="w-4 h-4 text-blue-500" />;
      case 'html': return <File className="w-4 h-4 text-orange-500" />;
      case 'css': return <File className="w-4 h-4 text-purple-500" />;
      default: return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorValue(value);
      onFileUpdate(activeFile, value);
    }
  };

  const closeTab = (filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTabs = openTabs.filter(tab => tab !== filename);
    setOpenTabs(newTabs);
    
    if (activeFile === filename && newTabs.length > 0) {
      onFileSelect(newTabs[0]);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
              Generating Extension
            </h3>
            <p className="text-sm text-muted-foreground">
              AI is crafting your Chrome extension...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (Object.keys(files).length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 max-w-md mx-auto p-8"
        >
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
            <Folder className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No Extension Generated Yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Fill out the form on the left to generate your Chrome extension files. 
              Once generated, you'll be able to edit them here.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* File Tabs */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Extension Files
            </span>
            <Badge variant="secondary" className="text-xs">
              {Object.keys(files).length}
            </Badge>
          </div>
        </div>
        
        <div className="flex overflow-x-auto">
          {openTabs.map((filename) => (
            <motion.button
              key={filename}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-2 px-3 py-2 text-sm border-r border-slate-200 dark:border-slate-700 transition-colors min-w-0 ${
                activeFile === filename
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
              }`}
              onClick={() => onFileSelect(filename)}
            >
              {getFileIcon(filename)}
              <span className="truncate">{filename}</span>
              {openTabs.length > 1 && (
                <button
                  onClick={(e) => closeTab(filename, e)}
                  className="ml-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFile}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <Editor
              height="100%"
              language={getLanguage(activeFile)}
              value={editorValue}
              onChange={handleEditorChange}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Fira Code', 'Monaco', 'Cascadia Code', monospace",
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: 'on',
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-3 py-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{getLanguage(activeFile)}</span>
            <span>{editorValue.split('\n').length} lines</span>
          </div>
          <div className="flex items-center gap-2">
            <span>UTF-8</span>
            <span>LF</span>
          </div>
        </div>
      </div>
    </div>
  );
};
