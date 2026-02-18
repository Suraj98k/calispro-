'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';



import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLoginMutation } from '@/lib/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';



const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});



export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || undefined;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const { mutate: login, isPending } = useLoginMutation({ callbackUrl });

  function onSubmit(values: z.infer<typeof formSchema>) {
    login(values);
  }

  return (
    <div className="flex min-h-screen">
      {/* ─── Image Side ─── */}
      <div className="relative hidden w-0 flex-1 overflow-hidden lg:block lg:w-1/2">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src="https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=2070&auto=format&fit=crop"
            alt="Calisthenics athlete training"
            fill
            className="object-cover grayscale brightness-50"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-80" />
        </motion.div>

        <div className="absolute inset-0 flex flex-col justify-end p-12 tracking-tight">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Dumbbell className="h-5 w-5" />
            </div>
            <h2 className="text-4xl font-black text-white md:text-5xl lg:text-6xl">
              STRENGTH IS <br />
              <span className="text-primary italic">EARNED.</span>
            </h2>
            <p className="mt-4 max-w-md text-lg font-medium text-white/60">
              &quot;The limit is not the sky. The limit is the mind.&quot;
            </p>
          </motion.div>
        </div>
      </div>

      {/* ─── Form Side ─── */}
      <section className="flex flex-1 flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-12 xl:px-24">
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto w-full max-w-sm"
        >
          <div className="lg:hidden mb-10 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Dumbbell className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold">Calispro</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="mt-2 text-sm text-soft">Log in to your command center to continue your training.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-soft">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="h-12 rounded-xl border-border bg-surface-2 transition-all focus:border-primary/40 focus:ring-4 focus:ring-primary/5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-soft">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-12 rounded-xl border-border bg-surface-2 transition-all focus:border-primary/40 focus:ring-4 focus:ring-primary/5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isPending}
                className="h-12 w-full rounded-xl bg-primary text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] hover:brightness-110 active:scale-95 disabled:opacity-70"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <Spinner />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Access Dashboard'
                )}
              </Button>
            </form>
          </Form>

          <p className="mt-8 text-center text-sm text-soft">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-bold text-primary hover:underline underline-offset-4">
              Join the Modality
            </Link>
          </p>
        </motion.div>
      </section>
    </div>
  );
}
