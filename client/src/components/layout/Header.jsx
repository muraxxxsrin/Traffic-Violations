import React from "react";
import { TextScramble } from "../ui/TextScramble";
import AnimatedBackground from "../ui/AnimatedBackground";
import { FlowButton } from "../ui/FlowButton";
import { DestructiveButton } from "../ui/DestructiveButton";

const Header = ({ currentPath = "/", onNavigate, currentUser, onSignOut }) => {
    const NAV_LINKS = [
        { id: "home", label: "Home", path: "/" },
        { id: "features", label: "Features", path: "/features" },
        { id: "about", label: "About", path: "/about" },
        { id: "dashboard", label: "Dashboard", path: "/dashboard" },
    ];

    const activeTab = currentPath === "/dashboard"
        ? "dashboard"
        : currentPath === "/about"
            ? "about"
        : currentPath === "/features"
            ? "features"
            : "home";

    return (
        <>
            <div className="header-top">
                <div className="title-area" style={{ textAlign: "left" }}>
                    <h1
                        className="site-title"
                        onClick={() => onNavigate?.("/")}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                onNavigate?.("/");
                            }
                        }}
                        role="button"
                        tabIndex={0}
                    >
                        RedLight - Realtime{" "}
                        <TextScramble 
                            duration={1.5} 
                            characterSet="0123456789ABCDEF" 
                            className="text-emerald-600"
                            loop={true} 
                            pauseTime={80000} 
                        >
                        Monitoring System
                        </TextScramble>
                    </h1>
                    <p className="initiative">An initiative by SIST students</p>
                </div>
            </div>

            <div className="warning-banner" style={{ display: "none" }}>
                <b>
                    Important Notice: Please beware of fraudulent websites and mobile apps impersonating our echallan services. Access our portal only through echallan.parivahan.gov.in
                </b>
            </div>
            <div className="border-t border-zinc-200 bg-[#fff7f2] px-6 py-3">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                    <div className="inline-flex items-center rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
                        <AnimatedBackground
                            key={activeTab}
                            defaultValue={activeTab}
                            className="rounded-lg bg-zinc-900 shadow-sm"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                        >
                            {NAV_LINKS.map((link) => (
                                <button
                                    key={link.id}
                                    data-id={link.id}
                                    onClick={() => onNavigate?.(link.path)}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:text-zinc-900 data-[checked=true]:text-white"
                                >
                                    {link.label}
                                </button>
                            ))}
                        </AnimatedBackground>
                    </div>

                    {currentUser ? (
                        <div className="flex items-center gap-4 text-sm">
                            <span className="header-user-pill">{currentUser.name}</span>
                            <DestructiveButton className="header-signout-btn" onClick={onSignOut}>
                                Sign Out
                            </DestructiveButton>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 text-sm">
                            <FlowButton
                                text="Sign In"
                                variant="light"
                                size="sm"
                                showArrow={false}
                                onClick={() => onNavigate?.("/signin")}
                            />
                            <FlowButton
                                text="Sign Up"
                                variant="orange"
                                size="sm"
                                showArrow={false}
                                onClick={() => onNavigate?.("/signup")}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Header;
