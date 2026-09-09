import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PremiumAccessGate } from "@/components/PremiumAccessGate";
import GlobalNotificationBanner from "@/components/GlobalNotificationBanner";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AccountHub from "./pages/AccountHub";
import CreatorApplication from "./pages/CreatorApplication";
import CreatorContactSettings from "./pages/CreatorContactSettings";
import CreatorEvents from "./pages/CreatorEvents";
import CreatorProfile from "./pages/CreatorProfile";
import CreatorStudio from "./pages/CreatorStudio";
import DeveloperEditor from "./pages/DeveloperEditor";
import Explore from "./pages/Explore";
import Home from "./pages/Home";
import Inbox from "./pages/Inbox";
import LiveLobby from "./pages/LiveLobby";
import OperationsDesk from "./pages/OperationsDesk";
import PremiumAccess from "./pages/PremiumAccess";
import SafetyCenter from "./pages/SafetyCenter";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/join"} component={PremiumAccess} />
      <Route path={"/apply"} component={CreatorApplication} />
      <Route path={"/studio/live"} component={CreatorEvents} />
      <Route path={"/studio/contact"} component={CreatorContactSettings} />
      <Route path={"/explore"}>{() => <PremiumAccessGate><Explore /></PremiumAccessGate>}</Route>
      <Route path={"/creator/:handle"}>{() => <PremiumAccessGate><CreatorProfile /></PremiumAccessGate>}</Route>
      <Route path={"/dashboard"} component={AccountHub} />
      <Route path={"/studio"} component={CreatorStudio} />
      <Route path={"/live"}>{() => <PremiumAccessGate><LiveLobby /></PremiumAccessGate>}</Route>
      <Route path={"/inbox"}>{() => <PremiumAccessGate><Inbox /></PremiumAccessGate>}</Route>
      <Route path={"/safety"} component={SafetyCenter} />
      <Route path={"/operations"} component={OperationsDesk} />
      <Route path={"/developer"} component={DeveloperEditor} />
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
          <GlobalNotificationBanner />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
