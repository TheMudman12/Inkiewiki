import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  FileText, 
  Plus, 
  Folder, 
  ChevronRight, 
  ChevronDown,
  Settings,
  HelpCircle,
  X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Post } from "@shared/schema";

interface SidebarProps {
  posts: Post[];
  recentPosts: Post[];
  categories: Record<string, Post[]>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onClose?: () => void;
}

export default function Sidebar({ 
  posts, 
  recentPosts, 
  categories, 
  searchQuery, 
  setSearchQuery, 
  onClose 
}: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Documentation': 'text-blue-500',
      'Tutorials': 'text-green-500',
      'Blog Posts': 'text-purple-500',
      'News': 'text-red-500',
      'Projects': 'text-orange-500'
    };
    return colors[category as keyof typeof colors] || 'text-gray-500';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-border">
        <h1 className="text-xl font-semibold text-foreground">BlogWiki</h1>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-sidebar">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Recent Pages */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Recent
            </h3>
            <div className="space-y-1">
              {recentPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground px-3 py-2">No recent posts</p>
              ) : (
                recentPosts.map((post) => (
                  <Link key={post.id} href={`/editor/${post.id}`}>
                    <div className="flex items-center px-3 py-2 text-sm text-foreground rounded-lg hover:bg-muted group cursor-pointer" data-testid={`link-recent-post-${post.id}`}>
                      <FileText className="text-muted-foreground mr-3 h-4 w-4 group-hover:text-foreground" />
                      <div className="flex-1 min-w-0">
                        <span className="truncate block" data-testid={`text-recent-title-${post.id}`}>{post.title}</span>
                      </div>
                      <span className="ml-auto text-xs text-muted-foreground shrink-0" data-testid={`text-recent-time-${post.id}`}>
                        {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true }).replace('about ', '')}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Categories
            </h3>
            <div className="space-y-1">
              {Object.keys(categories).length === 0 ? (
                <p className="text-sm text-muted-foreground px-3 py-2">No categories</p>
              ) : (
                Object.entries(categories).map(([category, categoryPosts]) => (
                  <div key={category} className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-3 py-2 h-auto text-sm font-medium hover:bg-muted"
                      onClick={() => toggleCategory(category)}
                      data-testid={`button-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {expandedCategories[category] ? (
                        <ChevronDown className="mr-2 h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      <Folder className={`mr-2 h-4 w-4 ${getCategoryColor(category)}`} />
                      <span className="flex-1 text-left" data-testid={`text-category-name-${category.toLowerCase().replace(/\s+/g, '-')}`}>{category}</span>
                      <Badge variant="secondary" className="text-xs" data-testid={`badge-category-count-${category.toLowerCase().replace(/\s+/g, '-')}`}>
                        {categoryPosts.length}
                      </Badge>
                    </Button>
                    
                    {expandedCategories[category] && (
                      <div className="ml-8 space-y-1">
                        {categoryPosts.slice(0, 5).map((post) => (
                          <Link key={post.id} href={`/editor/${post.id}`}>
                            <div className="flex items-center px-3 py-1 text-sm text-muted-foreground rounded-lg hover:bg-muted hover:text-foreground cursor-pointer" data-testid={`link-category-post-${post.id}`}>
                              <span className="truncate" data-testid={`text-category-post-title-${post.id}`}>{post.title}</span>
                            </div>
                          </Link>
                        ))}
                        {categoryPosts.length > 5 && (
                          <div className="px-3 py-1 text-xs text-muted-foreground">
                            +{categoryPosts.length - 5} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-border">
        <Link href="/editor">
          <Button className="w-full mb-3" data-testid="button-new-page-sidebar">
            <Plus className="mr-2 h-4 w-4" />
            New Page
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid="button-settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid="button-help">
            <HelpCircle className="mr-2 h-4 w-4" />
            Help
          </Button>
        </div>
      </div>
    </div>
  );
}
