import React, { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/auth';
import { Navigate, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import { EmailAuthForm } from './components/EmailAuthForm';

const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        user_name: '',
        email: '',
        password: '',
    });
    const { googleLogin, setAuth, error, setError, isAuthenticated, isLoading } = useAuthStore();
    const navigate = useNavigate();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const endpoint = isLogin ? '/signin' : '/signup';
            const { ok, data } = await apiFetch(`/auth${endpoint}`, {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            
            if (ok && data.success) {
                const { user, accessToken } = data.data;
                setAuth(user, accessToken);
                navigate('/');
            } else {
                setError(data.message || 'Authentication failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error(err);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        if (credentialResponse.credential) {
            await googleLogin(credentialResponse.credential);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
            {/* Background Blobs */}
            <div className="bg-blob blob-primary w-96 h-96 -top-48 -left-48"></div>
            <div className="bg-blob blob-accent w-96 h-96 -bottom-48 -right-48"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-96 z-10"
            >
                <div className="text-center mb-8">
                    <motion.div 
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg mb-4"
                    >
                        <ShieldCheck className="w-10 h-10 text-primary-foreground" />
                    </motion.div>
                    <h1 className="text-4xl font-black italic tracking-tighter mb-2">ARENA AUTH</h1>
                    <p className="text-muted-foreground font-bold tracking-widest text-xs uppercase">Secure entry to the multiplayer platform</p>
                </div>

                <Card className="border-2 shadow-2xl bg-card/50 backdrop-blur-xl">
                    <CardHeader>
                        <div className="flex p-1 bg-secondary/50 rounded-lg border border-border mb-4">
                            <Button 
                                variant={isLogin ? "default" : "ghost"} 
                                className="flex-1 font-black italic tracking-tight"
                                onClick={() => setIsLogin(true)}
                            >
                                <LogIn className="w-4 h-4 mr-2" />
                                SIGN IN
                            </Button>
                            <Button 
                                variant={!isLogin ? "default" : "ghost"} 
                                className="flex-1 font-black italic tracking-tight"
                                onClick={() => setIsLogin(false)}
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                SIGN UP
                            </Button>
                        </div>
                        <CardTitle className="text-xl font-black italic tracking-tight text-center">
                            {isLogin ? 'WELCOME BACK, CHAMPION' : 'RECRUITING NEW TALENT'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <EmailAuthForm 
                            isLogin={isLogin}
                            formData={formData}
                            onChange={handleChange}
                            onSubmit={handleEmailAuth}
                            isLoading={isLoading}
                        />

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
                                <span className="bg-card px-4 text-muted-foreground">OR CONTINUE WITH</span>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <div className="w-full max-w-60 transform hover:scale-[1.02] transition-transform">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setError('Google Login Failed')}
                                    theme="filled_black"
                                    shape="pill"
                                    width="240"
                                />
                            </div>
                        </div>
                    </CardContent>
                    {error && (
                        <div className="px-6 pb-4">
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold text-center"
                            >
                                {error}
                            </motion.div>
                        </div>
                    )}
                    <CardFooter className="border-t border-border pt-4 flex flex-col gap-2">
                        <p className="text-xs text-muted-foreground text-center font-bold tracking-widest uppercase">
                            By entering, you agree to our <span className="text-primary underline cursor-pointer">Terms of Combat</span>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
};

export default AuthScreen;
