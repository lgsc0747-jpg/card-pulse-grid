import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const ShortUrlRedirect = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!code) {
      navigate("/", { replace: true });
      return;
    }

    const resolve = async () => {
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/resolve-short-link`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          }
        );

        if (!res.ok) {
          setError(true);
          return;
        }

        const data = await res.json();
        const path = data.persona_slug
          ? `/p/${data.username}/${data.persona_slug}`
          : `/p/${data.username}`;
        navigate(path, { replace: true });
      } catch {
        setError(true);
      }
    };

    resolve();
  }, [code, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">This short link is invalid or expired.</p>
        <a href="/" className="text-primary underline text-sm">Go home</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
};

export default ShortUrlRedirect;
