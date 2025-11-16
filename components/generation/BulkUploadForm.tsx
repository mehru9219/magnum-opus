"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText } from "lucide-react";

export function BulkUploadForm() {
  const [topics, setTopics] = useState("");
  const [template, setTemplate] = useState("listicle");
  const [model, setModel] = useState("gpt-4");
  const [file, setFile] = useState<File | null>(null);

  const topicCount = topics.split("\n").filter(t => t.trim()).length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      // Parse CSV file
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const lines = content.split("\n").filter(line => line.trim());
        setTopics(lines.join("\n"));
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  const handleGenerate = () => {
    // This will be connected to Convex mutation in Phase 2
    console.log("Generating bulk articles:", {
      topics: topics.split("\n").filter(t => t.trim()),
      template,
      model,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Article Configuration</CardTitle>
        <CardDescription>
          Upload topics via CSV or paste them directly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="paste">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste">Paste Topics</TabsTrigger>
            <TabsTrigger value="upload">Upload CSV</TabsTrigger>
          </TabsList>

          <TabsContent value="paste" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topics">Topics (one per line)</Label>
              <Textarea
                id="topics"
                placeholder="Best AI Tools for Content Marketing&#10;How to Use ChatGPT for SEO&#10;Top 10 AI Writing Assistants&#10;..."
                rows={10}
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                {topicCount} topics entered
              </p>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Upload CSV File</Label>
              <div className="flex items-center gap-4">
                <Button asChild variant="outline" className="w-full">
                  <label htmlFor="file" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    {file ? file.name : "Choose File"}
                    <input
                      id="file"
                      type="file"
                      accept=".csv,.txt"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                CSV file with one topic per line. Max 30 topics per batch.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bulk-template">Content Template</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger id="bulk-template">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="listicle">Listicle</SelectItem>
                <SelectItem value="how-to">How-To Guide</SelectItem>
                <SelectItem value="comparison">Comparison</SelectItem>
                <SelectItem value="problem-solver">Problem-Solver</SelectItem>
                <SelectItem value="ultimate-guide">Ultimate Guide</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulk-model">AI Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="bulk-model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4 (Highest Quality)</SelectItem>
                <SelectItem value="gpt-3.5">GPT-3.5 (Fastest)</SelectItem>
                <SelectItem value="claude-3.5">Claude 3.5 Sonnet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Total Articles:</span>
            <span className="font-semibold">{topicCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Estimated Cost:</span>
            <span className="font-semibold">
              ${(topicCount * (model === "gpt-4" ? 0.15 : 0.05)).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Estimated Time:</span>
            <span className="font-semibold">
              {topicCount > 0 ? `~${Math.ceil(topicCount * 2)} minutes` : "--"}
            </span>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          className="w-full"
          size="lg"
          disabled={topicCount === 0 || topicCount > 30}
        >
          <FileText className="mr-2 h-4 w-4" />
          Generate {topicCount} Articles
        </Button>

        {topicCount > 30 && (
          <p className="text-sm text-destructive text-center">
            Maximum 30 topics per batch. Please remove {topicCount - 30} topics.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
