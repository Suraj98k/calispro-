'use client';

import Link from 'next/link';
import Image from 'next/image';
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
import { useSignupMutation } from '@/lib/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';



const formSchema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Enter a valid email address.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function SignupPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema as never),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });


  const { mutate: signup, isPending } = useSignupMutation();

  function onSubmit(values: z.infer<typeof formSchema>) {
    signup({
      name: values.name,
      email: values.email,
      password: values.password,
    });
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
            src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1974&auto=format&fit=crop"
            alt="Calisthenics rings"
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
              BEGIN YOUR <br />
              <span className="text-primary italic">EVOLUTION.</span>
            </h2>
            <p className="mt-4 max-w-md text-lg font-medium text-white/60">
              &quot;The journey of a thousand miles begins with a single rep.&quot;
            </p>
          </motion.div>
        </div>
      </div>

      {/* ─── Form Side ─── */}
      <section className="flex flex-1 flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-12 xl:px-24">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
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
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h1>
            <p className="mt-2 text-sm text-soft">Start your calisthenics journey with elite tools.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-soft">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
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
                        placeholder="Create password"
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
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-soft">Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm password"
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
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Sign up'
                )}
              </Button>
            </form>
          </Form>

          <p className="mt-8 text-center text-sm text-soft">
            Already registered?{' '}
            <Link href="/login" className="font-bold text-primary hover:underline underline-offset-4">
              Log in instead
            </Link>
          </p>
        </motion.div>
      </section>
    </div>
  );
}
