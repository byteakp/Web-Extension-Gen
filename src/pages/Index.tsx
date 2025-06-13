import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { GeneratorForm } from "@/components/GeneratorForm";
import { CodeEditor } from "@/components/CodeEditor";
import { ExportSection } from "@/components/ExportSection";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ExtensionFiles {
  [key: string]: string;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  free: boolean;
}

const Index = () => {
  const [files, setFiles] = useState<ExtensionFiles>({});
  const [activeFile, setActiveFile] = useState<string>("manifest.json");
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const { toast } = useToast();

  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('https://extension-gen.onrender.com/api/models');
        if (response.ok) {
          const data = await response.json();
          setModels(data.models || []);
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
        toast({
          title: "Warning",
          description: "Could not load AI models. Using default options.",
          variant: "destructive",
        });
        // Set default models if API fails
        setModels([
          {
            id: "mistralai/devstral-small:free",
            name: "Devstral Small (Free)",
            description: "Specialized for software engineering tasks",
            free: true
          }
        ]);
      }
    };

    fetchModels();
  }, [toast]);

  const generateExtension = async (description: string, model: string, includePopup: boolean) => {
    setLoading(true);
    try {
      // Try the ZIP endpoint first
      const zipResponse = await fetch('https://extension-gen.onrender.com/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          model,
          includePopup,
        }),
      });

      if (zipResponse.ok && zipResponse.headers.get('content-type')?.includes('application/zip')) {
        // If we get a ZIP file, we'll need to extract it client-side
        // For now, fall back to individual file generation
        await generateIndividualFiles(description, model, includePopup);
      } else if (zipResponse.ok) {
        // If it's JSON response, handle it
        const data = await zipResponse.json();
        if (data.error) {
          throw new Error(data.message || 'Generation failed');
        }
        // Fall back to individual files
        await generateIndividualFiles(description, model, includePopup);
      } else {
        // If ZIP endpoint fails, use individual file generation
        await generateIndividualFiles(description, model, includePopup);
      }
      
      toast({
        title: "Extension Generated!",
        description: "Your Chrome extension has been successfully generated.",
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate extension. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateIndividualFiles = async (description: string, model: string, includePopup: boolean) => {
    const newFiles: ExtensionFiles = {};
    
    try {
      // Generate manifest with better error handling
      try {
        const manifestResponse = await fetch('https://extension-gen.onrender.com/api/generate/manifest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description, model }),
        });
        
        if (manifestResponse.ok) {
          const manifestData = await manifestResponse.json();
          if (manifestData.raw) {
            newFiles['manifest.json'] = manifestData.raw;
          } else if (manifestData.content) {
            newFiles['manifest.json'] = JSON.stringify(manifestData.content, null, 2);
          }
        }
      } catch (error) {
        console.error('Manifest generation failed:', error);
        // Create a basic manifest as fallback
        newFiles['manifest.json'] = JSON.stringify({
          "manifest_version": 3,
          "name": "Generated Extension",
          "version": "1.0.0",
          "description": description.slice(0, 132),
          "permissions": ["activeTab"],
          "content_scripts": [{
            "matches": ["<all_urls>"],
            "js": ["content.js"]
          }],
          "background": {
            "service_worker": "background.js"
          }
        }, null, 2);
      }

      // Generate content script
      try {
        const contentResponse = await fetch('https://extension-gen.onrender.com/api/generate/content-script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description, model }),
        });
        
        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          newFiles['content.js'] = contentData.content || '// Content script generated by AI\nconsole.log("Extension loaded");';
        }
      } catch (error) {
        console.error('Content script generation failed:', error);
        newFiles['content.js'] = '// Content script\nconsole.log("Extension content script loaded");';
      }

      // Generate background script
      try {
        const backgroundResponse = await fetch('https://extension-gen.onrender.com/api/generate/background-script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description, model }),
        });
        
        if (backgroundResponse.ok) {
          const backgroundData = await backgroundResponse.json();
          newFiles['background.js'] = backgroundData.content || '// Background script generated by AI\nconsole.log("Background script loaded");';
        }
      } catch (error) {
        console.error('Background script generation failed:', error);
        newFiles['background.js'] = '// Background script\nconsole.log("Extension background script loaded");';
      }

      // Add popup files if requested
      if (includePopup) {
        newFiles['popup.html'] = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      width: 300px;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .container {
      text-align: center;
    }
    button {
      background: #4285f4;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      margin: 5px;
    }
    button:hover {
      background: #3367d6;
    }
  </style>
</head>
<body>
  <div class="container">
    <h3>Extension Popup</h3>
    <p>Your extension is active!</p>
    <button id="actionBtn">Take Action</button>
  </div>
  <script src="popup.js"></script>
</body>
</html>`;

        newFiles['popup.js'] = `document.addEventListener('DOMContentLoaded', function() {
  const actionBtn = document.getElementById('actionBtn');
  
  actionBtn.addEventListener('click', function() {
    // Send message to content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'performAction'});
    });
  });
});`;

        // Update manifest to include popup
        if (newFiles['manifest.json']) {
          try {
            const manifest = JSON.parse(newFiles['manifest.json']);
            manifest.action = {
              "default_popup": "popup.html",
              "default_title": "Extension Popup"
            };
            newFiles['manifest.json'] = JSON.stringify(manifest, null, 2);
          } catch (error) {
            console.error('Failed to update manifest with popup:', error);
          }
        }
      }

      setFiles(newFiles);
      if (Object.keys(newFiles).length > 0) {
        setActiveFile(Object.keys(newFiles)[0]);
      }
    } catch (error) {
      console.error('Error generating individual files:', error);
      throw error;
    }
  };

  const updateFile = (filename: string, content: string) => {
    setFiles(prev => ({
      ...prev,
      [filename]: content
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-screen flex flex-col"
      >
        {/* Header */}
        <header className="bg-background/80 backdrop-blur-md border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Chrome Extension Generator
                </h1>
                <p className="text-xs text-muted-foreground">
                  Created by{" "}
                  <a 
                    href="https://github.com/byteakp" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    byteakp (AMN)
                  </a>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-8 w-8 p-0"
              >
                <a 
                  href="https://github.com/byteakp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="GitHub Profile"
                >
                  <Github className="h-4 w-4" />
                </a>
              </Button>
              <ThemeToggle />
              <ExportSection files={files} loading={loading} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <PanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - Generator Form */}
            <Panel defaultSize={30} minSize={25} maxSize={40}>
              <div className="h-full bg-background/70 backdrop-blur-sm border-r border-border">
                <GeneratorForm
                  onGenerate={generateExtension}
                  loading={loading}
                  models={models}
                />
              </div>
            </Panel>

            <PanelResizeHandle className="w-2 bg-border hover:bg-border/80 transition-colors" />

            {/* Center Panel - Code Editor */}
            <Panel defaultSize={70} minSize={60}>
              <div className="h-full bg-background/70 backdrop-blur-sm">
                <CodeEditor
                  files={files}
                  activeFile={activeFile}
                  onFileSelect={setActiveFile}
                  onFileUpdate={updateFile}
                  loading={loading}
                />
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
