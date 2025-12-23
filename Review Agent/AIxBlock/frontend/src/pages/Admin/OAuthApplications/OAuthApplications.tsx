import AdminLayout from "../Layout";

export default function OAuthApplications() {
  return (
    <AdminLayout title="OAuth Applications">
      <iframe
        title="OAuth Applications"
        src="/o/applications"
        style={{
          border: "none",
          width: "100%",
          height: "calc(100% - 5rem)",
        }}
      />
    </AdminLayout>
  )
}
