import TopNav from "@/components/layout/TopNav";
import AuthGuard from "@/components/layout/AuthGuard";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 2. Bungkus seluruh elemen dengan AuthGuard
    <AuthGuard>
      <TopNav />
      <main>{children}</main>
    </AuthGuard>
  );
}
