import { CompleteInvitation } from "@/components/admin/complete-invitation";
export const metadata = { title: "Complete sign-in", robots: { index: false, follow: false } };
export default function Complete() {
  return <div className="admin-shell"><div className="login-box">
    <h1>Complete your sign-in</h1><CompleteInvitation />
  </div></div>;
}
