type Props = {
  title: string;
  value: string;
};

export default function DashboardCard({ title, value }: Props) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 10,
        padding: 20,
        width: 220,
        boxShadow: "0 2px 10px rgba(0,0,0,.1)",
      }}
    >
      <h3>{title}</h3>

      <h1>{value}</h1>
    </div>
  );
}

