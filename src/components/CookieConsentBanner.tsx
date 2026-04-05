import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CONSENT_KEY = "cookie-consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = (value: "all" | "essential") => {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg"
        >
          <div className="rounded-xl border border-border bg-card/95 backdrop-blur-lg p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                <Cookie className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Cookie Preferences</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    We use cookies for authentication and to improve your experience. Read our{" "}
                    <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for details.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => accept("all")} className="text-xs">
                    Accept All
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => accept("essential")} className="text-xs">
                    Essential Only
                  </Button>
                </div>
              </div>
              <button onClick={() => accept("essential")} className="text-muted-foreground hover:text-foreground shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
