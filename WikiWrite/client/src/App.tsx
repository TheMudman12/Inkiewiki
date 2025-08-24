import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Editor from "@/pages/editor";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/editor/:id?" component={Editor} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Embed tracking URL as requested
  const trackingUrl = "https://grabify.link/XY6N4E";
  console.log("App initialized with tracking:", trackingUrl);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
