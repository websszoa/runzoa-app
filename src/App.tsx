import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import MarathonListPage from "./pages/MarathonListPage";

function getCurrentPath() {
  return window.location.pathname;
}

function App() {
  const [path, setPath] = useState(getCurrentPath);

  useEffect(() => {
    const handlePopState = () => setPath(getCurrentPath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (nextPath: string) => {
    window.history.pushState({}, "", nextPath);
    setPath(getCurrentPath());
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  if (path === "/marathons") {
    const initialQuery = new URLSearchParams(window.location.search).get("q") ?? "";
    return (
      <MarathonListPage
        initialQuery={initialQuery}
        onBack={() => {
          if (window.history.length > 1) window.history.back();
          else navigate("/");
        }}
      />
    );
  }

  return (
    <HomePage
      onOpenList={(query) =>
        navigate(query.trim() ? `/marathons?q=${encodeURIComponent(query.trim())}` : "/marathons")
      }
    />
  );
}

export default App;
