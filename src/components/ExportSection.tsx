
import { useState } from "react";
import { motion } from "framer-motion";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Package, Chrome, FileText, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ExtensionFiles } from "@/pages/Index";

interface ExportSectionProps {
  files: ExtensionFiles;
  loading: boolean;
}

export const ExportSection = ({ files, loading }: ExportSectionProps) => {
  const [exporting, setExporting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const { toast } = useToast();

  const exportAsZip = async () => {
    if (Object.keys(files).length === 0) {
      toast({
        title: "No Files to Export",
        description: "Generate an extension first before exporting.",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    try {
      const zip = new JSZip();
      
      // Add all files to the zip
      Object.entries(files).forEach(([filename, content]) => {
        zip.file(filename, content);
      });

      // Generate ZIP file
      const blob = await zip.generateAsync({ type: "blob" });
      
      // Save the file
      saveAs(blob, "chrome-extension.zip");
      
      toast({
        title: "Extension Exported!",
        description: "Your Chrome extension has been downloaded as a ZIP file.",
      });
      
      setShowInstructions(true);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export extension. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const instructions = [
    {
      step: 1,
      title: "Download & Extract",
      description: "Download the ZIP file and extract it to a folder"
    },
    {
      step: 2,
      title: "Open Chrome Extensions",
      description: "Go to chrome://extensions in your browser"
    },
    {
      step: 3,
      title: "Enable Developer Mode",
      description: "Toggle the Developer Mode switch in the top right"
    },
    {
      step: 4,
      title: "Load Extension",
      description: "Click 'Load unpacked' and select your extracted folder"
    },
    {
      step: 5,
      title: "Test Your Extension",
      description: "Your extension should now appear in Chrome's toolbar"
    }
  ];

  return (
    <div className="flex items-center gap-2">
      {Object.keys(files).length > 0 && (
        <Badge variant="secondary" className="text-xs">
          {Object.keys(files).length} files ready
        </Badge>
      )}
      
      <Button
        onClick={exportAsZip}
        disabled={loading || exporting || Object.keys(files).length === 0}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        {exporting ? (
          <>
            <Package className="w-4 h-4 mr-2 animate-pulse" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Download ZIP
          </>
        )}
      </Button>

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogTrigger asChild>
          <Button variant="outline" className="text-xs">
            <Chrome className="w-4 h-4 mr-2" />
            How to Install
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Chrome className="w-5 h-5 text-blue-500" />
              Install Your Chrome Extension
            </DialogTitle>
            <DialogDescription>
              Follow these steps to load your generated extension into Chrome
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {instructions.map((instruction, index) => (
              <motion.div
                key={instruction.step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="bg-slate-50 dark:bg-slate-800/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {instruction.step}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                          {instruction.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {instruction.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            
            <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">
                      Success!
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your extension is now installed and ready to use. You can find it in Chrome's extensions toolbar.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
