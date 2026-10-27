import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    UserStar,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';
import LoginImage from "@/assets/LoginBGI.jpg";
import Logo from "@/assets/Logo.png";
import { LoginSchema } from "@/schemas/AuthSchema";
import { AdminLogin } from "@/services/AuthService";

const Login = ({ className, ...props }) => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        if (token) {
            navigate("/dashboard", { replace: true });
        }
    }, [navigate]);

    const loginMutation = useMutation({
        mutationFn: (values) => AdminLogin(values),
        onSuccess: (data) => {
            localStorage.setItem("admin_token", data.token);
            localStorage.setItem("admin", JSON.stringify(data.admin));
            navigate("/dashboard", { replace: true });
        },
        onError: (err) => {
            if (err.response?.status === 422) {
                const validationErrors = err.response.data.errors;
                if (validationErrors) {
                    Object.entries(validationErrors).forEach(([key, messages]) => {
                        form.setFieldMeta(key, (meta) => ({
                            ...meta,
                            errorMap: { onSubmit: messages[0] },
                        }));
                    });
                } else {
                    toast.error(err.response.data.message || "Validation failed.");
                }
            } else if (err.response?.status === 401) {
                toast.error(err.response.data.message || "Invalid email or password.");
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        },
    });

    const form = useForm({
        defaultValues: {
            username: "",
            password: "",
        },
        onSubmit: async ({ value }) => {
            const result = LoginSchema.safeParse(value);
            if (!result.success) {
                result.error.issues.forEach((issue) => {
                    form.setFieldMeta(issue.path[0], (meta) => ({
                        ...meta,
                        errorMap: { onSubmit: issue.message },
                    }));
                });
                return;
            }
            await loginMutation.mutateAsync(result.data);
        },
    });

    return (
        <div className={cn("relative w-screen h-screen overflow-hidden", className)} {...props}>
            <div className="absolute inset-0 z-0">
                <img
                    src={LoginImage}
                    alt="login background image"
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-6 md:p-10 z-10 backdrop-blur-xs">
                <div className="w-full max-w-sm md:max-w-4xl">
                    <Card className="overflow-hidden p-0 bg-background/95 shadow-2xl">
                        <CardContent className="bg-[#f2f4f4] grid p-0 md:grid-cols-2">
                            <form
                                className="p-6 md:p-8"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    form.handleSubmit();
                                }}
                            >
                                <FieldGroup>
                                    <div className="flex flex-col items-center gap-2 text-center">
                                        <h1 className="text-2xl font-bold">Welcome back, Admin</h1>
                                        <p className="text-balance text-muted-foreground">
                                            Login to your registered account
                                        </p>
                                    </div>

                                    <form.Field
                                        name="username"
                                        validators={{
                                            onChange: ({ value }) =>
                                                !value ? "Username is required" : undefined,
                                        }}
                                    >
                                        {(field) => (
                                            <Field>
                                                <FieldLabel htmlFor="username">Username</FieldLabel>
                                                <InputGroup>
                                                    <InputGroupInput
                                                        id="username"
                                                        type="text"
                                                        autoComplete="off"
                                                        placeholder="Juan.DelaCruz101"
                                                        value={field.state.value}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        onBlur={field.handleBlur}
                                                        required
                                                    />
                                                    <InputGroupAddon><UserStar /></InputGroupAddon>
                                                </InputGroup>
                                                {field.state.meta.errors.length > 0 && (
                                                    <FieldDescription className="text-destructive">
                                                        {field.state.meta.errors[0]}
                                                    </FieldDescription>
                                                )}
                                            </Field>
                                        )}
                                    </form.Field>

                                    <form.Field
                                        name="password"
                                        validators={{
                                            onChange: ({ value }) =>
                                                !value ? "Password is required" : undefined,
                                        }}
                                    >
                                        {(field) => (
                                            <Field>
                                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                                <InputGroup>
                                                    <InputGroupInput
                                                        id="password"
                                                        type={showPassword ? "text" : "password"}
                                                        autoComplete="off"
                                                        placeholder="• • • • • • • •"
                                                        value={field.state.value}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        onBlur={field.handleBlur}
                                                        required
                                                    />
                                                    <InputGroupAddon><Lock /></InputGroupAddon>
                                                    <InputGroupAddon align="inline-end">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    aria-label="Toggle password visibility"
                                                                    onClick={() => setShowPassword((prev) => !prev)}
                                                                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                                                                >
                                                                    {showPassword ? (
                                                                        <EyeOff className="w-5 h-5" />
                                                                    ) : (
                                                                        <Eye className="w-5 h-5" />
                                                                    )}
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{showPassword ? 'Hide password' : 'Show password'}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </InputGroupAddon>
                                                </InputGroup>
                                                {field.state.meta.errors.length > 0 && (
                                                    <FieldDescription className="text-destructive">
                                                        {field.state.meta.errors[0]}
                                                    </FieldDescription>
                                                )}
                                            </Field>
                                        )}
                                    </form.Field>

                                    {loginMutation.isError && (
                                        <FieldDescription className="text-destructive text-center">
                                            {loginMutation.error?.response?.status === 401
                                                ? "Invalid username or password"
                                                : "Something went wrong. Please try again."}
                                        </FieldDescription>
                                    )}

                                    <Field>
                                        <form.Subscribe
                                            selector={(state) => [state.canSubmit, state.isSubmitting]}
                                        >
                                            {([canSubmit]) => (
                                                <Button
                                                    type="submit"
                                                    className="bg-[#3e963f] hover:bg-[#3e963f]"
                                                    disabled={!canSubmit || loginMutation.isPending}
                                                >
                                                    {loginMutation.isPending ? "Logging in..." : "Login"}
                                                </Button>
                                            )}
                                        </form.Subscribe>
                                    </Field>
                                </FieldGroup>
                            </form>

                            <div className="relative hidden bg-[#0b7a3b] text-teal-50 md:flex md:flex-col md:items-center md:justify-center p-8 text-center space-y-4">
                                <div className="h-35 w-35 rounded-full shadow-inner">
                                    <img src={Logo} alt="tagnao-logo" />
                                </div>
                                <div className="space-y-2 max-w-sm">
                                    <h2 className="text-2xl font-bold tracking-tight text-white">
                                        Welcome to Tagnao Elementary School
                                    </h2>
                                    <p className="text-sm text-teal-100/90 leading-relaxed">
                                        School Records Management System
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default Login