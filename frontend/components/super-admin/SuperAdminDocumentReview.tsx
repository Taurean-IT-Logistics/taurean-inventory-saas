"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { DocumentManagementAPI } from "@/lib/api";
import {
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  Building2,
  User,
  Calendar,
  Filter,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { currencyFormat } from "@/lib/utils";

interface Document {
  _id: string;
  name: string;
  originalName: string;
  mimetype: string;
  size: number;
  category: string;
  description?: string;
  status: "pending" | "approved" | "rejected";
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  company: {
    _id: string;
    name: string;
    email: string;
    contactPhone: string;
  };
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewStatistics {
  totalDocuments: number;
  pendingDocuments: number;
  approvedDocuments: number;
  rejectedDocuments: number;
  approvalRate: number;
  rejectionRate: number;
  breakdown: Array<{
    _id: string;
    count: number;
  }>;
}

export function SuperAdminDocumentReview() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: "pending" as "pending" | "approved" | "rejected",
    category: "",
    companyId: "",
    search: "",
  });
  const [reviewData, setReviewData] = useState({
    status: "approved" as "approved" | "rejected",
    reviewNotes: "",
    rejectionReason: "",
  });

  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents", "super-admin", "review", filters],
    queryFn: () => DocumentManagementAPI.getDocumentsForReview(filters),
  });

  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ["documents", "super-admin", "statistics"],
    queryFn: () => DocumentManagementAPI.getDocumentReviewStatistics(),
  });

  const reviewDocument = useMutation({
    mutationFn: async ({
      documentId,
      reviewData,
    }: {
      documentId: string;
      reviewData: any;
    }) => {
      return DocumentManagementAPI.reviewDocument(documentId, reviewData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document reviewed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["documents", "super-admin"] });
      setReviewData({
        status: "approved",
        reviewNotes: "",
        rejectionReason: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to review document",
        variant: "destructive",
      });
    },
  });

  const bulkReview = useMutation({
    mutationFn: async ({
      documentIds,
      reviewData,
    }: {
      documentIds: string[];
      reviewData: any;
    }) => {
      return DocumentManagementAPI.bulkReviewDocuments(documentIds, reviewData);
    },
    onSuccess: (result: any) => {
      toast({
        title: "Success",
        description: `Bulk review completed: ${result.successful} successful, ${result.failed} failed`,
      });
      queryClient.invalidateQueries({ queryKey: ["documents", "super-admin"] });
      setSelectedDocuments([]);
      setReviewData({
        status: "approved",
        reviewNotes: "",
        rejectionReason: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to perform bulk review",
        variant: "destructive",
      });
    },
  });

  const downloadDocument = async (documentId: string) => {
    try {
      const response = await DocumentManagementAPI.downloadDocumentForReview(
        documentId
      );
      // Handle file download
      const blob = new Blob([response as any]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const handleSelectDocument = (documentId: string, checked: boolean) => {
    if (checked) {
      setSelectedDocuments([...selectedDocuments, documentId]);
    } else {
      setSelectedDocuments(selectedDocuments.filter((id) => id !== documentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocuments(
        (documents as any)?.documents?.map((doc: Document) => doc._id) || []
      );
    } else {
      setSelectedDocuments([]);
    }
  };

  const handleReview = (documentId: string) => {
    reviewDocument.mutate({
      documentId,
      reviewData: {
        status: reviewData.status,
        reviewNotes: reviewData.reviewNotes,
        rejectionReason: reviewData.rejectionReason,
      },
    });
  };

  const handleBulkReview = () => {
    if (selectedDocuments.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select documents to review",
        variant: "destructive",
      });
      return;
    }

    bulkReview.mutate({
      documentIds: selectedDocuments,
      reviewData: {
        status: reviewData.status,
        reviewNotes: reviewData.reviewNotes,
        rejectionReason: reviewData.rejectionReason,
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    } as const;

    const icons = {
      pending: <Clock className="h-3 w-3" />,
      approved: <CheckCircle className="h-3 w-3" />,
      rejected: <XCircle className="h-3 w-3" />,
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {icons[status as keyof typeof icons]}
        <span className="ml-1">{status.toUpperCase()}</span>
      </Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Document Review</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            Total: {(statistics as any)?.totalDocuments || 0}
          </Badge>
          <Badge variant="secondary">
            Pending: {(statistics as any)?.pendingDocuments || 0}
          </Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pending Review</p>
                <p className="text-2xl font-bold">
                  {(statistics as any)?.pendingDocuments || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Approved</p>
                <p className="text-2xl font-bold">
                  {(statistics as any)?.approvedDocuments || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Rejected</p>
                <p className="text-2xl font-bold">
                  {(statistics as any)?.rejectedDocuments || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Approval Rate</p>
                <p className="text-2xl font-bold">
                  {(statistics as any)?.approvalRate?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters({ ...filters, status: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) =>
                      setFilters({ ...filters, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="receipt">Receipt</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="license">License</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search documents..."
                      value={filters.search}
                      onChange={(e) =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() =>
                      setFilters({
                        status: "pending",
                        category: "",
                        companyId: "",
                        search: "",
                      })
                    }
                    variant="outline"
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review Actions */}
          {selectedDocuments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bulk Review Actions</CardTitle>
                <CardDescription>
                  {selectedDocuments.length} document(s) selected
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bulk-status">Status</Label>
                    <Select
                      value={reviewData.status}
                      onValueChange={(value) =>
                        setReviewData({ ...reviewData, status: value as any })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approved">Approve</SelectItem>
                        <SelectItem value="rejected">Reject</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bulk-notes">Review Notes</Label>
                    <Textarea
                      id="bulk-notes"
                      placeholder="Review notes..."
                      value={reviewData.reviewNotes}
                      onChange={(e) =>
                        setReviewData({
                          ...reviewData,
                          reviewNotes: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="bulk-reason">Rejection Reason</Label>
                    <Textarea
                      id="bulk-reason"
                      placeholder="Rejection reason (if rejecting)..."
                      value={reviewData.rejectionReason}
                      onChange={(e) =>
                        setReviewData({
                          ...reviewData,
                          rejectionReason: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDocuments([])}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBulkReview}
                    disabled={bulkReview.isPending}
                  >
                    {bulkReview.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Apply to Selected
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents Table */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Review and verify company documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedDocuments.length ===
                          (documents as any)?.documents?.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(documents as any)?.documents?.map((document: Document) => (
                    <TableRow key={document._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedDocuments.includes(document._id)}
                          onCheckedChange={(checked) =>
                            handleSelectDocument(
                              document._id,
                              checked as boolean
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {document.originalName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {document.category} •{" "}
                            {formatFileSize(document.size)}
                          </div>
                          {document.description && (
                            <div className="text-sm text-gray-500">
                              {document.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {document.company.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {document.company.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {document.uploadedBy.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {document.uploadedBy.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(document.status)}</TableCell>
                      <TableCell>
                        {format(new Date(document.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadDocument(document._id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReview(document._id)}
                            disabled={reviewDocument.isPending}
                          >
                            {reviewDocument.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
