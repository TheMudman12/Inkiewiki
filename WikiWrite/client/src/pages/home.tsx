import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { FileText, Plus, Search, Menu, User, Calendar } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Post } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const { data: searchResults = [] } = useQuery<Post[]>({
    queryKey: ["/api/posts/search", { q: searchQuery }],
    enabled: searchQuery.length > 2,
  });

  const displayedPosts = searchQuery.length > 2 ? searchResults : posts;
  const recentPosts = posts.slice(0, 5);

  const categories = posts.reduce((acc, post) => {
    const category = post.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(post);
    return acc;
  }, {} as Record<string, Post[]>);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          data-testid="mobile-overlay"
        >
          <div className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-card shadow-xl">
            <Sidebar 
              posts={posts}
              recentPosts={recentPosts}
              categories={categories}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-card border-r border-gray-200 dark:border-border z-30 transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out">
        <Sidebar 
          posts={posts}
          recentPosts={recentPosts}
          categories={categories}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </aside>

      {/* Main Content */}
      <main className="lg:ml-80">
        {/* Header */}
        <header className="bg-white dark:bg-card border-b border-gray-200 dark:border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-4"
                onClick={() => setSidebarOpen(true)}
                data-testid="button-mobile-menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <h1 className="text-lg font-semibold text-foreground">All Posts</h1>
              </div>
            </div>
            <Link href="/editor">
              <Button data-testid="button-new-post">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 dark:bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-muted rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-muted rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : displayedPosts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchQuery ? "No posts found" : "No posts yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? `No posts match "${searchQuery}"`
                  : "Get started by creating your first post"
                }
              </p>
              {!searchQuery && (
                <Link href="/editor">
                  <Button data-testid="button-create-first-post">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Post
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {searchQuery && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Search className="h-4 w-4" />
                  <span data-testid="text-search-results">
                    {displayedPosts.length} result{displayedPosts.length !== 1 ? 's' : ''} for "{searchQuery}"
                  </span>
                </div>
              )}
              
              {displayedPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow" data-testid={`card-post-${post.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link href={`/editor/${post.id}`}>
                          <CardTitle className="text-xl hover:text-primary cursor-pointer transition-colors" data-testid={`link-post-${post.id}`}>
                            {post.title}
                          </CardTitle>
                        </Link>
                        <CardDescription className="mt-2 flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span data-testid={`text-author-${post.id}`}>{post.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span data-testid={`text-date-${post.id}`}>
                              {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}
                            </span>
                          </div>
                          {post.category && (
                            <Badge variant="secondary" data-testid={`badge-category-${post.id}`}>
                              {post.category}
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose prose-sm max-w-none text-muted-foreground line-clamp-3"
                      dangerouslySetInnerHTML={{ 
                        __html: post.content.replace(/<[^>]*>/g, ' ').substring(0, 200) + '...'
                      }}
                      data-testid={`text-content-preview-${post.id}`}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
