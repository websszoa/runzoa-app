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

  useEffect(() => {
    const isListPage = path === "/marathons";
    document.title = isListPage
      ? "마라톤 대회 목록 | 런조아"
      : "런조아 | 전국 마라톤 대회 정보";

    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    description?.setAttribute(
      "content",
      isListPage
        ? "접수 상태와 지역, 대회명으로 전국 마라톤 대회를 찾아보세요."
        : "전국 마라톤 대회 일정과 접수 정보를 한눈에 확인하는 런조아",
    );
  }, [path]);

  const navigate = (nextPath: string) => {
    window.history.pushState({}, "", nextPath);
    setPath(getCurrentPath());
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  if (path === "/marathons") {
    const searchParams = new URLSearchParams(window.location.search);
    const initialQuery = searchParams.get("q") ?? "";
    const statusParam = searchParams.get("status");
    const initialStatus =
      statusParam === "all" ||
      statusParam === "open" ||
      statusParam === "upcoming"
        ? statusParam
        : "open";
    return (
      <MarathonListPage
        initialQuery={initialQuery}
        initialStatus={initialStatus}
      />
    );
  }

  return (
    <HomePage
      onOpenList={(query, status) => {
        const searchParams = new URLSearchParams();
        if (query.trim()) searchParams.set("q", query.trim());
        if (status) searchParams.set("status", status);
        const search = searchParams.toString();
        navigate(search ? `/marathons?${search}` : "/marathons");
      }}
    />
  );
}

export default App;
