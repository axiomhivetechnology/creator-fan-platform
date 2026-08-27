import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AccountHub from "./pages/AccountHub";
import CreatorProfile from "./pages/CreatorProfile";
import CreatorStudio from "./pages/CreatorStudio";
import Explore from "./pages/Explore";
import Home from "./pages/Home";
import Inbox from "./pages/Inbox";
import LiveLobby from "./pages/LiveLobby";
import OperationsDesk from "./pages/OperationsDesk";
import SafetyCenter from "./pages/SafetyCenter";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/explore"} component={Explore} />
      <Route path={"/creator/:handle"} component={CreatorProfile} />
      <Route path={"/dashboard"} component={AccountHub} />
      <Route path={"/studio"} component={CreatorStudio} />
      <Route path={"/live"} component={LiveLobby} />
      <Route path={"/inbox"} component={Inbox} />
      <Route path={"/safety"} component={SafetyCenter} />
      <Route path={"/operations"} component={OperationsDesk} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
