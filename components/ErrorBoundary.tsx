import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    errorId: string | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
    public state: State = {
        hasError: false,
        errorId: null,
    };

    public static getDerivedStateFromError(): State {
        const errorId = Math.random().toString(36).substring(2, 8).toUpperCase();
        return { hasError: true, errorId };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log non-sensitive error info only
        console.error('[BookAIO] Erreur non gérée:', error.name, '| Component:', errorInfo.componentStack?.split('\n')[1]?.trim());
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center px-6 bg-black">
                    <div className="text-center space-y-6 max-w-md">
                        <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                            <span className="text-4xl">⚡</span>
                        </div>
                        <h1 className="text-3xl font-serif font-bold">Une erreur est survenue</h1>
                        <p className="text-white/40 text-sm leading-relaxed">
                            BookAIO a rencontré un problème inattendu. Rechargez la page pour continuer.
                        </p>
                        <p className="text-white/20 text-[10px] font-mono uppercase tracking-widest">
                            Ref: {this.state.errorId}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-4 rounded-2xl gradient-amber text-white font-bold text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-red-500/20"
                        >
                            Recharger l'application
                        </button>
                    </div>
                </div>
            );
        }

        return <>{this.props.children}</>;
    }
}

// Export as a functional wrapper to avoid class component typing quirks
export const ErrorBoundary: React.FC<Props> = ({ children }) => (
    <ErrorBoundaryClass>{children}</ErrorBoundaryClass>
);
