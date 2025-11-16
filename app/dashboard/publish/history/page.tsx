import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function PublishHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" className="mb-2">
          <Link href="/dashboard/publish">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Publishing
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Publish History</h2>
        <p className="text-muted-foreground">
          View all your publishing activities and results
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Publishes</CardTitle>
          <CardDescription>
            Track the status of your publishing jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead>Platforms</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No publishing history yet. Publish your first article!
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
