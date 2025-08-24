import { type User, type InsertUser, type Post, type InsertPost, type UpdatePost } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Posts CRUD operations
  getAllPosts(): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, post: UpdatePost): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;
  getPostsByCategory(category: string): Promise<Post[]>;
  searchPosts(query: string): Promise<Post[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private posts: Map<string, Post>;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    
    // Initialize with sample content
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const samplePost: Post = {
      id: randomUUID(),
      title: "Getting Started Guide",
      content: `<p>Welcome to your new BlogWiki! This getting started guide will help you understand how to create, edit, and manage your content effectively.</p>
      
      <h2>Creating Your First Page</h2>
      <p>To create a new page, simply click the "New Page" button in the sidebar. You can choose from various templates or start with a blank page.</p>
      
      <h2>Organizing Your Content</h2>
      <p>Use categories and tags to organize your pages effectively. This makes it easier for readers to find related content and for you to manage your growing knowledge base.</p>
      
      <ul>
        <li>Create logical categories for different topics</li>
        <li>Use descriptive titles that are easy to search</li>
        <li>Add relevant tags for better discoverability</li>
        <li>Keep your content structure consistent</li>
      </ul>
      
      <h2>Rich Media Support</h2>
      <p>BlogWiki supports various types of media including images, videos, and code blocks. You can easily upload and embed content to make your pages more engaging.</p>
      
      <pre><code>// Example code block
function createPage(title, content) {
    return {
        id: generateId(),
        title: title,
        content: content,
        createdAt: new Date(),
        updatedAt: new Date()
    };
}</code></pre>
      
      <p>Remember to save your changes regularly using Ctrl+S or the save button in the toolbar.</p>`,
      category: "Documentation",
      author: "John Doe",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    };
    
    this.posts.set(samplePost.id, samplePost);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.posts.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const now = new Date();
    const post: Post = { 
      ...insertPost, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: string, updatePost: UpdatePost): Promise<Post | undefined> {
    const existingPost = this.posts.get(id);
    if (!existingPost) return undefined;
    
    const updatedPost: Post = {
      ...existingPost,
      ...updatePost,
      updatedAt: new Date()
    };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: string): Promise<boolean> {
    return this.posts.delete(id);
  }

  async getPostsByCategory(category: string): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.category === category)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async searchPosts(query: string): Promise<Post[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.posts.values())
      .filter(post => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
}

export const storage = new MemStorage();
