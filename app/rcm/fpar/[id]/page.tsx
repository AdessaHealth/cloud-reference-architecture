import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, FileText, DollarSign } from "lucide-react";

export default async function FparDetailPage({ params }: { params: { id: string } }) {
  const data = await getFparDetails(params.id); // Mocked for demo

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
                AI-Detected Issues & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Recommendation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.identifiedIssues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell><Badge variant="outline">{issue.severity}</Badge></TableCell>
                      <TableCell>{issue.description}</TableCell>
                      <TableCell>{issue.recommendation}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
