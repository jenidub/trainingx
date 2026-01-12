import { Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const footerLinks = {
    Product: [
      { label: "Pricing", href: "/pricing" },
      { label: "Features", href: "/#features" },
    ],
    Company: [{ label: "About Us", href: "/about" }],
    Resources: [
      { label: "Help Center", href: "/support" },
      { label: "Community", href: "/community" },
    ],
    Legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  };

  const contact = [
    { icon: <Mail className="h-4 w-4" />, label: "hello@trainingx.ai" },
    { icon: <Phone className="h-4 w-4" />, label: "+1 (555) 123-4567" },
    { icon: <MapPin className="h-4 w-4" />, label: "San Francisco, CA" },
  ];

  return (
    <footer className="z-50 bg-gray-900 text-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12"> */}
        {/* Brand */}
        <Image
          src="/logo.webp"
          alt="TrainingX.AI logo"
          width={80}
          height={80}
          className="mb-4"
        />
        <div className="flex justify-between items-center mb-12">
          {/* <div className="text-3xl font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent mb-4">
              TrainingX.Ai
            </div> */}
          <div className="flex justify-between w-full items-center space-x-8">
            <p className="text-gray-400 mb-6 max-w-md">
              Universal Prompting for the 21st Century. Master AI skills with
              our proven 10-year track record and join the AI economy.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              {contact.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 text-gray-400"
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="w-full flex flex-wrap md:flex-nowrap justify-between gap-8 mb-12">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4 text-white">{category}</h4>
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                      data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2026 TrainingX.AI. All rights reserved. Built for the AI
              economy.
            </div>
            <div className="flex space-x-6">
              {/* <a
                href="https://orcid.org/0009-0004-3282-7042"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
              >
                ORCID Researcher
              </a> */}
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Terms
              </Link>
              <Link
                href="/support"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
