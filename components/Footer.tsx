import { Heart } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="py-8 border-t mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Martins Vilums
            {" • "}
            <a
              href="mailto:martins@vilums.co"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Tips, Suggestions?
            </a>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/terms-of-use"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Terms of Use
            </Link>
            <Link
              href="/privacy-policy"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
