"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { ChevronDown, Menu, X, User, Settings } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useEffect, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useUser } from "@clerk/nextjs";
import {
  LANDING_AUTH_PATHS,
  LANDING_DESKTOP_NAV_LINKS,
  LANDING_FEATURE_NAV_LINKS,
} from "@/modules/landing/constants";

export function LandingNav() {
  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const userDisplayName =
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress ||
    "Bruker";
  const userInitials =
    user?.firstName?.[0] ||
    user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ||
    "U";

  return (
    <>
      {isLoaded && user && (
        <div className="fixed top-6 right-6 z-60 hidden lg:block">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border bg-background/80 px-2 py-1.5 text-sm backdrop-blur-sm hover:bg-foreground/10">
              <Avatar className="size-7">
                <AvatarImage src={user.imageUrl} alt={userDisplayName} />
                <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
              </Avatar>
              <span className="max-w-[140px] truncate text-sm font-medium">
                {userDisplayName}
              </span>
              <ChevronDown className="size-4 opacity-60" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-56">
              <div className="px-2 py-2">
                <p className="text-xs font-medium">{userDisplayName}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-0">
                <Link
                  href={LANDING_AUTH_PATHS.appHome}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm"
                >
                  <User className="size-4" aria-hidden />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-0">
                <Link
                  href="/"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm"
                >
                  <Settings className="size-4" aria-hidden />
                  Hjem
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <header>
        <nav
          data-state={menuState && "active"}
          aria-label="Hovednavigasjon"
          className="fixed z-50 w-full px-2"
        >
          <div
            className={cn(
              "mx-auto mt-3 max-w-7xl px-4 transition-all duration-500 md:px-6 lg:px-10",
              "rounded-2xl border border-border/50 bg-background/75 shadow-sm backdrop-blur-xl",
              isScrolled &&
                "max-w-5xl border-border/60 bg-background/85 shadow-md lg:px-6",
            )}
          >
            <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
              <div className="flex w-full justify-between lg:w-auto">
                <Link
                  href="/"
                  aria-label="Agenci - Gå til hjemmeside"
                  className="flex items-center space-x-2"
                >
                  <Logo />
                </Link>

                <button
                  type="button"
                  onClick={() => setMenuState(!menuState)}
                  aria-label={menuState ? "Lukk meny" : "Åpne mobilmeny"}
                  aria-expanded={menuState}
                  aria-controls="mobile-menu"
                  className="relative z-20 -m-2.5 -mr-4 block cursor-pointer rounded-md p-2.5 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Menu
                    className="m-auto size-6 duration-200 in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0"
                    aria-hidden="true"
                  />
                  <X
                    className="absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200 in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100"
                    aria-hidden="true"
                  />
                </button>
              </div>

              <div
                className={cn(
                  "absolute inset-0 m-auto hidden size-fit items-center lg:flex",
                  isScrolled ? "gap-4" : "gap-8",
                )}
              >
                <ul
                  role="menubar"
                  className={cn(
                    "flex items-center text-sm",
                    isScrolled ? "gap-4" : "gap-8",
                  )}
                >
                  <li role="none">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex cursor-pointer items-center gap-1 rounded-md border-0 bg-transparent p-0 whitespace-nowrap text-muted-foreground duration-150 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        aria-label="Funksjoner – åpne undermeny"
                        aria-haspopup="menu"
                      >
                        <span>Funksjoner</span>
                        <ChevronDown
                          className="size-4 opacity-80"
                          aria-hidden="true"
                        />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="center"
                        sideOffset={10}
                        className="w-56 rounded-2xl border bg-background/70 p-1 backdrop-blur-xl"
                      >
                        {LANDING_FEATURE_NAV_LINKS.map((item, idx) => (
                          <div key={item.name}>
                            {idx === 1 ? (
                              <DropdownMenuSeparator className="my-1" />
                            ) : null}
                            <DropdownMenuItem className="p-0">
                              <Link
                                href={item.href}
                                className="flex w-full rounded-xl px-3 py-2 text-sm"
                              >
                                {item.name}
                              </Link>
                            </DropdownMenuItem>
                          </div>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                  {LANDING_DESKTOP_NAV_LINKS.map((item) => (
                    <li key={item.name} role="none">
                      <Link
                        href={item.href}
                        className="block whitespace-nowrap text-muted-foreground duration-150 hover:text-accent-foreground"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className={cn(
                  "absolute top-1/2 right-[200px] hidden -translate-y-1/2 items-center lg:flex",
                  isScrolled ? "gap-2" : "gap-3",
                )}
              >
                <ModeToggle />
              </div>

              <div
                id="mobile-menu"
                className="mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border bg-background p-6 shadow-2xl shadow-zinc-300/20 in-data-[state=active]:block md:flex-nowrap lg:in-data-[state=active]:flex lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent"
              >
                <div className="lg:hidden">
                  <ul role="menu" className="space-y-6 text-base">
                    <li>
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Funksjoner
                      </p>
                      <ul className="mt-4 space-y-3">
                        {LANDING_FEATURE_NAV_LINKS.map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              className="block text-muted-foreground duration-150 hover:text-accent-foreground"
                            >
                              <span>{item.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                    <li className="pt-2">
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Mer
                      </p>
                      <ul className="mt-4 space-y-3">
                        {LANDING_DESKTOP_NAV_LINKS.map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              className="block text-muted-foreground duration-150 hover:text-accent-foreground"
                            >
                              <span>{item.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                  <div className="pt-4 pb-6">
                    <ModeToggle />
                  </div>
                </div>
                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                  {isLoaded && user ? (
                    <Button
                      variant="outline"
                      asChild
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <Link href={LANDING_AUTH_PATHS.appHome}>
                        <span>Dashboard</span>
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className={cn(isScrolled && "lg:hidden")}
                      >
                        <Link href={LANDING_AUTH_PATHS.signIn}>
                          <span>Logg inn</span>
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className={cn(isScrolled && "lg:hidden")}
                      >
                        <Link href={LANDING_AUTH_PATHS.signUp}>
                          <span>Registrer deg</span>
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
