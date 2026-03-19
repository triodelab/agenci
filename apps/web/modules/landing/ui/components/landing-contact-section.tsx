"use client";

import { LANDING_SECTION_IDS } from "@/modules/landing/constants";
import { useState } from "react";
import { Button } from '@workspace/ui/components/button'
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from '@workspace/ui/components/textarea'
import { AnimatedGroup } from '@workspace/ui/components/animated-group'
import { TextEffect } from '@workspace/ui/components/text-effect'
import { Mail, Phone, MessageSquare } from 'lucide-react'
import { motion, useReducedMotion } from "motion/react";

const transitionVariants = {
    item: {
        hidden: { opacity: 0, filter: 'blur(12px)', y: 16 },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: { type: 'spring' as const, bounce: 0.25, duration: 1.2 },
        },
    },
}

export function LandingContactSection() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const reduced = useReducedMotion();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const form = e.target as HTMLFormElement
        const formData = new FormData(form)

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    phone: formData.get('phone') || undefined,
                    subject: formData.get('subject'),
                    message: formData.get('message'),
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error ?? 'Kunne ikke sende')
            }

            setSubmitted(true)
            form.reset()
            setTimeout(() => setSubmitted(false), 5000)
        } catch (err) {
            console.error(err)
            alert(err instanceof Error ? err.message : 'Noe gikk galt. Prøv igjen.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section
          id={LANDING_SECTION_IDS.contact}
          aria-labelledby="contact-heading"
          className="relative overflow-hidden bg-background py-24 md:py-36"
        >
            <div
                aria-hidden
                className="landing-section-mesh pointer-events-none absolute inset-0 -z-10 opacity-50"
            />
            <div
                aria-hidden
                className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_0%,transparent_0%,var(--color-background)_78%)]"
            />

            <div className="mx-auto max-w-6xl px-6">
<div id="contact-heading" className="mx-auto mb-14 max-w-3xl text-center md:mb-16">
                    <AnimatedGroup variants={transitionVariants}>
                        <TextEffect
                            preset="fade-in-blur"
                            speedSegment={0.3}
                            as="h2"
                            className="text-balance text-4xl font-semibold tracking-tight lg:text-[2.75rem]"
                        >
                            Ta kontakt med oss
                        </TextEffect>
                        <TextEffect
                            per="line"
                            preset="fade-in-blur"
                            speedSegment={0.3}
                            delay={0.35}
                            as="p"
                            className="mt-6 text-balance text-lg text-muted-foreground"
                        >
                            Har du spørsmål eller vil du booke en demo? Send oss en melding, så tar vi kontakt så snart som mulig.
                        </TextEffect>
                    </AnimatedGroup>
                </div>

                <div className="mx-auto max-w-2xl">
                    <motion.div
                        className="rounded-[2rem] bg-gradient-to-br from-primary/20 via-border/70 to-violet-500/15 p-[1px] shadow-[0_28px_90px_-40px_rgba(15,23,42,0.2)] dark:from-primary/25 dark:shadow-[0_28px_90px_-40px_rgba(0,0,0,0.45)]"
                        initial={reduced ? false : { opacity: 0, y: 24, scale: 0.98 }}
                        whileInView={reduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.48 }}
                    >
                        <div className="rounded-[calc(2rem-1px)] bg-card p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6" aria-label="Kontaktskjema">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium">
                                        Navn
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Ditt navn"
                                        required
                                        aria-required="true"
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">
                                        E-post
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="din@epost.no"
                                        required
                                        aria-required="true"
                                        autoComplete="email"
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-medium">
                                    Telefon (valgfritt)
                                </Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="+47 988 46 460"
                                    autoComplete="tel"
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject" className="text-sm font-medium">
                                    Emne
                                </Label>
                                <Input
                                    id="subject"
                                    name="subject"
                                    type="text"
                                    placeholder="F.eks. Booking av demo, Support, eller generell henvendelse"
                                    required
                                    aria-required="true"
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message" className="text-sm font-medium">
                                    Melding
                                </Label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    placeholder="Fortell oss litt om hva du trenger hjelp med..."
                                    required
                                    aria-required="true"
                                    rows={6}
                                    className="w-full resize-none"
                                />
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full rounded-xl shadow-md"
                                disabled={isSubmitting || submitted}
                                aria-busy={isSubmitting}
                                aria-live="polite"
                            >
                                {isSubmitting ? (
                                    <span>Sender...</span>
                                ) : submitted ? (
                                    <span className="flex items-center gap-2">
                                        <MessageSquare className="size-4" aria-hidden />
                                        Sendt! Vi tar kontakt snart.
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Mail className="size-4" aria-hidden />
                                        Send melding
                                    </span>
                                )}
                            </Button>
                        </form>
                        </div>
                    </motion.div>

                    <div className="mt-8 grid gap-4 text-center md:grid-cols-3 [&>*]:h-full">
                        <motion.div
                            className="flex h-full min-h-[120px] flex-col items-center justify-center rounded-2xl border border-border/55 bg-card/80 p-5 shadow-sm transition-all hover:border-border hover:shadow-md"
                            initial={reduced ? false : { opacity: 0, y: 16 }}
                            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.35, delay: 0.05 }}
                        >
                            <Mail className="mx-auto mb-2 size-5 text-muted-foreground shrink-0" aria-hidden />
                            <p className="text-sm font-medium">E-post</p>
                            <p className="text-muted-foreground mt-1 text-sm">post@triodelab.no</p>
                        </motion.div>
                        <motion.div
                            className="flex h-full min-h-[120px] flex-col items-center justify-center rounded-2xl border border-border/55 bg-card/80 p-5 shadow-sm transition-all hover:border-border hover:shadow-md"
                            initial={reduced ? false : { opacity: 0, y: 16 }}
                            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.35, delay: 0.1 }}
                        >
                            <Phone className="mx-auto mb-2 size-5 text-muted-foreground shrink-0" aria-hidden />
                            <p className="text-sm font-medium">Telefon</p>
                            <p className="text-muted-foreground mt-1 text-sm">+47 988 46 460</p>
                        </motion.div>
                        <motion.div
                            className="flex h-full min-h-[120px] flex-col items-center justify-center rounded-2xl border border-border/55 bg-card/80 p-5 shadow-sm transition-all hover:border-border hover:shadow-md"
                            initial={reduced ? false : { opacity: 0, y: 16 }}
                            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.35, delay: 0.15 }}
                        >
                            <MessageSquare className="mx-auto mb-2 size-5 text-muted-foreground shrink-0" aria-hidden />
                            <p className="text-sm font-medium">Respons</p>
                            <p className="text-muted-foreground mt-1 text-sm">Innen 24 timer</p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
