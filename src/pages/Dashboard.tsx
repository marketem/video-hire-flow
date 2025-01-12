import { useSession } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Dashboard() {
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate("/");
    }
  }, [session, navigate]);

  if (!session) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome, {session.user.user_metadata.first_name}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <p className="text-gray-600">Your trial ends in {Math.ceil((new Date(session.user.user_metadata.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Interviews</h2>
          <p className="text-gray-600">No interviews yet</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
            Create New Interview
          </button>
        </div>
      </div>
    </div>
  );
}