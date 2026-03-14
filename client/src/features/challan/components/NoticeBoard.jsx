import React from "react";
import { Stars, Rocket, Heart, Sun, Cloud, Target, Compass, ThumbsUp, Headphones, Calendar } from "lucide-react";

const NoticeBoard = () => {
    const icons = [Stars, Rocket, Heart, Sun, Cloud, Target, Compass, ThumbsUp, Headphones, Calendar];

    return (
        <div className="notice-board-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
            <div style={{ maxWidth: '28rem', width: '100%', textAlign: 'center' }}>
                {/* Add keyframe animation inside the component */}
                <style>
                    {`
                        @keyframes fadeInOut {
                            0% { opacity: 0; }
                            50% { opacity: 1; }
                            100% { opacity: 0; }
                        }
                    `}
                </style>

                {/* Animated Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.5rem', maxWidth: '180px', margin: '0 auto' }}>
                    {[...Array(9)].map((_, i) => {
                        const Icon = icons[i];
                        return (
                            <div
                                key={i}
                                style={{
                                    width: '3.5rem',
                                    height: '3.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '9999px',
                                    backgroundColor: '#FFF5F0',
                                    opacity: 0,
                                    animation: `fadeInOut 3s ease-in-out infinite ${i * 0.5}s`,
                                }}
                            >
                                <Icon width={24} height={24} color="#FF7043" style={{ opacity: 0.8 }} />
                            </div>
                        );
                    })}
                </div>

                {/* Title & Subtitle */}
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>RedLight System</h2>
                <p style={{ color: '#666' }}>Always Active & Monitoring</p>
            </div>
        </div>
    );
};

export default NoticeBoard;
