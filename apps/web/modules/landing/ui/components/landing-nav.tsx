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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useUser } from "@clerk/nextjs";
import { AuthAwareLink } from "@/components/auth-aware-link";
import { LandingGradientText } from "@/modules/landing/ui/components/landing-gradient-text";
import {
  LANDING_APP_NAV_LINKS,
  LANDING_AUTH_PATHS,
  LANDING_DESKTOP_NAV_LINKS,
  LANDING_FORSIDE_SECTION_LINKS,
  LANDING_MARKETING_PAGE_LINKS,
} from "@/modules/landing/constants";

function LandingNavProfileMenu({
  displayName,
  email,
  imageUrl,
  initials,
  triggerClassName,
  denseTrigger,
  avatarOnly,
}: {
  displayName: string;
  email?: string | null;
  imageUrl?: string | null;
  initials: string;
  triggerClassName?: string;
  /** Kun navn + avatar i feltet (passer bedre i header-raden). */
  denseTrigger?: boolean;
  /** Kun avatar-knapp (desktop helt til høyre). */
  avatarOnly?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          avatarOnly &&
            "flex size-9 shrink-0 items-center justify-center rounded-full border border-border/50 bg-background/90 p-0 shadow-sm backdrop-blur-xl transition hover:border-primary/35 hover:shadow-md data-[state=open]:border-primary/40 data-[state=open]:ring-2 data-[state=open]:ring-primary/25",
          !avatarOnly && "flex items-center gap-2",
          triggerClassName,
        )}
        aria-label={
          avatarOnly
            ? `Bruker: ${displayName}. Åpne konto-meny.`
            : undefined
        }
      >
        <Avatar
          className={cn(
            "shrink-0 shadow-sm ring-[3px] ring-background",
            avatarOnly ? "size-9" : "size-8",
          )}
        >
          <AvatarImage src={imageUrl ?? undefined} alt="" />
          <AvatarFallback
            className={cn(
              "bg-primary/15 font-semibold text-primary",
              avatarOnly ? "text-sm" : "text-xs",
            )}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        {!avatarOnly ? (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {displayName}
              </span>
              {email && !denseTrigger ? (
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {email}
                </span>
              ) : null}
            </span>
            <ChevronDown
              className="size-4 shrink-0 text-muted-foreground opacity-70 transition-transform duration-200 group-data-[state=open]:rotate-180"
              aria-hidden
            />
          </>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[min(calc(100vw-2rem),18rem)] overflow-hidden rounded-2xl border border-border/60 bg-background/95 p-0 shadow-xl backdrop-blur-xl"
      >
        <div className="border-b border-border/50 bg-gradient-to-br from-primary/[0.08] via-transparent to-transparent px-4 py-4 dark:from-primary/[0.12]">
          <div className="flex items-center gap-3">
            <Avatar className="size-11 ring-2 ring-primary/20">
              <AvatarImage src={imageUrl ?? undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">
                <LandingGradientText>{displayName}</LandingGradientText>
              </p>
              {email ? (
                <p className="mt-1 truncate text-xs text-muted-foreground">{email}</p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="p-1.5">
          <DropdownMenuItem className="p-0">
            <Link
              href={LANDING_AUTH_PATHS.appHome}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm"
            >
              <User className="size-4 text-primary" aria-hidden />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-0">
            <Link
              href="/"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm"
            >
              <Settings className="size-4 text-primary" aria-hidden />
              Hjem
            </Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const landingNavBarLinkClass =
  "inline-flex items-center rounded-md px-2 py-1.5 text-sm whitespace-nowrap text-muted-foreground duration-150 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const landingNavDropdownTriggerClass =
  "inline-flex cursor-pointer items-center gap-1 rounded-md border-0 bg-transparent p-0 whitespace-nowrap text-muted-foreground duration-150 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const LANDING_NAV_MORE_HELP_LINKS = LANDING_DESKTOP_NAV_LINKS.filter(
  (item) => item.name !== "Priser",
);

const LANDING_NAV_PRICING_HREF =
  LANDING_DESKTOP_NAV_LINKS.find((item) => item.name === "Priser")?.href ?? "/#pricing";

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

  const userEmail = user?.primaryEmailAddress?.emailAddress;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-2">
        <div
          className={cn(
            "mx-auto mt-3 flex w-full max-w-7xl items-center gap-2 px-4 transition-all duration-500 md:gap-2.5 md:px-6 lg:px-10",
            isScrolled && "max-w-5xl lg:px-6",
          )}
        >
          <nav
            data-state={menuState && "active"}
            aria-label="Hovednavigasjon"
            className={cn(
              "flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-border/50 bg-background/75 px-4 py-3 shadow-sm backdrop-blur-xl md:px-6 lg:px-10",
              "lg:gap-0 lg:py-4",
              isScrolled &&
                "border-border/60 bg-background/85 shadow-md lg:px-6",
            )}
          >
            <div className="flex flex-col gap-3 lg:gap-0">
              <div className="flex items-center justify-between gap-3 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-6">
                <Link
                  href="/"
                  aria-label="Agenci - Gå til hjemmeside"
                  className="flex min-w-0 shrink-0 items-center space-x-2"
                >
                  <Logo />
                </Link>

                <nav
                  className="hidden min-w-0 lg:flex lg:justify-center"
                  aria-label="Markedsføringslenker"
                >
                  <ul
                    role="menubar"
                    className={cn(
                      "flex items-center text-sm",
                      isScrolled ? "gap-2 xl:gap-3" : "gap-3 xl:gap-5",
                    )}
                  >
                  {LANDING_MARKETING_PAGE_LINKS.map((item) => (
                    <li key={item.href} role="none">
                      <Link href={item.href} className={landingNavBarLinkClass}>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                  <li role="none">
                    <Link href={LANDING_NAV_PRICING_HREF} className={landingNavBarLinkClass}>
                      Priser
                    </Link>
                  </li>
                  <li role="none">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={landingNavDropdownTriggerClass}
                        aria-label="Mer: seksjoner, hjelp og app"
                        aria-haspopup="menu"
                      >
                        <span>Mer</span>
                        <ChevronDown className="size-4 opacity-80" aria-hidden="true" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="center"
                        sideOffset={10}
                        className="w-[min(calc(100vw-2rem),22rem)] rounded-2xl border bg-background/95 p-3 shadow-lg backdrop-blur-xl sm:w-[min(calc(100vw-2rem),36rem)]"
                      >
                        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                          <div>
                            <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              På forsiden
                            </DropdownMenuLabel>
                            <div className="mt-1 flex flex-col gap-0.5">
                              {LANDING_FORSIDE_SECTION_LINKS.map((item) => (
                                <DropdownMenuItem key={item.href} className="p-0">
                                  <Link
                                    href={item.href}
                                    className="flex w-full rounded-xl px-3 py-2 text-sm"
                                  >
                                    {item.name}
                                  </Link>
                                </DropdownMenuItem>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-4">
                            <div>
                              <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Hjelp
                              </DropdownMenuLabel>
                              <div className="mt-1 flex flex-col gap-0.5">
                                {LANDING_NAV_MORE_HELP_LINKS.map((item) => (
                                  <DropdownMenuItem key={item.name} className="p-0">
                                    <Link
                                      href={item.href}
                                      className="flex w-full rounded-xl px-3 py-2 text-sm"
                                    >
                                      {item.name}
                                    </Link>
                                  </DropdownMenuItem>
                                ))}
                              </div>
                            </div>
                            <DropdownMenuSeparator className="max-sm:hidden" />
                            <div>
                              <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                I appen
                              </DropdownMenuLabel>
                              <p className="px-3 pb-1 text-xs text-muted-foreground">
                                Krever innlogging
                              </p>
                              <div className="flex flex-col gap-0.5">
                                {LANDING_APP_NAV_LINKS.map((item) => (
                                  <DropdownMenuItem key={item.loggedInHref} className="p-0">
                                    <AuthAwareLink
                                      href={item.href}
                                      loggedInHref={item.loggedInHref}
                                      className="flex w-full rounded-xl px-3 py-2 text-sm"
                                    >
                                      {item.name}
                                    </AuthAwareLink>
                                  </DropdownMenuItem>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                </ul>
                </nav>

                <div className="flex shrink-0 items-center justify-end gap-2">
                  <div
                    className={cn(
                      "hidden items-center lg:flex",
                      isScrolled ? "gap-1.5" : "gap-2",
                    )}
                  >
                    <ModeToggle />
                    {isLoaded && user ? (
                      <Button variant="outline" size="sm" asChild className="shrink-0">
                        <Link href={LANDING_AUTH_PATHS.appHome}>Dashboard</Link>
                      </Button>
                    ) : isLoaded ? (
                      <>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={LANDING_AUTH_PATHS.signIn}>Logg inn</Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link href={LANDING_AUTH_PATHS.signUp}>Registrer deg</Link>
                        </Button>
                      </>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => setMenuState(!menuState)}
                    aria-label={menuState ? "Lukk meny" : "Åpne mobilmeny"}
                    aria-expanded={menuState}
                    aria-controls="mobile-menu"
                    className="relative z-20 -m-2 -mr-1 block cursor-pointer rounded-md p-2.5 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
              </div>

              <div
                id="mobile-menu"
                className="mt-1 hidden w-full flex-col gap-6 rounded-3xl border border-border/50 bg-background/95 p-5 shadow-xl shadow-zinc-300/15 backdrop-blur-md in-data-[state=active]:flex dark:shadow-none lg:hidden"
              >
                  <ul role="menu" className="space-y-6 text-base">
                    <li>
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Kom i gang
                      </p>
                      <ul className="mt-4 space-y-3">
                        {LANDING_MARKETING_PAGE_LINKS.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className="block text-muted-foreground duration-150 hover:text-accent-foreground"
                            >
                              <span>{item.name}</span>
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            href={LANDING_NAV_PRICING_HREF}
                            className="block text-muted-foreground duration-150 hover:text-accent-foreground"
                          >
                            <span>Priser</span>
                          </Link>
                        </li>
                      </ul>
                    </li>
                    <li className="pt-2">
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        På forsiden
                      </p>
                      <ul className="mt-4 space-y-3">
                        {LANDING_FORSIDE_SECTION_LINKS.map((item) => (
                          <li key={item.href}>
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
                        Hjelp
                      </p>
                      <ul className="mt-4 space-y-3">
                        {LANDING_NAV_MORE_HELP_LINKS.map((item) => (
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
                        I appen
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Krever innlogging</p>
                      <ul className="mt-3 space-y-3">
                        {LANDING_APP_NAV_LINKS.map((item) => (
                          <li key={item.loggedInHref}>
                            <AuthAwareLink
                              href={item.href}
                              loggedInHref={item.loggedInHref}
                              className="block text-muted-foreground duration-150 hover:text-accent-foreground"
                            >
                              <span>{item.name}</span>
                            </AuthAwareLink>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                  <div className="pt-2 pb-2">
                    <ModeToggle />
                  </div>
                <div className="flex w-full flex-col gap-3 border-t border-border/40 pt-5">
                  {isLoaded && user ? (
                    <LandingNavProfileMenu
                      displayName={userDisplayName}
                      email={userEmail}
                      imageUrl={user.imageUrl}
                      initials={userInitials}
                      triggerClassName="flex w-full items-center gap-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-card/90 to-primary/[0.06] p-3 shadow-sm backdrop-blur-sm transition-colors hover:border-primary/35 hover:to-primary/[0.1] dark:from-card/50 dark:to-primary/[0.1]"
                    />
                  ) : isLoaded ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                      <Button asChild variant="outline" size="sm" className="w-full sm:flex-1">
                        <Link href={LANDING_AUTH_PATHS.signIn}>Logg inn</Link>
                      </Button>
                      <Button asChild size="sm" className="w-full sm:flex-1">
                        <Link href={LANDING_AUTH_PATHS.signUp}>Registrer deg</Link>
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </nav>

          {isLoaded && user ? (
            <div className="hidden shrink-0 items-center lg:flex">
              <LandingNavProfileMenu
                displayName={userDisplayName}
                email={userEmail}
                imageUrl={user.imageUrl}
                initials={userInitials}
                avatarOnly
              />
            </div>
          ) : null}
        </div>
      </header>
    </>
  );
}
