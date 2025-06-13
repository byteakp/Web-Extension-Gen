
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Smartphone, Monitor, RefreshCw, ExternalLink } from "lucide-react";
import type { ExtensionFiles } from "@/pages/Index";

interface PreviewPanelProps {
  files: ExtensionFiles;
  activeFile: string;
  onTogglePreview: () => void;
}

export const PreviewPanel = ({ files, activeFile, onTogglePreview }: PreviewPanelProps) => {
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('desktop');
  const [previewContent, setPreviewContent] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    updatePreviewContent();
  }, [files, activeFile]);

  const updatePreviewContent = () => {
    if (files['popup.html']) {
      let htmlContent = files['popup.html'];
      
      // Inject the popup.js content into the HTML if it exists
      if (files['popup.js']) {
        const jsContent = files['popup.js']
          .replace(/chrome\.tabs\.query.*?\n.*?\n.*?\}\);/gs, `
            // Simulated for preview - actual Chrome API not available
            console.log('Chrome extension action triggered');
            alert('Extension action would be performed here!');
          `);
        
        htmlContent = htmlContent.replace(
          /<script src=["|']popup\.js["|']><\/script>/,
          `<script>
            // Disable actual Chrome API calls for preview
            if (typeof chrome === 'undefined') {
              window.chrome = {
                tabs: {
                  query: function(query, callback) {
                    callback([{id: 1}]);
                  },
                  sendMessage: function(tabId, message) {
                    console.log('Message sent:', message);
                  }
                }
              };
            }
            ${jsContent}
          </script>`
        );
      }
      
      setPreviewContent(htmlContent);
    } else if (activeFile.endsWith('.html') && files[activeFile]) {
      setPreviewContent(files[activeFile]);
    } else {
      setPreviewContent(getCodePreview());
    }
  };

  const getCodePreview = () => {
    if (files[activeFile]) {
      const fileExtension = activeFile.split('.').pop()?.toLowerCase();
      const language = fileExtension === 'js' ? 'javascript' : fileExtension === 'json' ? 'json' : 'text';
      
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                background: #1e1e1e;
                color: #d4d4d4;
                margin: 0;
                padding: 20px;
                font-size: 13px;
                line-height: 1.5;
              }
              .header {
                background: #252526;
                padding: 12px 16px;
                border-radius: 6px;
                margin-bottom: 16px;
                border-left: 4px solid #007acc;
              }
              .filename {
                color: #569cd6;
                font-weight: 600;
                margin-bottom: 4px;
                font-size: 14px;
              }
              .language {
                color: #608b4e;
                font-size: 11px;
                text-transform: uppercase;
              }
              pre {
                background: #2d2d30;
                padding: 16px;
                border-radius: 8px;
                border: 1px solid #3e3e42;
                overflow-x: auto;
                white-space: pre-wrap;
                word-wrap: break-word;
                margin: 0;
              }
              .code {
                color: #d4d4d4;
              }
              .string { color: #ce9178; }
              .number { color: #b5cea8; }
              .keyword { color: #569cd6; }
              .comment { color: #6a9955; font-style: italic; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="filename">${activeFile}</div>
              <div class="language">${language}</div>
            </div>
            <pre class="code">${files[activeFile].replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          </body>
        </html>
      `;
    }
    
    return `
      <!DOCTYPE html>
      <html>
        <body style="display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #64748b; text-align: center; background: #f8fafc;">
          <div>
            <div style="width: 64px; height: 64px; margin: 0 auto 16px; background: #e2e8f0; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #334155;">No Preview Available</h3>
            <p style="margin: 0; font-size: 14px; color: #64748b;">Generate an extension to see the preview</p>
          </div>
        </body>
      </html>
    `;
  };

  const refreshPreview = () => {
    updatePreviewContent();
    if (iframeRef.current) {
      // Force reload the iframe
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = 'about:blank';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 10);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-sm border-b border-border p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <h3 className="font-medium text-foreground">Live Preview</h3>
            {files['popup.html'] && (
              <Badge variant="secondary" className="text-xs">Extension Popup</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePreview}
            className="p-1 h-auto"
          >
            <EyeOff className="w-4 h-4" />
          </Button>
        </div>

        {/* Preview Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant={previewMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('desktop')}
              className="h-7 px-2"
            >
              <Monitor className="w-3 h-3 mr-1" />
              Desktop
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('mobile')}
              className="h-7 px-2"
            >
              <Smartphone className="w-3 h-3 mr-1" />
              Mobile
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshPreview}
            className="h-7 px-2"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-3">
        <motion.div
          key={previewMode}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className={`h-full ${
            previewMode === 'mobile' 
              ? 'max-w-sm mx-auto' 
              : 'w-full'
          }`}
        >
          <Card className="h-full bg-card shadow-lg overflow-hidden border-border">
            <CardHeader className="py-2 px-3 bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-xs text-muted-foreground">Extension Preview</span>
                </div>
                <div className="flex items-center gap-1">
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-full">
              <iframe
                ref={iframeRef}
                srcDoc={previewContent}
                className="w-full h-full border-0 bg-background"
                sandbox="allow-scripts allow-same-origin allow-modals"
                title="Extension Preview"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Instructions */}
      {files['popup.html'] && (
        <div className="p-3 border-t border-border">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3">
              <h4 className="text-sm font-medium text-primary mb-2">
                Extension Preview
              </h4>
              <p className="text-xs text-muted-foreground">
                This shows how your extension's popup will look when users click the extension icon in Chrome.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
