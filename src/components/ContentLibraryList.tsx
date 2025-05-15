
import React from "react";
import { useContentLibrary } from "@/hooks/use-content-library";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

const ContentLibraryList = () => {
  const { data, isLoading, error } = useContentLibrary();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-red-600 text-center py-6">
        Error loading content: {error.message}
      </div>
    );
  }
  if (!data || data.length === 0) {
    return <div className="text-center py-6">No content found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Topic Area</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created</TableHead>
            {/* Add more columns if desired */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item: any) => (
            <TableRow key={item.id}>
              <TableCell>{item.title}</TableCell>
              <TableCell className="max-w-xs truncate">{item.content}</TableCell>
              <TableCell>{item.topic_area}</TableCell>
              <TableCell>{item.content_type}</TableCell>
              <TableCell>
                {item.created_at
                  ? new Date(item.created_at).toLocaleDateString()
                  : ""}
              </TableCell>
              {/* More columns can be rendered here as needed */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContentLibraryList;
