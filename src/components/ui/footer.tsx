import * as React from "react";
import { Button } from "./button";

interface FooterProps {
  logo: React.ReactNode;
  brandName: string;
  socialLinks: Array<{
    icon: React.ReactNode;
    href: string;
    label: string;
  }>;
  mainLinks: Array<{
    href: string;
    label: string;
    id?: string;
  }>;
  onLinkClick?: (id: string) => void;
  legalLinks: Array<{
    href: string;
    label: string;
  }>;
  copyright: {
    text: string;
    license?: string;
  };
}

export function Footer({
  logo,
  brandName,
  socialLinks,
  mainLinks,
  legalLinks,
  copyright,
  onLinkClick,
}: FooterProps) {
  return (
    <footer className="pb-6 pt-12 lg:pb-8 lg:pt-16 border-t border-slate-200 mt-12 bg-white select-none">
      <div className="px-4 lg:px-8 max-w-6xl mx-auto">
        <div className="md:flex md:items-start md:justify-between">
          <a
            href="/"
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-x-2"
            aria-label={brandName}
          >
            {logo}
            <span className="font-extrabold text-slate-800 text-lg md:text-xl tracking-tight">{brandName}</span>
          </a>
          <ul className="flex list-none mt-6 md:mt-0 space-x-3">
            {socialLinks.map((link, i) => (
              <li key={i}>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9 rounded-full cursor-pointer hover:bg-slate-200"
                  asChild
                >
                  <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                    {link.icon}
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-slate-100 mt-6 pt-6 md:mt-4 md:pt-6 lg:grid lg:grid-cols-10 gap-4">
          <nav className="lg:mt-0 lg:col-[4/11]">
            <ul className="list-none flex flex-wrap -my-1 -mx-2 lg:justify-end">
              {mainLinks.map((link, i) => (
                <li key={i} className="my-1 mx-2 shrink-0">
                  <a
                    href={link.href}
                    onClick={(e) => {
                      if (link.id && onLinkClick) {
                        e.preventDefault();
                        onLinkClick(link.id);
                      } else {
                        e.preventDefault();
                      }
                    }}
                    className="text-xs md:text-sm font-bold text-civic-primary hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-4 lg:mt-0 lg:col-[4/11]">
            <ul className="list-none flex flex-wrap -my-1 -mx-3 lg:justify-end">
              {legalLinks.map((link, i) => (
                <li key={i} className="my-1 mx-3 shrink-0">
                  <a
                    href={link.href}
                    onClick={(e) => e.preventDefault()}
                    className="text-xs md:text-sm font-medium text-slate-400 hover:text-slate-600 hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 text-xs leading-5 text-slate-400 lg:mt-0 lg:row-[1/3] lg:col-[1/4] font-medium">
            <div>{copyright.text}</div>
            {copyright.license && <div>{copyright.license}</div>}
          </div>
        </div>
      </div>
    </footer>
  );
}
