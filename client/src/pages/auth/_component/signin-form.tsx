import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "@/routes/common/routePath";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { setCredentials } from "@/features/auth/authSlice";
import { useAppDispatch } from "@/app/hook";
import { useLoginMutation } from "@/features/auth/authAPI";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

const SignInForm = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // const isLoading = false;
  const [login,{isLoading}] = useLoginMutation();


  

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: FormValues) => {
    // console.log(data);
    // toast.success("Login successful");
    // setTimeout(() => {
    //   navigate(PROTECTED_ROUTES.OVERVIEW);
    // }, 1000);

    login(values)
    .unwrap()
    .then((data: any) => {
      dispatch(setCredentials(data));
      toast.success("Login successful");
      setTimeout(() => {
        navigate(PROTECTED_ROUTES.OVERVIEW);
      }, 1000);
    })
    .catch((error: { data: { message: any; }; }) => {
      console.log(error);
      toast.error(error.data?.message || "Failed to login");
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <div className="grid gap-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const base = import.meta.env.VITE_API_URL;
              window.location.href = `${base}/auth/google`;
            }}
            className="w-full flex items-center gap-2"
          >
            {/* Replace <FcGoogle /> with a suitable alternative or import it */}
            <span className="h-5 w-5">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g>
                  <path d="M21.805 10.023H12.184v3.95h5.561c-.24 1.267-1.454 3.715-5.561 3.715A6.44 6.44 0 0 1 5.555 12c0-1.067.253-2.074.7-2.956a6.418 6.418 0 0 1 5.478-3.49c1.792 0 3.004.76 3.698 1.418l2.54-2.47C15.981 2.9 14.095 2 12.005 2A10 10 0 1 0 21.998 12c0-.68-.069-1.34-.193-1.977z" fill="#FFC107"/>
                  <path d="M3.15 7.345l3.24 2.376A6.443 6.443 0 0 1 12 5.545c1.793 0 3.004.76 3.698 1.417l2.54-2.469C15.981 2.899 14.095 2 12.005 2a10 10 0 0 0-8.852 5.345z" fill="#FF3D00"/>
                  <path d="M12.005 22c2.037 0 3.984-.666 5.478-1.816l-2.537-2.452c-.812.55-1.905.937-2.94.937-2.506 0-4.613-1.693-5.385-4.017l-3.22 2.482C4.003 19.101 7.741 22 12.005 22z" fill="#4CAF50"/>
                  <path d="M21.805 10.023h-1v-.04H12.184v3.95h5.561c-.24 1.267-1.454 3.715-5.561 3.715A6.44 6.44 0 0 1 5.555 12c0-1.067.253-2.074.7-2.956l-.01-.007-3.24-2.376A9.98 9.98 0 0 0 2 12c0 1.68.41 3.262 1.13 4.662l3.22-2.482C7.391 15.307 9.498 17 12.005 17c2.938 0 5.067-1.93 5.561-4.466l-.012-.011H12.185v-3.95h9.619z" fill="#1976D2"/>
                </g>
              </svg>
            </span>
            Continue with Google
          </Button>

          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="!font-normal">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-2">
          <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="!font-normal">Password</FormLabel>
                  <FormControl>
                    <Input placeholder="*******" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={isLoading}  type="submit" className="w-full">
            {isLoading && <Loader className="h-4 w-4 animate-spin" />}
            Login
         </Button>
        </div>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            to={AUTH_ROUTES.SIGN_UP}
            className="underline underline-offset-4"
          >
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
};

export default SignInForm;
