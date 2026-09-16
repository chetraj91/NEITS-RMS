import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

type Props = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div
        style={{
          flex: 1,
          background: "#f1f5f9",
          minHeight: "100vh",
        }}
      >
        <Header />

        <div style={{ padding: 30 }}>{children}</div>
      </div>
    </div>
  );
}

