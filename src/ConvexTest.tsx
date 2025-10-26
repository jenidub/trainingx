import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuth } from "./contexts/AuthContextProvider";

export default function ConvexTest() {
  const { isAuthenticated } = useAuth();

  // Test basic Convex query
  const projects = useQuery(api.projects.getProjects, { limit: 5 });

  if (projects === undefined) {
    return <div>Loading Convex test...</div>;
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg m-4">
      <h3 className="text-lg font-semibold text-green-800 mb-2">
        ✅ Convex Integration Test
      </h3>
      <p className="text-sm text-green-700 mb-2">
        Authenticated: {isAuthenticated ? "✅ Yes" : "❌ No"}
      </p>
      <p className="text-sm text-green-700 mb-2">
        Projects loaded: {projects?.length || 0} found
      </p>
      <div className="text-xs text-green-600">
        Convex backend is working! 🎉
      </div>
    </div>
  );
}