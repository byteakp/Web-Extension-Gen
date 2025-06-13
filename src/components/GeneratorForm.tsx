
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader, Zap, Settings } from "lucide-react";
import type { Model } from "@/pages/Index";

interface GeneratorFormProps {
  onGenerate: (description: string, model: string, includePopup: boolean) => void;
  loading: boolean;
  models: Model[];
}

export const GeneratorForm = ({ onGenerate, loading, models }: GeneratorFormProps) => {
  const [description, setDescription] = useState("");
  const [selectedModel, setSelectedModel] = useState("mistralai/devstral-small:free");
  const [includePopup, setIncludePopup] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onGenerate(description, selectedModel, includePopup);
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-blue-500" />
              Generate Extension
            </CardTitle>
            <CardDescription>
              Describe your Chrome extension and let AI build it for you
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-2"
        >
          <Label htmlFor="description" className="text-sm font-medium">
            Extension Description *
          </Label>
          <Textarea
            id="description"
            placeholder="e.g., Block YouTube after 1 hour of usage, Create a password generator, Add dark mode to any website..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[120px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm resize-none"
            disabled={loading}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-2"
        >
          <Label htmlFor="model" className="text-sm font-medium">
            AI Model
          </Label>
          <Select value={selectedModel} onValueChange={setSelectedModel} disabled={loading}>
            <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <SelectValue placeholder="Select AI model" />
            </SelectTrigger>
            <SelectContent>
              {models.length > 0 ? (
                models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{model.name}</span>
                      {model.free && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded ml-2">
                          FREE
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="mistralai/devstral-small:free">
                  Devstral Small (Free)
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
        >
          <div className="space-y-0.5">
            <Label htmlFor="include-popup" className="text-sm font-medium">
              Include Popup UI
            </Label>
            <p className="text-xs text-muted-foreground">
              Add popup.html and popup.js files
            </p>
          </div>
          <Switch
            id="include-popup"
            checked={includePopup}
            onCheckedChange={setIncludePopup}
            disabled={loading}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="flex-1 flex items-end"
        >
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-6 text-base shadow-lg shadow-blue-500/25"
            disabled={loading || !description.trim()}
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Extension
              </>
            )}
          </Button>
        </motion.div>
      </form>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="mt-4"
      >
        <Card className="bg-slate-50/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Settings className="w-4 h-4 text-slate-500" />
              Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Be specific about functionality</li>
              <li>• Mention UI elements if needed</li>
              <li>• Include target websites if applicable</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
