import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Wifi, RotateCcw, Share2, Linkedin, Github, Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface InteractiveCard3DProps {
  name: string;
  headline?: string;
  avatarUrl?: string;
  username: string;
  accentColor?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  website?: string;
  email?: string;
}

export function InteractiveCard3D({
  name,
  headline,
  avatarUrl,
  username,
  accentColor = "#0d9488",
  linkedinUrl,
  githubUrl,
  website,
  email,
}: InteractiveCard3DProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-150, 150], [15, -15]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-150, 150], [-15, 15]), { stiffness: 300, damping: 30 });

  const glareX = useTransform(x, [-150, 150], [0, 100]);
  const glareY = useTransform(y, [-150, 150], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    x.set(clientX - rect.left - rect.width / 2);
    y.set(clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const profileUrl = `${window.location.origin}/p/${username}`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: name, url: profileUrl }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(profileUrl);
      toast({ title: "Link copied!", description: "Profile URL copied to clipboard." });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={cardRef}
        className="w-full max-w-[380px] aspect-[1.6/1] perspective-[1200px] cursor-pointer"
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchEnd={handleMouseLeave}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="relative w-full h-full"
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Front Side */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
            style={{
              backfaceVisibility: "hidden",
              background: `linear-gradient(135deg, ${accentColor}dd, ${accentColor}88)`,
            }}
          >
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 backdrop-blur-sm bg-white/5" />
            {/* Glare effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: useTransform(
                  [glareX, glareY],
                  ([gx, gy]) =>
                    `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.25) 0%, transparent 60%)`
                ),
              }}
            />
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-between p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  >
                    <Wifi className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/70">
                    NFC Hub
                  </span>
                </div>
                {/* Pulsing NFC Active badge */}
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: "#4ade80" }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2 w-2"
                      style={{ backgroundColor: "#22c55e" }}
                    />
                  </span>
                  <span className="text-[10px] font-medium text-white/80">Active</span>
                </div>
              </div>

              <div className="flex items-end gap-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-12 h-12 rounded-full border-2 border-white/30 object-cover"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  >
                    {(name || "?")[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-white font-bold text-lg truncate">{name || "Your Name"}</h2>
                  {headline && (
                    <p className="text-white/70 text-xs truncate">{headline}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: `linear-gradient(135deg, ${accentColor}cc, ${accentColor}66)`,
            }}
          >
            <div className="absolute inset-0 backdrop-blur-sm bg-white/5" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3 p-6">
              <div className="bg-white rounded-xl p-2.5">
                <QRCodeSVG
                  value={profileUrl}
                  size={100}
                  fgColor={accentColor}
                  bgColor="#ffffff"
                  level="M"
                />
              </div>
              <p className="text-white/60 text-[10px] font-mono">
                /p/{username}
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-3 mt-1">
                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Linkedin className="w-3.5 h-3.5 text-white" />
                  </a>
                )}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Github className="w-3.5 h-3.5 text-white" />
                  </a>
                )}
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Globe className="w-3.5 h-3.5 text-white" />
                  </a>
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Mail className="w-3.5 h-3.5 text-white" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            setIsFlipped(!isFlipped);
          }}
          className="text-xs"
        >
          <RotateCcw className="w-3 h-3 mr-1" /> Flip
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
          className="text-xs"
        >
          <Share2 className="w-3 h-3 mr-1" /> Share
        </Button>
      </div>
    </div>
  );
}
