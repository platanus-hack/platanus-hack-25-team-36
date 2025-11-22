import AuthGuard from "./components/auth/AuthGuard";
import Header from "./components/Header";
import Main from "./components/Main";

export default function Home() {
  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-white">
        {/* Fixed Header */}
        <Header />

        {/* Main Content */}
        <Main />
      </div>
    </AuthGuard>
  );
}
