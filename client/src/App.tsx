import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CompareProvider } from "./contexts/CompareContext";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Compare from "./pages/Compare";
import About from "./pages/About";
import AboutCardPage from "./pages/AboutCardPage";
import MarketTrends from "./pages/MarketTrends";
import MarketTrendArticle from "./pages/MarketTrendArticle";
import MarketNewsList from "./pages/admin/MarketNewsList";
import MarketNewsForm from "./pages/admin/MarketNewsForm";
import RealEstateTools from "./pages/RealEstateTools";
import KungfuNotesList from "./pages/KungfuNotesList";
import KungfuDetail from "./pages/KungfuDetail";
import ToolItemDetail from "./pages/ToolItemDetail";
import SellingProcessDemo from "./pages/SellingProcessDemo";
import LandSellingDemo from "./pages/LandSellingDemo";
import LoanProcessDemo from "./pages/LoanProcessDemo";
import HomeStylesDemoIndex from "./pages/demo/HomeStylesDemoIndex";
import HomeStyle1Demo from "./pages/demo/HomeStyle1Demo";
import HomeStyle2Demo from "./pages/demo/HomeStyle2Demo";
import HomeStyle3Demo from "./pages/demo/HomeStyle3Demo";
import HomeStyle4Demo from "./pages/demo/HomeStyle4Demo";
import AboutTeamDemoIndex from "./pages/demo/AboutTeamDemoIndex";
import AboutTeamStyle1 from "./pages/demo/AboutTeamStyle1";
import AboutTeamStyle2 from "./pages/demo/AboutTeamStyle2";
import AboutTeamStyle3 from "./pages/demo/AboutTeamStyle3";
import AboutTeamStyle4 from "./pages/demo/AboutTeamStyle4";
import AboutTeamStyle5 from "./pages/demo/AboutTeamStyle5";
import AboutTeamStyle6 from "./pages/demo/AboutTeamStyle6";
import AboutTeamStyle7 from "./pages/demo/AboutTeamStyle7";
import AboutTeamStyle8 from "./pages/demo/AboutTeamStyle8";
import AboutTeamStyle9 from "./pages/demo/AboutTeamStyle9";
import AboutTeamStyle10 from "./pages/demo/AboutTeamStyle10";
import ZoneDetail from "./pages/ZoneDetail";
import ZoneList from "./pages/ZoneList";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CompareDock from "./components/CompareDock";
import LineFloatingButton from "./components/LineFloatingButton";
// 後台
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import Login from "@/pages/admin/Login";
import Register from "@/pages/admin/Register";
import ProjectsList from "@/pages/admin/ProjectsList";
import ProjectForm from "@/pages/admin/ProjectForm";
import ZonesList from "@/pages/admin/ZonesList";
import ZoneForm from "@/pages/admin/ZoneForm";
import BuildersList from "@/pages/admin/BuildersList";
import BuilderForm from "@/pages/admin/BuilderForm";
import MappingsPage from "@/pages/admin/MappingsPage";
import NavbarSettingsPage from "@/pages/admin/NavbarSettingsPage";
import FooterSettingsPage from "@/pages/admin/FooterSettingsPage";
import AboutSettingsPage from "@/pages/admin/AboutSettingsPage";
import HomeSettingsPage from "@/pages/admin/HomeSettingsPage";
import ProjectImagesPage from "@/pages/admin/ProjectImagesPage";
import AgentsListPage from "@/pages/admin/AgentsListPage";
import MaintenancePage from "@/pages/admin/MaintenancePage";
import MyProfilePage from "@/pages/admin/MyProfilePage";
import KungfuPage from "@/pages/admin/KungfuPage";
import AuditPage from "@/pages/admin/AuditPage";
import ToolBlocksPage from "@/pages/admin/ToolBlocksPage";
import TeamMembersPage from "@/pages/admin/TeamMembersPage";

function Router() {
  return (
    <Switch>
      {/* 後台（路徑較具體的放前面） */}
      <Route path={"/admin/login"} component={Login} />
      <Route path={"/admin/register"} component={Register} />
      <Route path={"/admin/projects/new"} component={() => <AdminLayout><ProjectForm /></AdminLayout>} />
      <Route path={"/admin/projects/edit/:id"} component={() => <AdminLayout><ProjectForm /></AdminLayout>} />
      <Route path={"/admin/projects"} component={() => <AdminLayout><ProjectsList /></AdminLayout>} />
      <Route path={"/admin/zones/new"} component={() => <AdminLayout><ZoneForm /></AdminLayout>} />
      <Route path={"/admin/zones/edit/:zoneName"} component={() => <AdminLayout><ZoneForm /></AdminLayout>} />
      <Route path={"/admin/zones"} component={() => <AdminLayout><ZonesList /></AdminLayout>} />
      <Route path={"/admin/builders/new"} component={() => <AdminLayout><BuilderForm /></AdminLayout>} />
      <Route path={"/admin/builders/edit/:name"} component={() => <AdminLayout><BuilderForm /></AdminLayout>} />
      <Route path={"/admin/builders"} component={() => <AdminLayout><BuildersList /></AdminLayout>} />
      <Route path={"/admin/mappings"} component={() => <AdminLayout><MappingsPage /></AdminLayout>} />
      <Route path={"/admin/navbar"} component={() => <AdminLayout><NavbarSettingsPage /></AdminLayout>} />
      <Route path={"/admin/footer"} component={() => <AdminLayout><FooterSettingsPage /></AdminLayout>} />
      <Route path={"/admin/about"} component={() => <AdminLayout><AboutSettingsPage /></AdminLayout>} />
      <Route path={"/admin/home"} component={() => <AdminLayout><HomeSettingsPage /></AdminLayout>} />
      <Route path={"/admin/team-members"} component={() => <AdminLayout><TeamMembersPage /></AdminLayout>} />
      <Route path={"/admin/kungfu"} component={() => <AdminLayout><KungfuPage /></AdminLayout>} />
      <Route path={"/admin/audit"} component={() => <AdminLayout><AuditPage /></AdminLayout>} />
      <Route path={"/admin/tool-blocks"} component={() => <AdminLayout><ToolBlocksPage /></AdminLayout>} />
      <Route path={"/admin/market-news/new"} component={() => <AdminLayout><MarketNewsForm /></AdminLayout>} />
      <Route path={"/admin/market-news/edit/:id"} component={() => <AdminLayout><MarketNewsForm /></AdminLayout>} />
      <Route path={"/admin/market-news"} component={() => <AdminLayout><MarketNewsList /></AdminLayout>} />
      <Route path={"/admin/project-images"} component={() => <AdminLayout><ProjectImagesPage /></AdminLayout>} />
      <Route path={"/admin/agents"} component={() => <AdminLayout><AgentsListPage /></AdminLayout>} />
      <Route path={"/admin/maintenance"} component={() => <AdminLayout><MaintenancePage /></AdminLayout>} />
      <Route path={"/admin/me"} component={() => <AdminLayout><MyProfilePage /></AdminLayout>} />
      <Route path={"/admin/site"} component={() => <Redirect to="/admin" />} />
      <Route path={"/admin"} component={() => <AdminLayout><AdminDashboard /></AdminLayout>} />
      {/* 前台 */}
      <Route path={"/"} component={Home} />
      <Route path={"/projects"} component={Projects} />
      <Route path={"/project/:id"} component={ProjectDetail} />
      <Route path={"/compare"} component={Compare} />
      <Route path={"/zones"} component={ZoneList} />
      <Route path={"/zone/:zoneName"} component={ZoneDetail} />
      <Route path={"/about"} component={About} />
      <Route path={"/about/card/:index"} component={AboutCardPage} />
      <Route path={"/market-trends"} component={MarketTrends} />
      <Route path={"/market-trends/:id"} component={MarketTrendArticle} />
      <Route path={"/tools/notes"} component={KungfuNotesList} />
      <Route path={"/tools/kungfu/:slug"} component={KungfuDetail} />
      <Route path={"/tools/item/:blockId/:itemId"} component={ToolItemDetail} />
      <Route path={"/demo/selling-process"} component={SellingProcessDemo} />
      <Route path={"/demo/land-selling-process"} component={LandSellingDemo} />
      <Route path={"/demo/loan-process"} component={LoanProcessDemo} />
      <Route path={"/demo/home-styles"} component={HomeStylesDemoIndex} />
      <Route path={"/demo/home-style-1"} component={HomeStyle1Demo} />
      <Route path={"/demo/home-style-2"} component={HomeStyle2Demo} />
      <Route path={"/demo/home-style-3"} component={HomeStyle3Demo} />
      <Route path={"/demo/home-style-4"} component={HomeStyle4Demo} />
      <Route path={"/demo/about-team"} component={AboutTeamDemoIndex} />
      <Route path={"/demo/about-team/1"} component={AboutTeamStyle1} />
      <Route path={"/demo/about-team/2"} component={AboutTeamStyle2} />
      <Route path={"/demo/about-team/3"} component={AboutTeamStyle3} />
      <Route path={"/demo/about-team/4"} component={AboutTeamStyle4} />
      <Route path={"/demo/about-team/5"} component={AboutTeamStyle5} />
      <Route path={"/demo/about-team/6"} component={AboutTeamStyle6} />
      <Route path={"/demo/about-team/7"} component={AboutTeamStyle7} />
      <Route path={"/demo/about-team/8"} component={AboutTeamStyle8} />
      <Route path={"/demo/about-team/9"} component={AboutTeamStyle9} />
      <Route path={"/demo/about-team/10"} component={AboutTeamStyle10} />
      <Route path={"/tools"} component={RealEstateTools} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <CompareProvider>
          <TooltipProvider>
            <Toaster />
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Router />
              </main>
              <Footer />
            </div>
            <CompareDock />
            <LineFloatingButton />
          </TooltipProvider>
        </CompareProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
