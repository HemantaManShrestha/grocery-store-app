import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Store, Mail, Lock, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Auth() {
    const { storeId } = useParams();
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [mode, setMode] = useState('login'); // 'login', 'signup', 'forgot_password'

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        // Pseudo-email for Supabase Auth bypass on MVP
        const pseudoEmail = `${phone}@${storeId}.grocery.app`;

        try {
            if (mode === 'signup') {
                const { data, error } = await supabase.auth.signUp({
                    email: pseudoEmail,
                    password,
                });
                if (error) throw error;
                setMessage('Account created! You can now sign in.');
                setMode('login'); // Auto-switch to login after signup since we bypass email confirmations
            } else if (mode === 'login') {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: pseudoEmail,
                    password,
                });
                if (error) throw error;

                // Redirect to admin page after successful login
                navigate(`/store/${storeId}/admin`);
            } else if (mode === 'forgot_password') {
                // Because we use a pseudo-email for phone numbers, real emails are not sent. 
                // We prompt to contact Super Admin (or use Superadmin dash).
                setError('Password reset link cannot be sent via SMS directly in this demo. Please contact the Superadmin to reset your password.');
            }
        } catch (err) {
            setError(err.message || 'An error occurred during authentication.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                        <Store className="w-8 h-8 text-primary-600" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {mode === 'login' ? 'Sign in to your store' :
                        mode === 'signup' ? 'Create a new account' : 'Reset your password'}
                </h2>
                {storeId && (
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Managing Store: <span className="font-semibold text-primary-600">{storeId}</span>
                    </p>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100"
                >
                    <form className="space-y-6" onSubmit={handleAuth}>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded-md">
                                <div className="flex items-center">
                                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        )}

                        {message && (
                            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4 rounded-md">
                                <p className="text-sm text-green-700">{message}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 font-bold px-1">+977</span>
                                </div>
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-14 sm:text-sm border-gray-300 rounded-md py-3 bg-gray-50"
                                    placeholder="98XXXXXXXX"
                                />
                            </div>
                        </div>

                        {mode !== 'forgot_password' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 bg-gray-50"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        )}

                        {mode === 'login' && (
                            <div className="flex items-center justify-end">
                                <div className="text-sm">
                                    <button type="button" onClick={() => setMode('forgot_password')} className="font-medium text-primary-600 hover:text-primary-500">
                                        Forgot your password?
                                    </button>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Processing...' : (
                                    mode === 'login' ? 'Sign in' :
                                        mode === 'signup' ? 'Sign up' :
                                            'Send reset instructions'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3">
                            {mode === 'login' ? (
                                <button
                                    type="button"
                                    onClick={() => setMode('signup')}
                                    className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Create new account <ArrowRight className="ml-2 w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setMode('login')}
                                    className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <ArrowLeft className="mr-2 w-4 h-4" /> Back to sign in
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
