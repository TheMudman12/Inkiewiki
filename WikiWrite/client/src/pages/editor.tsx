import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import RichEditor from "@/components/rich-editor";
import FileUploadModal from "@/components/file-upload-modal";
import { ArrowLeft, Save, Upload, Settings, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Post, InsertPost, UpdatePost } from "@shared/schema";

export default function Editor() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Blog Posts",
    author: "Anonymous"
  });

  const { data: post, isLoading } = useQuery<Post>({
    queryKey: ["/api/posts", id],
    enabled: !!id,
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        category: post.category || "Blog Posts",
        author: post.author
      });
    }
  }, [post]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertPost) => {
      const res = await apiRequest("POST", "/api/posts", data);
      return res.json();
    },
    onSuccess: (newPost) => {
      toast({ title: "Success", description: "Post created successfully" });
      setLocation(`/editor/${newPost.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create post", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdatePost) => {
      if (!id) throw new Error("No post ID");
      const res = await apiRequest("PUT", `/api/posts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Post updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", id] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update post", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("No post ID");
      await apiRequest("DELETE", `/api/posts/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Post deleted successfully" });
      setLocation("/");
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete post", variant: "destructive" });
    }
  });

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }

    if (id) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate();
    }
  };

  const handleImageInsert = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + `<img src="${imageUrl}" alt="" style="max-width: 100%; height: auto;" /><br />`
    }));
  };

  if (isLoading && id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-muted rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 dark:bg-muted rounded"></div>
            <div className="h-96 bg-gray-200 dark:bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const wordCount = formData.content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length;
  const characterCount = formData.content.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-card border-b border-gray-200 dark:border-border px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="text-sm text-muted-foreground">
              {post && (
                <span data-testid="text-last-updated">
                  Last updated {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUploadModalOpen(true)}
              data-testid="button-upload-image"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save"
            >
              <Save className="h-4 w-4 mr-2" />
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
            {id && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                data-testid="button-delete"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="space-y-6">
          {/* Title and Metadata */}
          <Card>
            <CardHeader className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter post title..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="text-2xl font-bold border-none shadow-none px-0 focus-visible:ring-0"
                  data-testid="input-title"
                />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    placeholder="Author name"
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    data-testid="input-author"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Blog Posts">Blog Posts</SelectItem>
                      <SelectItem value="Documentation">Documentation</SelectItem>
                      <SelectItem value="Tutorials">Tutorials</SelectItem>
                      <SelectItem value="News">News</SelectItem>
                      <SelectItem value="Projects">Projects</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Editor */}
          <Card>
            <CardContent className="p-0">
              <RichEditor
                content={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              />
            </CardContent>
          </Card>

          {/* Footer Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span data-testid="text-word-count">{wordCount} words</span>
              <span data-testid="text-character-count">{characterCount} characters</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>All changes saved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onImageInsert={handleImageInsert}
      />
    </div>
  );
}
