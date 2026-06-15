import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Layout from "@/components/layout";
import Home from "@/pages/home";
import Players from "@/pages/players";
import Matches from "@/pages/matches";
import Community from "@/pages/community";
import Predictions from "@/pages/predictions";
import Highlights from "@/pages/highlights";
import Chat from "@/pages/chat";
import MyPage from "@/pages/mypage";
import Login from "@/pages/login";
import Register from "@/pages/register";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/players" component={Players} />
            <Route path="/matches" component={Matches} />
            <Route path="/community" component={Community} />
            <Route path="/predictions" component={Predictions} />
            <Route path="/highlights" component={Highlights} />
            <Route path="/chat" component={Chat} />
            <Route path="/mypage" component={MyPage} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
