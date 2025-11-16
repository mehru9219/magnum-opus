"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BulkUploadForm } from "@/components/generation/BulkUploadForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BulkGeneratePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button asChild variant="ghost" className="mb-2">
            <Link href="/dashboard/generate">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Generate
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Bulk Generation</h2>
          <p className="text-muted-foreground">
            Generate up to 30 articles in one batch
          </p>
        </div>
      </div>

      <BulkUploadForm />

      <Card>
        <CardHeader>
          <CardTitle>Bulk Generation Tips</CardTitle>
          <CardDescription>
            Best practices for generating multiple articles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• Each topic should be on a new line or separated by commas in CSV</p>
          <p>• Use specific, detailed topics for better results</p>
          <p>• Target: 30 articles in under 30 minutes with GPT-4</p>
          <p>• Articles are queued and processed with automatic retries</p>
          <p>• You'll receive an email when the batch completes</p>
        </CardContent>
      </Card>
    </div>
  );
}
